# Subagents

`pi-subagents` ajoute la capacité de déléguer à des agents enfants spécialisés. Dans cette config, le preset `scope` est le mode prévu pour orchestrer ces délégations tout en gardant le parent sans `edit/write` direct.

## Configuration actuelle

- `reviewer` est read-only (`read`, `grep`, `find`, `ls`, `bash`) et reçoit le skill `code-review`.
- `worker` garde `edit/write`, mais son prompt impose une autorisation explicite d'implémentation avant toute modification.
- `pi-intercom` est installé pour les décisions live parent ↔ subagents, les progress updates et la remontée groupée des résultats.
- `pi-prompt-template-model` est installé pour créer plus tard des commandes slash réutilisables avec frontmatter `model`, `thinking`, `skill`, `subagent`, `inheritContext`, etc.

## Commandes utiles

```text
/subagents-doctor
/subagents-models
/subagents-models reviewer
/subagents-models worker
```

## Inspecter les subagents

Pour inspecter les subagents disponibles :

```text
Show me available subagents with tools, skills, thinking, defaultContext, inheritProjectContext and inheritSkills.
```

Ou en ciblant un agent précis :

```text
Show me the full config for the worker subagent.
Show me the full config for the reviewer subagent.
```

## Référence rapide actuelle

| Agent | Usage | Points d'attention |
|---|---|---|
| `scout` | exploration rapide du code | peut écrire `context.md` |
| `planner` | plan d'implémentation | peut écrire `plan.md` |
| `reviewer` | review read-only | override local : pas de `edit/write`, skill `code-review` |
| `oracle` | second avis / challenge | fork context, pas d'édition |
| `worker` | implémentation validée | `edit/write`, seulement après autorisation explicite |
| `researcher` | recherche web sourcée | web + écrit `research.md` |
| `context-builder` | contexte/handoff plus complet | peut écrire `context.md` |
| `delegate` | délégation généraliste | puissant, a `edit/write`, à utiliser rarement |

## Note sur `pi-prompt-template-model`

`pi-prompt-template-model` ne remplace pas la définition des subagents.

Les agents restent configurés par `pi-subagents` :

- overrides dans `settings.json`, section `subagents.agentOverrides` ;
- ou fichiers agents dédiés, par exemple `~/.pi/agent/agents/*.md`.

`pi-prompt-template-model` sert à créer des commandes slash réutilisables qui sélectionnent un modèle/thinking/skill et peuvent déléguer à un subagent.
