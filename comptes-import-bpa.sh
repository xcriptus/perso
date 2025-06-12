#!/bin/bash
# Script pour importer les CSV de la BPA dans le format attendu par l'application comptes
# Ce script prend en paramètre le nom du fichier CSV, le code du compte, le dernier numéro d'opération,
# le dernier solde après import et le solde actuel du compte.
# Il génère un fichier de sortie dans le dossier output avec le nom out-<CSV>.csv
# Il utilise un fichier awk pour transformer le CSV en un format compatible avec l'application comptes.
#
# usage :
#    comptes-import-bpa.sh bCC-2025-05-29--29052025_59409 bCC 1238 983.90 2830.10
#
# TODO: aller chercher le CSV dans le dossier Downloads
# TODO: aller chercher le dernier numéro et solde dans la feuille de calcul Google Sheets
# TODO: utiliser bCC_2024-03-12__2025_06-01 comme nom de fichier
# TODO: faire un mode d'emploi pour télécharger le CSV depuis la BPA
# TODO: écrire directement dans la feuille de calcul Google Sheets
# TODO: faire une copie du fichier csv dans /D2/PERSO-LOCAL/BANQUE/BANQUE-BPA/CSV/...

if [ $# -lt 5 ]; then
  echo "Usage:    $0 <CSV> <CODE_COMPTE> <DERNIER_NUMERO> <DERNIER_SOLDE> <SOLDE_ACTUEL>" >&2
  echo "Exemple   $0 bCC-2025-06-10 bCC 1865 4375.39 9499.91"
  exit 1
fi

CSV=${1?}
CODE_COMPTE=${2?}         # e.g.  bCC
DERNIER_NUMERO=${3?}      # e.g.  1238 , numero de l'operation
                          # TODO: devrait etre calculé en fonction du dernier import
DERNIER_SOLDE=${4?}       # e.g. 983.90, solde apres le dernier impot
                          # TODO: devrait etre calculé en fonction du dernier import
SOLDE_ACTUEL=${5?}        # e.g. 2830.10, solde acutel, à prendre du compte BPA concerné

# voir les TODO: dans le fichier awk

# "Date de comptabilisation;Libelle simplifie;Libelle operation;Reference;Informations complementaires;Type operation;Categorie;Sous categorie;Debit;Credit;Date operation;Date de valeur;Pointage operation"
SEPARATOR=";"
BANQUE="BPA"         # e.g.  BPA
BANQUE_CSV_DIR=/D2/PERSO-LOCAL/BANQUE/BANQUE-$BANQUE/CSV/$CODE_COMPTE
MAIN_DIR=/D2/perso/
INPUT_DIR=${MAIN_DIR?}/input
UNIFIED_DIR=${MAIN_DIR?}/output/unifie
TMP_DIR=${MAIN_DIR?}/tmp
INPUT_FILE=${INPUT_DIR?}/${CSV?}.csv
UNIFIED_FILE=${UNIFIED_DIR?}/unifie-${CSV?}.csv
TMP_FILE=${TMP_DIR?}/tmp-${CSV?}.txt

# vérifie que le fichier d'entrée existe
if [ ! -f "${INPUT_FILE?}" ]; then
  echo "⚠️  Le fichier d'entrée ${INPUT_FILE?} n'existe pas." >&2
  exit 1
fi

# crée le dossier de sortie s'il n'existe pas
if [ ! -d "${UNIFIED_DIR?}" ]; then
  echo "Création du dossier de sortie ${UNIFIED_DIR?}."
  mkdir -p "${UNIFIED_DIR?}"
fi

# garde le header original
head -n 1 ${INPUT_FILE?} \
  | tr -d '\r' \
  > ${TMP_FILE?}

# inverse l'ordre des lignes et nettoie le csv d'origine
cat ${INPUT_FILE?} \
  | tail -n +2  \
  | tac \
  | tr -d '\r' \
  | sed -e 's/   */ /g' \
  >> ${TMP_FILE?}


cat ${TMP_FILE? } \
  | awk -F${SEPARATOR?} \
        -v code_compte="${CODE_COMPTE?}" \
        -v numero="${DERNIER_NUMERO?}" \
        -v solde="${DERNIER_SOLDE?}" \
        -v solde_actuel="${SOLDE_ACTUEL?}" \
        -v output="${UNIFIED_FILE?}" \
        -f src/comptes-import-bpa-awk.awk

# si gawk retourne une erreur, on quitte le script 
if [ $? -ne 0 ]; then
  echo "⚠️  Une erreur est survenue lors de l'exécution de gawk." >&2
  exit 1
fi
  
# demande à l'utilisateur s'il veut copier le fichier de sortie dans le dossier de la banque
read -p "Voulez-vous copier les fichiers csv (original/unifié) dans le dossier de la banque ? (o/n) " choix
if [[ "$choix" == "o" || "$choix" == "O" ]]; then
  # vérifie que le dossier de la banque existe
  if [ ! -d "${BANQUE_CSV_DIR?}" ]; then
    echo "Le dossier de la banque ${BANQUE_CSV_DIR?} n'existe pas. Création du dossier."
    mkdir -p "${BANQUE_CSV_DIR?}"
  fi
  cp "${INPUT_FILE?}" "${BANQUE_CSV_DIR?}/"
  cp "${UNIFIED_FILE?}" "${BANQUE_CSV_DIR?}/"
  echo "Fichiers copiés dans ${BANQUE_CSV_DIR?}/"
else
  echo "Fichiers non copiés."
fi
# Affiche le nombre de lignes du fichier de sortie
echo "Nombre de lignes dans le fichier de sortie : $(wc -l < "${UNIFIED_FILE?}")"
