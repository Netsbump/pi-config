# Skills

Les skills sont des workflows spécialisés à invoquer ponctuellement.

## Skills personnels

Définis dans [`../skills/`](../skills/).

### `grill-me`

Stress-test d'une idée, d'un plan, d'un design ou d'une décision.

- Pose une question à la fois.
- Challenge les hypothèses, risques, compromis et cas limites.
- Peut s'appliquer au code, produit, carrière, organisation ou sujets généralistes.

```text
/skill:grill-me
```

### `code-review`

Méthode de review de code.

- Cherche bugs, régressions, sécurité, dette technique, tests manquants.
- Ne modifie pas les fichiers sauf demande explicite.
- Structure les retours en bloquants, recommandations et questions.

```text
/skill:code-review
```

### `handoff`

Génère un document de handoff pour reprendre le travail dans une session fraîche.

- Sauvegarde le document dans le dossier temporaire de l'OS, pas dans le projet.
- Inclut résumé, état actuel, fichiers/artéfacts, suggested skills, next steps et questions ouvertes.

```text
/skill:handoff
/skill:handoff continuer la config des presets Pi
```

## Skills fournis par des extensions

### `librarian`

Fourni par `pi-web-access` :

```text
~/.pi/agent/npm/node_modules/pi-web-access/skills/librarian/SKILL.md
```

Recherche les internals de bibliothèques open-source avec preuves et liens GitHub.

- Utile pour comprendre le code source d'une lib, pourquoi un comportement existe, ou obtenir des références exactes.

```text
/skill:librarian
```
