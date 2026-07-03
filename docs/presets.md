# Presets

Définis dans [`../presets.json`](../presets.json). Les presets changent le mode de session : outils actifs, niveau de réflexion et consignes générales.

Commandes utiles : `/preset`. 
Raccourci : `Ctrl+Shift+U`. 
Démarrage direct possible avec `pi --preset scope`.

## `chat`

Mode discussion / explication.

- Outils : lecture de fichiers, recherche locale, web.
- Pas de shell, pas d'édition.
- Usage typique : questions générales, compréhension, aide à la réflexion, recherche internet légère.

```text
/preset chat
```

## `scope`

Mode dev quotidien / orchestration.

- Outils directs : lecture, recherche locale, `bash` en lecture/inspection, web.
- Pas de `edit/write` direct.
- Peut déléguer à `scout`, `planner`, `reviewer`, `oracle`.
- Peut appeler `worker` seulement après validation explicite d'implémentation par l'utilisateur.
- Usage typique : comprendre un problème, explorer un codebase, proposer une approche, identifier risques et questions, puis déléguer l'implémentation validée.

```text
/preset scope
```

Après modification des presets ou de l'extension, utiliser `/reload` dans Pi ou redémarrer la session.
