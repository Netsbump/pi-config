# TODO Pi — organisation presets, skills, subagents

## Décision validée

Architecture cible retenue :

```text
chat
  = discussion générale, modèle économique à choisir, read/web only

scope
  = preset dev quotidien
  = parent orchestrateur
  = read-only direct
  = peut appeler scout/planner/reviewer/oracle
  = appelle worker seulement après validation explicite
```
## Plannotator

Décision : garder Plannotator côté parent/orchestration.

Ne pas le mélanger directement avec chaque subagent au début. Décider plus tard s'il doit orchestrer des subagents.

### Ajuster les modèles

- [ ] Choisir un modèle économique pour `chat`.
- [ ] Éventuellement pin `oracle`/`worker` sur un modèle fort.
- [ ] Éventuellement pin `scout` sur un modèle rapide/cheap.
