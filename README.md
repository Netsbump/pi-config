# Configuration Pi personnelle

Ce dépôt contient uniquement la configuration Pi partageable entre machines.

## Installation sur une nouvelle machine

```bash
# Installer Pi globalement si nécessaire
pnpm add -g @earendil-works/pi-coding-agent

# Cloner ce dépôt comme config Pi
rm -rf ~/.pi/agent
git clone <URL_DU_REPO_PRIVE> ~/.pi/agent

# Installer les dépendances locales de ce repo, dont Gondolin pour l'extension sandbox
npm install

# Installer / synchroniser les packages déclarés dans settings.json
pi update --extensions

# Installer et démarrer Pi Web si l'UI navigateur est souhaitée
pi-web install
pi-web doctor
# puis ouvrir http://127.0.0.1:8504

# Se reconnecter au provider sur cette machine
pi
# puis /login si nécessaire
```

## Ce qui est volontairement exclu

- `auth.json` : tokens / sessions d'authentification
- `sessions/` : historique des conversations
- `trust.json` : décisions de confiance propres aux chemins de la machine
- `npm/`, `git/`, `bin/` : caches et installations recréables
- `~/.config/pi-web/config.json` : configuration runtime locale de Pi Web, propre à chaque machine

## Extensions et packages installés

Docs Pi utiles : [packages](https://github.com/earendil-works/pi-coding-agent/blob/main/docs/packages.md), [extensions](https://github.com/earendil-works/pi-coding-agent/blob/main/docs/extensions.md), [skills](https://github.com/earendil-works/pi-coding-agent/blob/main/docs/skills.md).

### Packages Pi

Déclarés dans [`settings.json`](settings.json), installés/synchronisés avec `pi update --extensions`.

- [`pi-web-access`](https://pi.dev/packages/pi-web-access) — accès web pour Pi : recherche web, récupération d'URL, lecture de PDF/vidéos selon les capacités du package.
- [`@hypabolic/pi-hypa`](https://pi.dev/packages/@hypabolic/pi-hypa) — réduit le bruit des sorties d'outils/commandes pour économiser le contexte ; diagnostics via `/hypa`.
- [`@plannotator/pi-extension`](https://pi.dev/packages/@plannotator/pi-extension) — ajoute un mode plan/review : `pi --plan`, `/plannotator`, validation de plans dans une UI navigateur, review/annotation de diffs et messages.
- [`pi-catppuccin-tui`](https://pi.dev/packages/pi-catppuccin-tui?type=theme) — thèmes Catppuccin pour Pi (`latte`, `frappe`, `macchiato`, `mocha`) et améliorations TUI optionnelles via `/catppuccin-tui`.
- [`@jmfederico/pi-web`](https://pi.dev/packages/@jmfederico/pi-web?name=pi-web) — UI web locale pour Pi : projets, workspaces/git worktrees, sessions persistantes, fichiers, terminaux et supervision multi-sessions depuis le navigateur. Documentation locale : [docs/pi-web.md](docs/pi-web.md).

### Extensions custom locales

- [`optional-extensions/gondolin-sandbox.ts`](optional-extensions/gondolin-sandbox.ts) — mode optionnel `pisafe` : exécute les outils Pi dans une micro-VM Gondolin avec workspace monté dans `/workspace` et réseau contrôlé. Documentation : [docs/gondolin.md](docs/gondolin.md).

## Notes

Les extensions/packages Pi peuvent exécuter du code localement. Ne garder ici que des packages de confiance.
