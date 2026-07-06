import path from "node:path";
import type {
  ExtensionAPI,
  ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import {
  type BashOperations,
  createBashTool,
  createEditTool,
  createReadTool,
  createWriteTool,
  type EditOperations,
  type ReadOperations,
  type WriteOperations,
} from "@earendil-works/pi-coding-agent";
import {
  createHttpHooks,
  MemoryProvider,
  RealFSProvider,
  ShadowProvider,
  VM,
} from "@earendil-works/gondolin";

const GUEST_WORKSPACE = "/workspace";

function splitCsv(value?: string) {
  return (value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function enabled(name: string) {
  return ["1", "true", "yes", "on"].includes(
    (process.env[name] ?? "").toLowerCase(),
  );
}

function shQuote(value: string): string {
  return "'" + value.replace(/'/g, "'\\''") + "'";
}

function toGuestPath(localCwd: string, localPath: string): string {
  const rel = path.relative(localCwd, localPath);
  if (rel === "") return GUEST_WORKSPACE;
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`path escapes workspace: ${localPath}`);
  }
  return path.posix.join(
    GUEST_WORKSPACE,
    rel.split(path.sep).join(path.posix.sep),
  );
}

function isSensitivePath(vfsPath: string) {
  const normalized = path.posix.normalize(
    vfsPath.startsWith("/") ? vfsPath : `/${vfsPath}`,
  );
  const parts = normalized.split("/").filter(Boolean);
  const base = parts.at(-1) ?? "";

  if (
    !enabled("GONDOLIN_EXPOSE_ENV") &&
    (base === ".env" || base.startsWith(".env."))
  ) {
    return true;
  }

  if (!enabled("GONDOLIN_EXPOSE_NPMRC") && base === ".npmrc") return true;

  const blockedNames = new Set([
    ".pypirc",
    ".netrc",
    ".cargo/credentials",
    "id_rsa",
    "id_ed25519",
  ]);
  if (blockedNames.has(base)) return true;

  const blockedDirs = new Set([
    ".ssh",
    ".aws",
    ".azure",
    ".config/gcloud",
    "secrets",
  ]);

  for (const dir of blockedDirs) {
    const dirParts = dir.split("/");
    for (let i = 0; i <= parts.length - dirParts.length; i++) {
      if (dirParts.every((part, j) => parts[i + j] === part)) return true;
    }
  }

  return false;
}

function createWorkspaceProvider(localCwd: string) {
  const base = new RealFSProvider(localCwd);

  const withoutSecrets = new ShadowProvider(base, {
    shouldShadow: ({ path }) => isSensitivePath(path),
    writeMode: "deny",
  });

  // Hide host node_modules from the guest, but allow the guest to create its own
  // in memory. This avoids host/guest architecture mismatch and avoids mutating
  // the host dependency tree during risky installs/tests.
  return new ShadowProvider(withoutSecrets, {
    shouldShadow: ({ path }) => {
      const p = path.startsWith("/") ? path : `/${path}`;
      return p === "/node_modules" || p.startsWith("/node_modules/");
    },
    writeMode: "tmpfs",
    tmpfs: new MemoryProvider(),
  });
}

function createGondolinReadOps(vm: VM, localCwd: string): ReadOperations {
  return {
    readFile: async (p) => {
      const guestPath = toGuestPath(localCwd, p);
      const r = await vm.exec(["/bin/cat", guestPath]);
      if (!r.ok) throw new Error(`cat failed (${r.exitCode}): ${r.stderr}`);
      return r.stdoutBuffer;
    },
    access: async (p) => {
      const guestPath = toGuestPath(localCwd, p);
      const r = await vm.exec([
        "/bin/sh",
        "-lc",
        `test -r ${shQuote(guestPath)}`,
      ]);
      if (!r.ok) throw new Error(`not readable: ${p}`);
    },
    detectImageMimeType: async (p) => {
      const guestPath = toGuestPath(localCwd, p);
      const r = await vm.exec([
        "/bin/sh",
        "-lc",
        `file --mime-type -b ${shQuote(guestPath)} 2>/dev/null || true`,
      ]);
      const mime = r.stdout.trim();
      return ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
        mime,
      )
        ? mime
        : null;
    },
  };
}

function createGondolinWriteOps(vm: VM, localCwd: string): WriteOperations {
  return {
    writeFile: async (p, content) => {
      const guestPath = toGuestPath(localCwd, p);
      const dir = path.posix.dirname(guestPath);
      const b64 = Buffer.from(content, "utf8").toString("base64");
      const script = [
        `set -eu`,
        `mkdir -p ${shQuote(dir)}`,
        `printf %s ${shQuote(b64)} | base64 -d > ${shQuote(guestPath)}`,
      ].join("\n");
      const r = await vm.exec(["/bin/sh", "-lc", script]);
      if (!r.ok) throw new Error(`write failed (${r.exitCode}): ${r.stderr}`);
    },
    mkdir: async (dir) => {
      const guestDir = toGuestPath(localCwd, dir);
      const r = await vm.exec(["/bin/mkdir", "-p", guestDir]);
      if (!r.ok) throw new Error(`mkdir failed (${r.exitCode}): ${r.stderr}`);
    },
  };
}

function createGondolinEditOps(vm: VM, localCwd: string): EditOperations {
  const r = createGondolinReadOps(vm, localCwd);
  const w = createGondolinWriteOps(vm, localCwd);
  return { readFile: r.readFile, access: r.access, writeFile: w.writeFile };
}

function sanitizeEnv(
  env?: NodeJS.ProcessEnv,
): Record<string, string> | undefined {
  if (!env) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    if (
      typeof v === "string" &&
      !/(TOKEN|SECRET|PASSWORD|PASS|KEY|CREDENTIAL)/i.test(k)
    ) {
      out[k] = v;
    }
  }
  return out;
}

