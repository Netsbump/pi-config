# Configuration Pi

## Installation sur une nouvelle machine

```bash
# Installer Pi globalement si nécessaire
pnpm add -g @earendil-works/pi-coding-agent

# Cloner ce dépôt comme config Pi
rm -rf ~/.pi/agent
git clone https://github.com/Netsbump/pi-config.git ~/.pi/agent

# Installer les dépendances locales de ce repo
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

## Mise à jour sur une machine existante

Depuis n'importe où :

```bash
cd ~/.pi/agent && npm run sync
```

La commande fait : `git pull --ff-only`, `npm ci`, puis `pi update --all` pour mettre à jour Pi et les packages/extensions déclarés.

## Ce qui est volontairement exclu

- `auth.json` : tokens / sessions d'authentification
- `sessions/` : historique des conversations
- `missions/` : état des missions temporaires
- `models-store.json` : cache local du catalogue de modèles
- `trust.json` : décisions de confiance propres aux chemins de la machine
- `npm/`, `git/`, `bin/` : caches et installations recréables
- `~/.config/pi-web/config.json` : configuration runtime locale de Pi Web, propre à chaque machine

## Extensions et packages installés

Docs Pi utiles : [packages](https://github.com/earendil-works/pi-coding-agent/blob/main/docs/packages.md), [extensions](https://github.com/earendil-works/pi-coding-agent/blob/main/docs/extensions.md), [skills](https://github.com/earendil-works/pi-coding-agent/blob/main/docs/skills.md).

### Packages Pi

Déclarés dans [`settings.json`](settings.json), installés/synchronisés avec `pi update --extensions`.

- [`pi-web-access`](https://pi.dev/packages/pi-web-access) — accès web pour Pi : recherche web, récupération d'URL, lecture de PDF/vidéos selon les capacités du package. Fournit aussi le skill `librarian`.
- [`@hypabolic/pi-hypa`](https://pi.dev/packages/@hypabolic/pi-hypa) — réduit le bruit des sorties d'outils/commandes pour économiser le contexte ; diagnostics via `/hypa`.
- [`@plannotator/pi-extension`](https://pi.dev/packages/@plannotator/pi-extension) — workflow plan/review : `pi --plan`, `/plannotator`, validation de plans dans une UI navigateur, review/annotation de diffs et messages.
- [`@jmfederico/pi-web`](https://pi.dev/packages/@jmfederico/pi-web?name=pi-web) — UI web locale pour Pi : projets, workspaces/git worktrees, sessions persistantes, fichiers, terminaux et supervision multi-sessions depuis le navigateur. Documentation locale : [docs/pi-web.md](docs/pi-web.md).
- [`pi-prompt-template-model`](https://pi.dev/packages/pi-prompt-template-model) — prompt templates réutilisables avec frontmatter `model`, `thinking`, `skill`, etc.

### Extensions custom locales

- [`extensions/preset.ts`](extensions/preset.ts) — extension locale qui ajoute des presets personnels pour basculer rapidement entre modes de session. Configuration dans [`presets.json`](presets.json). 
Documentation : [docs/presets.md](docs/presets.md).

- [`optional-extensions/gondolin-sandbox.ts`](optional-extensions/gondolin-sandbox.ts) — mode optionnel `pisafe` : exécute les outils Pi dans une micro-VM Gondolin avec workspace monté dans `/workspace` et réseau contrôlé. 
Documentation : [docs/gondolin.md](docs/gondolin.md).

## Skills disponibles

- [`skills/`](skills/) — workflows spécialisés à invoquer ponctuellement.
Documentation : [docs/skills.md](docs/skills.md).

## Flow recommandé

### Réflexion et planification

```text
/skill:grill-me
```

Challenger l'approche si nécessaire.

```text
/plannotator
```

Créer/revoir un plan si le changement mérite un workflow plus structuré.

### Review

```text
/skill:code-review
```

ou utiliser la review visuelle Plannotator :

```text
/plannotator-review
```
