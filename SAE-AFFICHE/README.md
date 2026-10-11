# Utopia — caméra et vinyles

Ouvrir via un serveur, pas en double-cliquant sur index.html : le protocole file:// peut bloquer le chargement du GLB et l'accès caméra.

Depuis ce dossier :

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Puis ouvrir http://127.0.0.1:8765 sur le même ordinateur. Sur téléphone, héberger les fichiers web en HTTPS ; une adresse HTTP sur le Wi-Fi ne suffit pas.

## Version actuelle

- A-Frame 1.5.0 et MindAR 1.2.5 conservés.
- Demande de caméra avant dès le chargement ; aucun menu d'entrée.
- Caméra en plein écran avec carrousel de 19 vinyles en bas ; police Anthony, étiquettes colorées et titres.
- HYAENA sélectionné au départ, tentative de lecture automatique. Si le navigateur bloque le son, toucher le vinyle. Toucher à nouveau pour mettre en pause.
- Défilement avec centrage ; changement de morceau après stabilisation. Toucher un disque voisin pour le sélectionner.
- Réglages via l'icône en haut à droite : taille, hauteur, mouvement des tresses et réinitialisation.
- Échelle par défaut 10,8 (+12,5 % par rapport à 9,6). Curseur de 3,6 à 18, centré sur 10,8.
- Tresses : chaque segment du squelette, inertie des pointes, rappel amorti et gravité dans l'espace caméra ; souplesse croissante vers les extrémités et angles limités. Collisions retirées ; les tresses peuvent traverser le modèle.
- La gravité suit l'orientation du téléphone si le capteur est autorisé ; sinon elle pointe vers le bas de l'écran. Sur iOS, le premier toucher sur un vinyle peut déclencher la demande d'accès aux mouvements. Un refus ne bloque ni la caméra ni la musique.
- Pause de la caméra et de la musique en arrière-plan ; reprise explicite.

## MP3 intégrés

Les 19 MP3 fournis sont associés dans l'ordre de l'album. Les noms d'origine, y compris leurs espaces, sont conservés dans assets/audio/ et encodés dans les URL. La liste est dans assets/audio/README.md.

Le vinyle tourne pendant la lecture ; un toucher sur le disque sélectionné met en pause le son et la rotation. Un nouveau toucher reprend au même endroit. Sélectionner un autre disque démarre son morceau.

## Validation

Cible : Safari et Chrome à jour sur iPhone 12 et ultérieurs, et Samsung de puissance comparable.

Vérifié : syntaxe JavaScript, présence de 19 cartes, sélection et chemin du premier MP3, refus d'autoplay, changement de titre, pause en arrière-plan, réinitialisation à 10,8 et fichier manquant. Test : node tools/check-app.cjs. Interface inspectée à 390 × 844 dans le navigateur intégré.

Non validé : caméra réelle et proportions du masque sur téléphone, comportement physique des tresses en mouvement réel, capteurs iOS/Android, lecture des MP3 de l'album (absents). Le navigateur intégré n'a pas terminé l'initialisation caméra lors du contrôle. Ces limites ne constituent pas une validation Safari/Chrome sur appareil.

## Fichiers web

index.html, style.css, app.js, face.js, assets/fonts/Anthony.otf, assets/fonts/fonts.css, assets/models/travis-head.glb et les MP3 de assets/audio/. Le fichier Blender, les FBX et les scripts de préparation n'ont pas besoin d'être mis en ligne.


Vérification du lecteur dans le navigateur : HYAENA chargé (223,68 s), temps de lecture qui avance et rotation active ; toucher → audio et rotation en pause ; nouveau toucher → reprise ; sélection de THANK GOD → nouveau morceau en lecture. Les 19 chemins correspondent à des fichiers présents non vides.
