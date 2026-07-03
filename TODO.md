# TODO Pi — organisation presets, skills, subagents

## Objectif

Mettre en place une organisation simple où :

- le parent Pi reste l'orchestrateur principal ;
- le preset `chat` reste un vrai mode de discussion générale, avec un modèle économique ;
- `pi-subagents` sera installé plus tard pour déléguer des rôles spécialisés ;
- les subagents porteront chacun leur modèle, thinking, tools et skills ;
- le preset `build` disparaîtra probablement à terme, remplacé par un subagent `worker` appelé par le parent ;
- les skills existants seront réutilisés par les bons rôles au lieu d'être dupliqués dans les presets.

## État des lieux actuel

### Pi global

Fichier : `~/.pi/agent/settings.json`

- Provider par défaut : `openai-codex`
- Modèle par défaut : `gpt-5.5`
- Thinking par défaut : `medium`
- Extensions/packages installés actuellement :
  - `pi-web-access`
  - `@hypabolic/pi-hypa`
  - `@plannotator/pi-extension`
  - `pi-catppuccin-tui`
  - `@jmfederico/pi-web`
- `pi-subagents` n'est pas encore installé.

### Presets actuels

Fichier : `~/.pi/agent/presets.json`

#### `chat`

Rôle actuel : discussion générale, aide à réfléchir, explications, lecture/recherche si utile, sans modifier.

Décision : **le garder**.

Évolution souhaitée :

- lui assigner explicitement un modèle moins cher/rapide ;
- garder les outils read-only + web ;
- ne pas le transformer en subagent ;
- il reste un mode parent conversationnel.

#### `scope`

Rôle actuel : comprendre, explorer, cadrer, proposer une approche, attendre validation, sans modifier.

Mapping futur : proche de `planner` / `scope-planner`.

Décision :

- à court terme, le garder ;
- à moyen terme, le transformer en preset d'orchestration qui appelle un subagent `planner` ;
- ne pas dupliquer toute la logique de planning dans le preset si elle existe déjà dans le subagent.

#### `build`

Rôle actuel : implémentation ciblée et sûre avec edit/write/bash.

Mapping futur : proche de `worker`.

Décision :

- le garder temporairement ;
- à terme, probablement le supprimer ou le réduire ;
- l'implémentation devrait être portée par un subagent `worker` appelé par le parent Pi, avec son modèle/tools/skills propres.

### Skills actuels

Dossier : `~/.pi/agent/skills/`

#### `code-review`

Rôle : review structurée d'un diff/PR selon Standards et Spec.

Mapping futur : skill à donner au subagent `reviewer`.

Notes :

- très bon candidat pour spécialiser `reviewer` ;
- le reviewer devrait être read-only ou quasi read-only par défaut ;
- possible tools : `read`, `grep`, `find`, `ls`, `bash` ;
- pas de `edit/write` sauf mode autofix explicite.

#### `grill-me`

Rôle : challenger une idée, un plan ou une décision, une question à la fois.

Mapping futur : skill à donner à `oracle` ou à un subagent custom `grill-oracle`.

Notes :

- attention : `grill-me` est interactif et pose une question à la fois ;
- en subagent, il faut décider si on veut vraiment une boucle interactive, ou plutôt un rapport critique synthétique ;
- option simple : garder `grill-me` en skill parent pour les sessions interactives, et utiliser `oracle` pour les secondes opinions non interactives.

#### `handoff`

Rôle : produire un document de transfert de contexte.

Mapping futur : peut rester un skill parent ; éventuellement utile pour un `context-builder`.

### Plannotator

Config : `~/.plannotator/config.json`

État actuel : config légère, seulement options de diff.

Décision :

- garder Plannotator côté parent/orchestration ;
- ne pas le mélanger directement avec chaque subagent au début ;
- plus tard, décider si Plannotator doit appeler des subagents dans certains workflows.

## Architecture cible simple

