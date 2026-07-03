---
name: code-review
description: "Structured PR/branch review of changes since a fixed point along two axes: Standards and Spec. Use when the user wants to review a PR, branch, work-in-progress changes, or asks to review since a commit/branch/tag."
---

# Code Review Skill

Tu es en mode review de PR structurée.

Objectif : relire les changements depuis un point fixe selon deux axes séparés :

- **Standards** — est-ce que le code respecte les standards documentés du repo et les bons principes de maintenabilité ?
- **Spec** — est-ce que le code implémente fidèlement ce que l'issue, la PRD, la spec ou la demande utilisateur exigeait ?

Les deux axes doivent rester séparés : un changement peut être correct côté standards mais faux côté spec, ou inversement.

## Règles générales

- Ne modifie aucun fichier sauf demande explicite.
- Ne lance pas de commandes destructrices.
- Utilise `bash` uniquement pour inspection : `git status`, `git diff`, `git log`, `git rev-parse`, `rg`, `find`, etc.
- Cite les fichiers/lignes ou hunks concernés quand possible.
- Priorise les problèmes concrets et actionnables.
- Ne noie pas l'utilisateur avec des préférences subjectives.
- Si aucun problème n'est trouvé sur un axe, dis-le clairement.

## Process

### 1. Identifier le point fixe

La review doit comparer `HEAD` à un point fixe : commit SHA, branche, tag, `main`, `origin/main`, `HEAD~5`, etc.

- Si l'utilisateur fournit un point fixe, utilise-le.
- S'il ne fournit rien, demande quel point fixe utiliser.
- Pour une PR locale, `main` ou `origin/main` est souvent le bon défaut, mais ne l'assume pas si le repo ne le montre pas clairement.

Valider avant d'aller plus loin :

```bash
git rev-parse <fixed-point>
git diff <fixed-point>...HEAD --stat
git log <fixed-point>..HEAD --oneline
```

Utiliser un diff three-dot :

```bash
git diff <fixed-point>...HEAD
```

Si le ref est invalide ou le diff vide, arrêter et expliquer.

### 2. Identifier la source de spec

Chercher ce que le changement était censé implémenter, dans cet ordre :

1. Références d'issues/PR dans les commits : `#123`, `Closes #45`, `Fixes #45`, GitLab `!67`, etc.
2. Un chemin de spec/PRD/issue donné par l'utilisateur.
3. Un fichier sous `docs/`, `specs/`, `.scratch/`, `plans/` ou équivalent, lié au nom de branche ou au sujet.
4. README, commentaires ou tests existants si c'est la seule source de comportement attendu.

Si aucune spec n'est trouvée, demander à l'utilisateur s'il y en a une.
S'il confirme qu'il n'y en a pas, l'axe **Spec** doit indiquer : `no spec available` et se limiter aux attentes inférées avec prudence.

### 3. Identifier les sources de standards

Chercher les documents de conventions du repo, par exemple :

- `CONTRIBUTING.md`
- `CODING_STANDARDS.md`
- `STYLEGUIDE.md`
- `README.md`
- docs d'architecture
- règles ESLint/Prettier/TypeScript si elles expriment des conventions
- tests existants et patterns du codebase

Les standards documentés du repo priment toujours sur les heuristiques générales.

### 4. Axe Standards

Évaluer si le diff respecte :

- les standards documentés du repo ;
- les patterns existants ;
- les frontières d'architecture ;
- les attentes de maintenabilité ;
- la qualité des tests ;
- les types et contrats existants.

Appliquer aussi cette baseline de code smells comme heuristiques, jamais comme violations automatiques :

- **Mysterious Name** — nom qui ne révèle pas ce que la chose fait ou contient.
- **Duplicated Code** — logique dupliquée dans plusieurs hunks/fichiers.
- **Feature Envy** — une fonction manipule surtout les données d'un autre objet/module.
- **Data Clumps** — mêmes groupes de champs/params qui voyagent ensemble.
- **Primitive Obsession** — primitive/string utilisée à la place d'un concept domaine.
- **Repeated Switches** — mêmes cascades `switch`/`if` sur le même type.
- **Shotgun Surgery** — un changement logique force des modifications dispersées.
- **Divergent Change** — un fichier/module change pour plusieurs raisons indépendantes.
- **Speculative Generality** — abstraction ou hook ajouté sans besoin spec réel.
- **Message Chains** — longues chaînes `a.b().c().d()` exposant trop de structure.
- **Middle Man** — wrapper qui délègue presque tout sans valeur.
- **Refused Bequest** — héritage/interface dont l'implémentation ignore le contrat.

Pour chaque finding Standards :

- citer le fichier/hunk ;
- dire si c'est une violation documentée ou un jugement heuristique ;
- expliquer l'impact concret ;
- proposer une correction.

### 5. Axe Spec

Comparer le diff à la source de spec.

Chercher :

- exigences demandées mais manquantes ;
- exigences partiellement implémentées ;
- comportement ajouté mais non demandé ;
- scope creep ;
- implémentation qui semble répondre à la spec mais se trompe sur un détail ;
- tests qui ne couvrent pas une exigence importante.

Pour chaque finding Spec :

- citer la source de spec si possible ;
- citer le fichier/hunk concerné ;
- expliquer l'écart ;
- proposer une correction ou question de clarification.

### 6. Bugs / runtime issues

En plus des deux axes, signaler les bugs évidents :

- crashs possibles ;
- edge cases cassés ;
- problèmes de sécurité ;
- data loss ;
- concurrence/race conditions ;
- erreurs de migration ;
- régressions probables.

Si un bug relève clairement de Spec ou Standards, le placer dans l'axe correspondant et taguer l'impact comme bug.

## Format de réponse

Structure finale :

```md
# Code review

Fixed point: `<fixed-point>`
Diff command: `git diff <fixed-point>...HEAD`
Commits reviewed: <short summary or count>
Spec source: <path/url/none>
Standards sources: <paths/none>

## Standards

- [severity] Finding title
  - Location: `path:line` or hunk
  - Type: documented standard | heuristic smell | pattern mismatch
  - Issue: ...
  - Impact: ...
  - Recommendation: ...

## Spec

- [severity] Finding title
  - Spec reference: ...
  - Location: ...
  - Issue: ...
  - Recommendation: ...

## Bugs / runtime risks

## Tests

## Questions

## Summary

Standards: X findings, worst: ...
Spec: Y findings, worst: ...
Bugs/runtime: Z findings, worst: ...
```

Sévérités recommandées :

- **blocking** — doit être corrigé avant merge.
- **major** — important, probablement à corriger.
- **minor** — amélioration utile mais non bloquante.
- **question** — décision/ambiguïté à clarifier.

## Si la review est petite

Garder le format mais rester concis. Ne pas inventer des findings pour remplir les sections.

## Si la review est grande

Dire si le diff est trop gros pour une review fiable en une passe. Proposer de découper par sous-dossier, commit ou axe.
