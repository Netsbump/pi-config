# Pi Web

Ce setup inclut [`@jmfederico/pi-web`](https://pi.dev/packages/@jmfederico/pi-web?name=pi-web), une UI web locale pour Pi Coding Agent.

## À quoi ça sert

Pi Web ajoute une interface navigateur pour gérer :

- les projets ;
- les workspaces / git worktrees ;
- les sessions Pi persistantes ;
- plusieurs agents en parallèle ;
- les fichiers, terminaux et état Git depuis l'UI.

Modèle mental :

```text
Machine
  Project
    Workspace
      Session
```

## Installation / restauration

Après avoir cloné ce dépôt dans `~/.pi/agent` et synchronisé les packages Pi :

```bash
pi update --extensions
pi-web install
pi-web doctor
```

Puis ouvrir :

```text
http://127.0.0.1:8504
```

Commandes utiles :

```bash
pi-web status
pi-web logs
pi-web restart
pi-web doctor
pi-web version
pi-web uninstall
```

## Configuration locale

Pi Web écrit sa configuration runtime ici :

```text
~/.config/pi-web/config.json
```

Ce fichier est volontairement local à chaque machine et n'est pas versionné dans ce dépôt. Il peut contenir des chemins locaux, ports, machines distantes ou préférences propres à l'hôte.

## Services systemd utilisateur

`pi-web install` installe des services systemd utilisateur :

```text
~/.config/systemd/user/pi-web.service
~/.config/systemd/user/pi-web-sessiond.service
```

Sur une machine serveur où Pi Web doit rester actif après logout/reboot :

```bash
sudo loginctl enable-linger "$USER"
```

Sur un poste local, ce n'est pas obligatoire.

## Sécurité

Par défaut, Pi Web écoute en local :

```text
127.0.0.1:8504
```

Ne pas l'exposer directement sur Internet. Pour un accès distant, préférer SSH/VPN/reverse proxy authentifié, par exemple :

```bash
ssh -L 8504:127.0.0.1:8504 user@serveur
```

Puis ouvrir localement :

```text
http://127.0.0.1:8504
```
