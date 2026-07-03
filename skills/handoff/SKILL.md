---
name: handoff
description: Compact the current conversation into a handoff document for another agent to pick up. Use when the user asks for a handoff, session summary, context transfer, or wants to continue work in a fresh Pi session.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---

# Handoff Skill

Écris un document de handoff pour permettre à un nouvel agent de reprendre le travail dans une session fraîche.

## Destination

- Sauvegarde le document dans le dossier temporaire de l'OS, pas dans le workspace courant.
- Sur Linux, utilise typiquement `/tmp` via `mktemp`, par exemple :

```bash
mktemp /tmp/pi-handoff-XXXXXX.md
```

- À la fin, donne le chemin exact du fichier créé.

## Contenu attendu

Le document doit être concis mais suffisant pour reprendre sans relire toute la conversation.

Inclure :

1. **Résumé de la conversation**
   - décisions prises ;
   - changements effectués ;
   - questions importantes déjà résolues.

2. **État actuel**
   - fichiers modifiés ou créés ;
   - commandes importantes exécutées ;
   - configuration pertinente ;
   - limites ou incertitudes restantes.

3. **Objectif de la prochaine session**
   - si l'utilisateur a passé des arguments à `/skill:handoff`, traite-les comme la description du focus de la prochaine session ;
   - adapte le handoff à cet objectif.

4. **Suggested skills**
   - liste les skills que le prochain agent devrait invoquer si pertinent, par exemple :
     - `grill-me` pour challenger une idée ou un plan ;
     - `code-review` pour relire des changements ;
     - `librarian` pour rechercher les internals d'une lib open-source avec preuves.

5. **Next steps**
   - actions recommandées, ordonnées ;
   - points à vérifier avant de continuer.

## Règles

- Ne duplique pas le contenu déjà capturé dans d'autres artefacts : PRD, plan, ADR, issue, commit, diff, etc.
- Référence ces artefacts par chemin ou URL.
- Masque toute information sensible : API keys, tokens, mots de passe, secrets, données personnelles.
- Ne modifie pas le projet sauf si l'utilisateur l'a explicitement demandé.
- Si tu dois inspecter le repo pour produire un handoff exact, fais-le en lecture seule.

## Format recommandé

```md
# Handoff

Generated: <date/time>
Current working directory: <path>
Next-session focus: <focus or "not specified">

## Summary

## Current state

## Files and artifacts

## Suggested skills

## Next steps

## Risks / open questions
```