function createGondolinBashOps(vm: VM, localCwd: string): BashOperations {
  return {
    exec: async (command, cwd, { onData, signal, timeout, env }) => {
      const guestCwd = toGuestPath(localCwd, cwd);
      const ac = new AbortController();
      const onAbort = () => ac.abort();
      signal?.addEventListener("abort", onAbort, { once: true });

      let timedOut = false;
      const timer =
        timeout && timeout > 0
          ? setTimeout(() => {
              timedOut = true;
              ac.abort();
            }, timeout * 1000)
          : undefined;

      try {
        const proc = vm.exec(["/bin/sh", "-lc", command], {
          cwd: guestCwd,
          signal: ac.signal,
          env: sanitizeEnv(env),
          stdout: "pipe",
          stderr: "pipe",
        });

        for await (const chunk of proc.output()) onData(chunk.data);
        const r = await proc;
        return { exitCode: r.exitCode };
      } catch (err) {
        if (signal?.aborted) throw new Error("aborted");
        if (timedOut) throw new Error(`timeout:${timeout}`);
        throw err;
      } finally {
        if (timer) clearTimeout(timer);
        signal?.removeEventListener("abort", onAbort);
      }
    },
  };
}

export default function (pi: ExtensionAPI) {
  const localCwd = process.cwd();
  const allowedHosts = splitCsv(process.env.GONDOLIN_ALLOW_HOSTS);
  const { httpHooks, env } = createHttpHooks({
    // Secure default: no outbound HTTP/HTTPS unless explicitly allowed.
    // Example: GONDOLIN_ALLOW_HOSTS=registry.npmjs.org,github.com,api.github.com pisafe
    allowedHosts,
  });

  const localRead = createReadTool(localCwd);
  const localWrite = createWriteTool(localCwd);
  const localEdit = createEditTool(localCwd);
  const localBash = createBashTool(localCwd);

  let vm: VM | null = null;
  let vmStarting: Promise<VM> | null = null;

  async function ensureVm(ctx?: ExtensionContext) {
    if (vm) return vm;
    if (vmStarting) return vmStarting;

    vmStarting = (async () => {
      ctx?.ui.setStatus(
        "gondolin",
        ctx.ui.theme.fg("accent", "Gondolin: starting"),
      );
      const created = await VM.create({
        httpHooks,
        env,
        vfs: {
          mounts: {
            [GUEST_WORKSPACE]: createWorkspaceProvider(localCwd),
          },
        },
      });
      vm = created;
      ctx?.ui.setStatus(
        "gondolin",
        ctx.ui.theme.fg(
          "accent",
          `Gondolin: ${localCwd} -> ${GUEST_WORKSPACE}; net=${allowedHosts.length ? allowedHosts.join(",") : "deny"}`,
        ),
      );
      ctx?.ui.notify(
        `Gondolin VM ready. Workspace: ${GUEST_WORKSPACE}. Network: ${allowedHosts.length ? allowedHosts.join(", ") : "denied"}.`,
        "info",
      );
      return created;
    })();

    return vmStarting;
  }

  pi.on("session_start", async (_event, ctx) => {
    await ensureVm(ctx);
  });

  pi.on("session_shutdown", async (_event, ctx) => {
    if (!vm) return;
    ctx.ui.setStatus(
      "gondolin",
      ctx.ui.theme.fg("muted", "Gondolin: stopping"),
    );
    try {
      await vm.close();
    } finally {
      vm = null;
      vmStarting = null;
    }
  });

  pi.registerTool({
    ...localRead,
    async execute(id, params, signal, onUpdate, ctx) {
      const activeVm = await ensureVm(ctx);
      return createReadTool(localCwd, {
        operations: createGondolinReadOps(activeVm, localCwd),
      }).execute(id, params, signal, onUpdate);
    },
  });

  pi.registerTool({
    ...localWrite,
    async execute(id, params, signal, onUpdate, ctx) {
      const activeVm = await ensureVm(ctx);
      return createWriteTool(localCwd, {
        operations: createGondolinWriteOps(activeVm, localCwd),
      }).execute(id, params, signal, onUpdate);
    },
  });

  pi.registerTool({
    ...localEdit,
    async execute(id, params, signal, onUpdate, ctx) {
      const activeVm = await ensureVm(ctx);
      return createEditTool(localCwd, {
        operations: createGondolinEditOps(activeVm, localCwd),
      }).execute(id, params, signal, onUpdate);
    },
  });

  pi.registerTool({
    ...localBash,
    async execute(id, params, signal, onUpdate, ctx) {
      const activeVm = await ensureVm(ctx);
      return createBashTool(localCwd, {
        operations: createGondolinBashOps(activeVm, localCwd),
      }).execute(id, params, signal, onUpdate);
    },
  });

  pi.on("user_bash", (_event, _ctx) => {
    if (!vm) return;
    return { operations: createGondolinBashOps(vm, localCwd) };
  });

  pi.on("before_agent_start", async (event, ctx) => {
    await ensureVm(ctx);
    return {
      systemPrompt: event.systemPrompt.replace(
        `Current working directory: ${localCwd}`,
        `Current working directory: ${GUEST_WORKSPACE} (Gondolin VM, mounted from host: ${localCwd})`,
      ),
    };
  });
}
