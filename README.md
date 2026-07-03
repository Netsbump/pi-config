# Configuration Pi personnelle

Ce dépôt contient uniquement la configuration Pi partageable entre machines.

## Installation sur une nouvelle machine

```bash
# Installer Pi globalement si nécessaire
pnpm add -g @earendil-works/pi-coding-agent

# Cloner ce dépôt comme config Pi
rm -rf ~/.pi/agent
git clone <URL_DU_REPO_PRIVE> ~/.pi/agent

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
- [`pi-catppuccin-tui`](https://pi.dev/packages/pi-catppuccin-tui?type=theme) — thèmes Catppuccin pour Pi (`latte`, `frappe`, `macchiato`, `mocha`) et améliorations TUI optionnelles via `/catppuccin-tui`.
- [`@jmfederico/pi-web`](https://pi.dev/packages/@jmfederico/pi-web?name=pi-web) — UI web locale pour Pi : projets, workspaces/git worktrees, sessions persistantes, fichiers, terminaux et supervision multi-sessions depuis le navigateur. Documentation locale : [docs/pi-web.md](docs/pi-web.md).

### Extensions custom locales

- [`extensions/preset.ts`](extensions/preset.ts) — extension locale qui ajoute des presets personnels (`chat`, `scope`, `build`) pour basculer rapidement entre modes de session : discussion, cadrage read-only, implémentation. Configuration dans [`presets.json`](presets.json). Commandes utiles : `/preset`, `/preset chat`, `/preset scope`, `/preset build`. Raccourci : `Ctrl+Shift+U`. Démarrage direct possible avec `pi --preset scope`.
- [`optional-extensions/gondolin-sandbox.ts`](optional-extensions/gondolin-sandbox.ts) — mode optionnel `pisafe` : exécute les outils Pi dans une micro-VM Gondolin avec workspace monté dans `/workspace` et réseau contrôlé. Documentation : [docs/gondolin.md](docs/gondolin.md).

## Presets disponibles

Définis dans [`presets.json`](presets.json). Les presets changent le mode de session : outils actifs, niveau de réflexion et consignes générales.

### `chat`

Mode discussion / explication.

- Outils : lecture de fichiers, recherche locale, web.
- Pas de shell, pas d'édition.
- Usage typique : questions générales, compréhension, aide à la réflexion, recherche internet légère.

```text
/preset chat
```

### `scope`

Mode cadrage avant action.

- Outils : lecture, recherche locale, `bash` en lecture/inspection, web.
- Pas de `edit/write`.
- Usage typique : comprendre un problème, explorer un codebase, proposer une approche, identifier risques et questions avant implémentation.

```text
/preset scope
```

### `build`

Mode implémentation.

- Outils : lecture, recherche locale, `bash`, `edit`, `write`, web.
- Usage typique : appliquer un plan validé ou une demande explicite d'implémentation.

```text
/preset build
```

Après modification des presets ou de l'extension, utiliser `/reload` dans Pi ou redémarrer la session.

## Skills disponibles

Les skills sont des workflows spécialisés à invoquer ponctuellement.

### Skills personnels

Définis dans [`skills/`](skills/).

#### `grill-me`

Stress-test d'une idée, d'un plan, d'un design ou d'une décision.

- Pose une question à la fois.
- Challenge les hypothèses, risques, compromis et cas limites.
- Peut s'appliquer au code, produit, carrière, organisation ou sujets généralistes.

```text
/skill:grill-me
```

#### `code-review`

Méthode de review de code.

- Cherche bugs, régressions, sécurité, dette technique, tests manquants.
- Ne modifie pas les fichiers sauf demande explicite.
- Structure les retours en bloquants, recommandations et questions.

```text
/skill:code-review
```

#### `handoff`

Génère un document de handoff pour reprendre le travail dans une session fraîche.

- Sauvegarde le document dans le dossier temporaire de l'OS, pas dans le projet.
- Inclut résumé, état actuel, fichiers/artéfacts, suggested skills, next steps et questions ouvertes.

```text
/skill:handoff
/skill:handoff continuer la config des presets Pi
```

### Skills fournis par des extensions

#### `librarian`

Fourni par `pi-web-access` :

```text
~/.pi/agent/npm/node_modules/pi-web-access/skills/librarian/SKILL.md
```

Recherche les internals de bibliothèques open-source avec preuves et liens GitHub.

- Utile pour comprendre le code source d'une lib, pourquoi un comportement existe, ou obtenir des références exactes.

```text
/skill:librarian
```

## Flow recommandé

### Cadrage puis implémentation

```text
/preset scope
```

Discuter, explorer, cadrer.

```text
/skill:grill-me
```

Challenger l'approche si nécessaire.

```text
/plannotator
```

Créer/revoir un plan si le changement mérite un workflow plus structuré.

```text
/preset build
```

Implémenter après validation.

### Review

```text
/skill:code-review
```

ou utiliser la review visuelle Plannotator :

```text
/plannotator-review
```

## Notes

Les extensions/packages Pi peuvent exécuter du code localement. Ne garder ici que des packages de confiance.
