---
name: commit-message
description: "Generate an English Conventional Commit message from the staged git diff. Use when the user wants a commit message for staged changes without committing."
---

# Commit Message Skill

Tu génères un message de commit en anglais à partir du diff staged Git.

Objectif : proposer un message prêt à copier/coller, au format Conventional Commits, sans créer le commit.

## Règles

- Ne fais jamais le commit toi-même.
- Ne modifie aucun fichier.
- Analyse uniquement les changements staged.
- Si aucun changement n'est staged, dis-le clairement et demande à l'utilisateur de faire `git add` avant de relancer.
- Utilise `bash` uniquement pour inspection Git read-only.
- Le message doit être en anglais.
- Le sujet doit être concis, impératif, sans point final.
- Préfère un seul commit message. Si les changements staged mélangent plusieurs intentions indépendantes, propose plutôt 2-3 messages alternatifs et indique qu'il vaut mieux splitter le commit.

## Commandes d'inspection recommandées

```bash
git status --short
git diff --cached --stat
git diff --cached --name-status
git diff --cached
```

Si le diff est très gros, commence par `--stat` et `--name-status`, puis inspecte seulement les hunks importants.

## Convention de type

Choisis le préfixe Conventional Commit le plus juste :

- `feat`: nouvelle fonctionnalité utilisateur ou capacité produit.
- `fix`: correction de bug.
- `refactor`: changement de structure sans changement de comportement attendu.
- `perf`: amélioration de performance.
- `test`: ajout ou modification de tests uniquement.
- `docs`: documentation uniquement.
- `style`: formatage/style sans changement logique.
- `chore`: maintenance, config, dépendances, outillage, tâches non produit.
- `ci`: CI/CD.
- `build`: build system, packaging, bundling.
- `revert`: revert d'un commit précédent.

Ajoute un scope seulement s'il est évident et utile :

```text
fix(auth): handle expired tokens
chore(pi): update subagent docs
```

N'utilise pas de scope vague ou inventé.

## Format de sortie

Retourne d'abord un bloc prêt à copier/coller :

```text
<type>(<scope>): <subject>
```

Si utile, ajoute un body court après une ligne vide :

```text
<type>(<scope>): <subject>

- Explain important context when the subject is not enough
- Mention notable follow-up or migration detail if needed
```

Ensuite, hors du bloc, ajoute une justification très courte :

```text
Why: staged changes update Pi subagent configuration and docs, so `chore(pi)` fits best.
```

## Cas particuliers

### Breaking change

Si le diff contient une rupture claire d'API ou de comportement, utilise `!` et/ou un footer :

```text
feat(api)!: change authentication response shape

BREAKING CHANGE: authentication errors now return a structured error object.
```

### Plusieurs intentions

Si les changements staged devraient être splittés :

```text
The staged diff mixes unrelated changes. Prefer splitting it.

Option 1:
```text
feat(auth): add password reset flow
```

Option 2:
```text
docs(api): document authentication errors
```
```

### Aucun staged diff

Si `git diff --cached` est vide :

```text
No staged changes found. Stage files with `git add` first, then rerun this skill.
```
