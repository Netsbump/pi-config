# Mode Pi sandboxé avec Gondolin

Ce setup ajoute une extension Pi locale :

```text
optional-extensions/gondolin-sandbox.ts
```

Elle sert à lancer Pi avec ses outils principaux dans une micro-VM Gondolin.

## Pourquoi

Un agent IA peut lancer du code généré ou du code d'un dépôt inconnu :

```bash
npm install
npm test
python script.py
./setup.sh
```

Ces commandes peuvent lire des fichiers, exfiltrer des tokens ou modifier ton système si elles tournent directement sur l'hôte. Gondolin réduit ce risque en exécutant ces actions dans une petite VM Linux locale, avec réseau et filesystem contrôlés par l'hôte.

## Lancement

Depuis un projet :

```bash
pi -e ~/.pi/agent/optional-extensions/gondolin-sandbox.ts
```

Alias pratique à mettre dans ton shell :

```bash
alias pisafe='pi -e ~/.pi/agent/optional-extensions/gondolin-sandbox.ts'
```

Puis :

```bash
cd /chemin/vers/projet
pisafe
```

## Ce que l'extension fait

Quand elle est active, elle remplace les outils Pi suivants :

- `read`
- `write`
- `edit`
- `bash`

Ces outils s'exécutent dans la VM Gondolin au lieu de tourner directement sur l'hôte.

Le dossier courant du projet est monté dans la VM ici :

```text
/workspace
```

Donc si tu lances `pisafe` depuis `/home/me/projet`, l'agent voit le projet dans `/workspace`.

## Permissions filesystem

Le projet est monté en lecture/écriture, donc les modifications de code voulues sont persistées sur l'hôte.

Par contre l'extension masque certains fichiers sensibles :

```text
.env
.env.*
.npmrc
.pypirc
.netrc
.ssh/
.aws/
.azure/
.config/gcloud/
secrets/
id_rsa
id_ed25519
```

Ça protège contre les scripts qui tentent de lire des secrets locaux.

## `node_modules`

L'extension cache le `node_modules` de l'hôte et permet à la VM de créer son propre `node_modules` en mémoire.

Conséquences :

- la VM ne modifie pas ton vrai `node_modules`
- moins de risque de casser ton environnement local
- évite les problèmes d'architecture host/guest
- mais les dépendances installées dans la VM disparaissent quand la VM s'arrête

## Réseau

Par défaut, le réseau HTTP/HTTPS est refusé.

Pour autoriser certains hôtes :

```bash
GONDOLIN_ALLOW_HOSTS=registry.npmjs.org,github.com,api.github.com pisafe
```

Exemples :

```bash
# Autoriser npm uniquement
GONDOLIN_ALLOW_HOSTS=registry.npmjs.org pisafe

# Autoriser GitHub + npm
GONDOLIN_ALLOW_HOSTS=registry.npmjs.org,github.com,api.github.com pisafe
```

Évite `*` sauf cas exceptionnel. Tout hôte autorisé peut recevoir les données que le code dans la VM peut lire.

## Secrets

Cette extension ne passe pas tes vrais secrets dans la VM.

Même si Pi reçoit des variables d'environnement pour une commande, l'extension filtre les noms contenant :

```text
TOKEN
SECRET
PASSWORD
PASS
KEY
CREDENTIAL
```

Gondolin supporte aussi un mécanisme avancé de secrets par placeholder HTTP, mais il n'est pas activé ici par défaut. C'est plus sûr de l'ajouter au cas par cas.

## Ce que ça protège

Protège bien contre :

- scripts npm/pip/cargo suspects
- commandes shell générées par l'agent
- lecture accidentelle de `.env` / clés locales
- accès réseau non prévu
- modification de fichiers hors du projet

Ne protège pas contre :

- un bug d'évasion QEMU
- l'exfiltration vers un hôte que tu as explicitement autorisé
- un projet de confiance auquel tu exposes volontairement `.env`
- la consommation CPU/RAM excessive

## Pré-requis

```bash
node -v                 # >= 23.6, actuellement Node 24 recommandé
qemu-system-x86_64 --version
```

Test Gondolin standalone :

```bash
npx @earendil-works/gondolin bash
```

## Quand utiliser `pisafe`

Utilise `pisafe` pour :

- dépôts inconnus
- `npm install` / `pnpm install` sur code non audité
- scripts `setup.sh`
- tests qui exécutent beaucoup de code généré
- outils ou extensions que tu veux isoler

Utilise Pi normal pour :

- tes projets de confiance
- tâches rapides de lecture/édition
- quand le projet a besoin de ton vrai environnement local
