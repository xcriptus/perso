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
MAIN_DIR=/D2/perso/
INPUT_DIR=${MAIN_DIR?}/input
OUTPUT_DIR=${MAIN_DIR?}/output
TMP_DIR=${MAIN_DIR?}/tmp
INPUT_FILE=${INPUT_DIR?}/${CSV?}.csv
OUTPUT_FILE=${OUTPUT_DIR?}/out-${CSV?}.csv
TMP_FILE=${TMP_DIR?}/tmp-${CSV?}.txt

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
        -v output="${OUTPUT_FILE?}" \
        -f src/comptes-import-bpa-awk.awk