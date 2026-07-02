# Configuration Pi personnelle

Ce dépôt contient uniquement la configuration Pi partageable entre machines.

## Installation sur une nouvelle machine

```bash
# Installer Pi globalement si nécessaire
pnpm add -g @earendil-works/pi-coding-agent

# Cloner ce dépôt comme config Pi
rm -rf ~/.pi/agent
git clone <URL_DU_REPO_PRIVE> ~/.pi/agent

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

## Notes

Les extensions/packages Pi peuvent exécuter du code localement. Ne garder ici que des packages de confiance.
