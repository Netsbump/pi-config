# TODO Pi

## Modèles par preset / phase Plannotator

À évaluer plus tard : définir explicitement des modèles différents selon les usages.

### Pourquoi

Pour l'instant, les presets et Plannotator gardent le modèle courant/default défini dans `settings.json`.
C'est simple et évite de sur-configurer trop tôt.

Mais ça pourrait être utile si je veux :

- un modèle rapide/moins cher pour `chat` ;
- un modèle plus fort en raisonnement pour `scope` ;
- un modèle meilleur en code pour `build` ;
- un modèle spécifique pour les phases Plannotator `planning` ou `executing`.

## Comment faire pour les presets

Fichier : [`presets.json`](presets.json)

L'extension locale [`extensions/preset.ts`](extensions/preset.ts) supporte :

```json
{
  "scope": {
    "provider": "openai-codex",
    "model": "gpt-5.5",
    "thinkingLevel": "high",
    "tools": ["read", "grep", "find", "ls", "bash", "web_search", "fetch_content", "get_search_content"],
    "instructions": "..."
  }
}
```

Syntaxe presets :

- `provider`: nom du provider Pi
- `model`: id du modèle
- `thinkingLevel`: `off`, `minimal`, `low`, `medium`, `high`, `xhigh`

Idées possibles :

- `chat` : modèle rapide / économique
- `scope` : modèle fort en raisonnement
- `build` : modèle fort en code

## Comment faire pour Plannotator

Fichier global possible :

```text
~/.pi/agent/plannotator.json
```

Fichier projet possible :

```text
<cwd>/.pi/plannotator.json
```

Exemple :

```json
{
  "phases": {
    "planning": {
      "model": {
        "provider": "openai-codex",
        "id": "gpt-5.5"
      },
      "thinking": "high"
    },
    "executing": {
      "model": {
        "provider": "openai-codex",
        "id": "gpt-5.5"
      },
      "thinking": "medium"
    }
  }
}
```

Différence importante :

- presets : `model`
- Plannotator : `model.id`

## Décision actuelle

Ne rien forcer pour l'instant.

Garder :

- modèle par défaut dans [`settings.json`](settings.json) ;
- presets pour les outils et le comportement ;
- Plannotator pour le workflow plan/review/exécution.

Revenir sur ce sujet seulement si je ressens un besoin concret : coût, rapidité, qualité de code, qualité de raisonnement.
