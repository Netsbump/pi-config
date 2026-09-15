# Presets

Définis dans [`../presets.json`](../presets.json). Les presets changent le mode de session : outils actifs, niveau de réflexion et consignes générales.

Commandes utiles : `/preset`. 
Raccourci : `Ctrl+Shift+U`. 

## `chat`

Mode discussion / explication.

- Outils : lecture de fichiers, recherche locale, web.
- Pas de shell, pas d'édition.
- Usage typique : questions générales, compréhension, aide à la réflexion, recherche internet légère.

```text
/preset chat
```

Après modification des presets ou de l'extension, utiliser `/reload` dans Pi ou redémarrer la session.
