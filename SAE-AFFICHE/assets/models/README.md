# Tête Travis Scott — préparation WebAR

Source : variante standard « Fortnite -Travis Scott/Travis Scott.fbx ».

- travis-head.glb : tête, cou et cheveux, squelette conservé, textures embarquées ; 4 108 032 octets.
- travis-head-textured.blend : fichier Blender modifiable, textures intégrées. Choisir Material Preview ou Rendered pour les voir ; le mode Solid ne les affiche pas.
- travis-head-preview.png : rendu de contrôle Blender, pas une capture du navigateur.

Les matériaux utilisent head_d/hair_d pour la couleur et head_n/hair_n pour le relief. Textures ramenées à 1024 px. Les cartes _e ne sont pas utilisées : leur interprétation et un éventuel effet lumineux restent à décider. Le corps est exclu ; le cou est conservé. Le squelette contient 49 nœuds dyn_braid, y compris les extrémités. La présence de ces articulations permet une future animation mais ne constitue pas une simulation physique.

Export GLB 2.0 vérifié : deux maillages, un skin, quatre images intégrées ; aucune texture externe nécessaire. Le placement d'origine du squelette est conservé : il faudra calibrer la translation et l'échelle par rapport à l'ancrage MindAR. Les normal maps restent à contrôler sous l'éclairage final.

## Intégration à venir

Conserver A-Frame 1.5.0 et MindAR 1.2.5 du TP face-tracking. Charger la police avec ../fonts/fonts.css. Ajouter le GLB à un a-gltf-model attaché au visage. Calibrer le cou et l'occlusion avec la caméra réelle avant de finaliser le filtre.

## Cible iPhone / Safari

Servir en HTTPS ; demander la caméra avant sans microphone. Vidéo de caméra inline et muette. Démarrage explicite au toucher ; conserver un même lecteur audio pour les changements de piste, traiter les refus de play() et afficher un bouton de reprise. Ne pas supposer qu'un premier toucher garantit tous les autoplay suivants. Prévoir les marges safe-area, le changement d'orientation et le retour après verrouillage ou passage en arrière-plan.

À valider sur un véritable iPhone : permissions, alignement du masque, débit d'images, sélection musicale après défilement, pause/reprise et comportement après interruption. Aucun test iPhone ni intégration caméra n'a été effectué à ce stade.

Reproduction : tools/convert_model.py, exécuté avec Blender en mode arrière-plan depuis la racine du projet.