```text
Parent Pi
  ├── mode chat général via preset `chat`
  ├── orchestration naturelle des tâches
  ├── Plannotator si besoin de workflow structuré
  ├── presets légers qui appellent les bons subagents
  └── synthèse finale + décisions utilisateur

Subagents
  ├── scout / context-builder : exploration du code, read-only
  ├── planner : cadrage/scope/plan, read-only
  ├── worker : implémentation
  ├── reviewer : review structurée, utilise skill code-review
  └── oracle : challenge/second avis, éventuellement inspiré de grill-me
```

## Mapping souhaité

| Besoin | Aujourd'hui | Futur |
|---|---|---|
| Discussion générale | preset `chat` | garder preset `chat` parent |
| Explorer une zone du code | `chat` ou `scope` | subagent `scout` |
| Cadrer une tâche | preset `scope` | subagent `planner`, appelé par preset `scope` ou parent |
| Implémenter | preset `build` | subagent `worker` |
| Relire un diff | skill `code-review` manuel | subagent `reviewer` + skill `code-review` |
| Challenger une décision | skill `grill-me` | parent skill `grill-me` ou subagent `oracle` |
| Handoff | skill `handoff` | garder en parent, éventuellement context-builder plus tard |

## Organisation des responsabilités

### Presets

Les presets doivent devenir des modes ou raccourcis d'orchestration.

- `chat` : vrai mode conversationnel parent.
- `scope` : à terme, wrapper qui demande au parent d'utiliser `planner`.
- `build` : temporaire ; à terme remplacé par `worker`.

### Subagents

Les subagents servent à déléguer des tâches spécialisées à des sessions enfants, avec leur propre contexte. Le but principal est de garder le contexte du parent propre : le parent orchestre, décide et synthétise, pendant que les subagents explorent, planifient, implémentent ou reviewent sans remplir la conversation principale avec tout le détail de leurs lectures, commandes et raisonnements.

Idéalement, le parent Pi doit pouvoir déléguer naturellement au bon subagent quand la demande le justifie, sans que l'utilisateur ait toujours besoin de le préciser. Exemple : si je demande une grosse implémentation, le parent peut décider de lancer `planner`, puis `worker`, puis `reviewer`. Les presets peuvent aussi forcer ou guider cette délégation quand je veux un workflow précis.

Les subagents peuvent aussi tourner en arrière-plan ou en parallèle selon le besoin : par exemple plusieurs reviewers avec des angles différents, ou un scout qui construit le contexte pendant que le parent reste disponible.

Les subagents doivent centraliser les rôles opérationnels :

- prompt du rôle ;
- modèle ;
- thinking ;
- tools ;
- skills utiles ;
- limites read-only / write.

### Skills

Les skills doivent rester des savoir-faire réutilisables :

- `code-review` pour le reviewer ;
- `grill-me` pour l'oracle ou le parent ;
- `handoff` pour les transitions de session.

### Extensions

Les extensions restent des capacités techniques ou UI :

- `preset.ts` pour changer de mode parent ;
- Plannotator pour le workflow parent ;
- `pi-subagents` plus tard pour déléguer à des sessions enfants.

## Plan de mise en place

### Étape 1 — Ne rien casser

- [ ] Garder les presets actuels.
- [ ] Garder Plannotator comme aujourd'hui.
- [ ] Ne pas installer/configurer `pi-subagents` tant que le mapping n'est pas validé.

### Étape 2 — Ajuster le preset `chat`

- [ ] Choisir un modèle économique pour `chat`.
- [ ] Ajouter `provider` + `model` dans `presets.json` pour `chat`.
- [ ] Garder `chat` en read-only + web.
- [ ] Vérifier que `/preset chat` reste confortable pour discussion générale.

Exemple futur :

```json
{
  "chat": {
    "provider": "openai-codex",
    "model": "<modele-pas-cher>",
    "thinkingLevel": "medium",
    "tools": ["read", "grep", "find", "ls", "web_search", "fetch_content", "get_search_content"]
  }
}
```

