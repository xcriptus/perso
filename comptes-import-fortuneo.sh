#!/bin/bash
# Script pour importer les CSV de Fortuneo BPA dans le format attendu par l'application comptes
# Ce script prend en paramètre le nom du fichier CSV, le dernier numéro d'opération,
# le dernier solde après import et le solde actuel du compte. Le nom du compte est codé en dur : fCC.
# Le script génère un fichier de sortie dans le dossier output avec le nom out-<CSV>.csv
# Il utilise un fichier awk pour transformer le CSV en un format compatible avec l'application comptes.
#
# usage :
#    comptes-import-fortuneo.sh fCC_du_11_05_2025_au_11_06_2025 fCC 1238 983.90 2830.10
#
# DIR=/D2/PERSO-LOCAL/BANQUE/BANQUE-BPA/CSV/bCA

# TODO: aller chercher le CSV dans le dossier Downloads
# TODO: aller chercher le dernier numéro et solde dans la feuille de calcul Google Sheets
# TODO: faire un mode d'emploi pour télécharger le CSV depuis la BPA

if [ $# -lt 4 ]; then
  echo "Usage:    $0 <CSV> <DERNIER_NUMERO> <DERNIER_SOLDE> <SOLDE_ACTUEL>" >&2
  echo "Exemple   $0 fCC-2025-06-10 1865 4375.39 9499.91"
  exit 1
fi

CSV=${1?}
CODE_COMPTE="fCC"         # e.g.  bCC
DERNIER_NUMERO=${2?}      # e.g.  1238 , numero de l'operation
                          # TODO: devrait etre calculé en fonction du dernier import
DERNIER_SOLDE=${3?}       # e.g. 983.90, solde apres le dernier impot
                          # TODO: devrait etre calculé en fonction du dernier import
SOLDE_ACTUEL=${4?}        # e.g. 2830.10, solde acutel, à prendre du compte BPA concerné


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


# Fichier zip contenant le fichier .csv ~/Downloads/HistoriqueOperations_019666254240(4)
# Fichier créé : ~/Downloads/HistoriqueOperations_019666254240(4)/HistoriqueOperations_019666254240_du_01_10_2023_au_11_06_2025.csv

# Change l'encodage du fichier CSV d'entrée de ISO-8859-1 à US-ASCII//TRANSLIT
# Elimine les retours chariot \r et les espaces multiples
# Remplace les nombres au format "123,456" par 123.456
# Elimine les espaces devant les nombres positifs; "; 123" devient ";123"
cat "$INPUT_FILE" \
  | tail -n +2 \
  | cat <(echo "Date operation;Date valeur;libelle;Debit;Credit;") - \
  | iconv -f ISO-8859-1 -t US-ASCII//TRANSLIT \
  | sed -E 's/"?(-?[0-9]+),([0-9]+)"?/\1.\2/g' \
  | tr -d '\r' \
  | sed -e 's/   */ /g' \
  | sed -E s/'; *([0-9]+)/;\1/g' \
  > ${TMP_FILE?}


cat ${TMP_FILE? } \
  | awk "-F${SEPARATOR?}" \
        -v code_compte="${CODE_COMPTE?}" \
        -v numero="${DERNIER_NUMERO?}" \
        -v solde="${DERNIER_SOLDE?}" \
        -v solde_actuel="${SOLDE_ACTUEL?}" \
        -v output="${OUTPUT_FILE?}" \
        -f src/comptes-import-fortuneo-awk.awk