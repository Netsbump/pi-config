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

# Se reconnecter au provider sur cette machine
pi
# puis /login si nécessaire
```

## Ce qui est volontairement exclu

- `auth.json` : tokens / sessions d'authentification
- `sessions/` : historique des conversations
- `trust.json` : décisions de confiance propres aux chemins de la machine
- `npm/`, `git/`, `bin/` : caches et installations recréables

## Extensions et packages installés

Docs Pi utiles : [packages](https://github.com/earendil-works/pi-coding-agent/blob/main/docs/packages.md), [extensions](https://github.com/earendil-works/pi-coding-agent/blob/main/docs/extensions.md), [skills](https://github.com/earendil-works/pi-coding-agent/blob/main/docs/skills.md).

### Packages Pi

Déclarés dans [`settings.json`](settings.json), installés/synchronisés avec `pi update --extensions`.

- [`pi-web-access`](https://pi.dev/packages/pi-web-access) — accès web pour Pi : recherche web, récupération d'URL, lecture de PDF/vidéos selon les capacités du package.
- [`@hypabolic/pi-hypa`](https://pi.dev/packages/@hypabolic/pi-hypa) — réduit le bruit des sorties d'outils/commandes pour économiser le contexte ; diagnostics via `/hypa`.

### Extensions custom locales

- [`extensions/gondolin-sandbox.ts`](extensions/gondolin-sandbox.ts) — mode optionnel `pisafe` : exécute les outils Pi dans une micro-VM Gondolin avec workspace monté dans `/workspace` et réseau contrôlé. Documentation : [docs/gondolin.md](docs/gondolin.md).

## Mode sandboxé Gondolin

Ce repo contient une extension optionnelle pour lancer Pi dans une micro-VM Gondolin :

```bash
pi -e ~/.pi/agent/extensions/gondolin-sandbox.ts
```

Alias conseillé :

```bash
alias pisafe='pi -e ~/.pi/agent/extensions/gondolin-sandbox.ts'
```

Documentation détaillée : [docs/gondolin.md](docs/gondolin.md)

## Notes

Les extensions/packages Pi peuvent exécuter du code localement. Ne garder ici que des packages de confiance.