### Étape 3 — Installer pi-subagents

- [ ] Installer : `pi install npm:pi-subagents`
- [ ] Redémarrer Pi.
- [ ] Vérifier : `/subagents-doctor`
- [ ] Vérifier les modèles chargés : `/subagents-models`
- [ ] Tester sans customisation lourde :
  - `Use scout to understand this area.`
  - `Use reviewer to review this diff.`
  - `Ask oracle for a second opinion on this plan.`

### Étape 4 — Configurer les subagents

- [ ] Ajouter un bloc `subagents` dans `~/.pi/agent/settings.json`.
- [ ] Définir un `subagents.defaultModel` économique.
- [ ] Override les rôles importants : `planner`, `worker`, `reviewer`, `oracle`, éventuellement `scout`.
- [ ] Restreindre les tools par rôle.
- [ ] Associer les skills utiles quand la syntaxe exacte est confirmée dans la doc `pi-subagents`.

Draft logique :

```json
{
  "subagents": {
    "defaultModel": "<modele-subagent-economique>",
    "agentOverrides": {
      "scout": {
        "model": "<modele-rapide>",
        "tools": "read,grep,find,ls"
      },
      "planner": {
        "model": "<modele-raisonnement>",
        "thinking": "high",
        "tools": "read,grep,find,ls,bash"
      },
      "worker": {
        "model": "<modele-code>",
        "thinking": "medium",
        "tools": "read,grep,find,ls,bash,edit,write"
      },
      "reviewer": {
        "model": "<modele-review>",
        "thinking": "high",
        "tools": "read,grep,find,ls,bash"
      },
      "oracle": {
        "model": "<modele-fort>",
        "thinking": "high",
        "tools": "read,grep,find,ls"
      }
    }
  }
}
```

### Étape 5 — Migrer les presets vers orchestration

- [ ] Transformer progressivement `scope` en wrapper de `planner`.
- [ ] Réduire ou supprimer `build` quand `worker` est fiable.
- [ ] Ajouter éventuellement un preset `review` qui appelle `reviewer`.
- [ ] Éviter de dupliquer les longues instructions entre presets et subagents.

Exemple futur pour `scope` :

```text
Tu es en MODE SCOPE parent. Utilise le subagent planner pour cadrer la demande.
Le planner doit explorer en read-only, produire un plan, lister les risques et attendre validation utilisateur avant toute implémentation.
```

### Étape 6 — Décider quoi faire de `grill-me` / `oracle`

Options :

- [ ] Option A : garder `grill-me` comme skill parent interactif, et utiliser `oracle` pour rapport critique synthétique.
- [ ] Option B : créer/configurer un subagent `grill-oracle` qui utilise le style `grill-me`.
- [ ] Option C : donner le skill `grill-me` à `oracle`, mais vérifier que le comportement interactif ne gêne pas les runs subagent.

Décision provisoire recommandée : **Option A**.

## Questions ouvertes

- [ ] Quel modèle économique choisir pour `chat` ?
- [ ] Quel modèle fort choisir pour `worker` ?
- [ ] Est-ce que `reviewer` doit pouvoir corriger ou seulement signaler ?
- [ ] Est-ce que `oracle` doit poser des questions une par une ou rendre un rapport critique ?
- [ ] Est-ce que Plannotator doit rester purement parent ou orchestrer des subagents plus tard ?
- [ ] Faut-il créer des subagents custom (`scope-planner`, `code-reviewer`, `grill-oracle`) ou utiliser les builtins avec overrides ?

## Décision actuelle

Pour l'instant :

1. documenter l'organisation ici ;
2. garder les presets actuels ;
3. plus tard, commencer par rendre `chat` explicitement économique ;
4. ensuite installer `pi-subagents` ;
5. customiser les subagents progressivement ;
6. migrer `scope` puis `build` seulement après tests réels.
