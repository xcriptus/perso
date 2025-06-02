comptes-import-bpa.sh
----------------------
Script pour importer les fichiers CSV produits par la bpa, donc en
particulier le compte courant bCC.
Fait simplement la conversion du fichier dans input/ en un fichier
dans output/.

A priori presque terminé. Faire des tests. Voir aussi les TODOs.

src/*.ts
--------
Initialement le plan était de faire le logiciel} d'import (voir plus?)
en typescript. Fait a la main, la conservation de csv, avec bash/awk. 
Ca a l'air plus simple et assez direct. A voir. Reste a voir si le
la lecture/ecriture de google sheet est facile. Même chose avec les 
heuristiques de calcul des étiquettes. A voir.
