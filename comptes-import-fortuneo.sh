#!/bin/bash
# Script pour importer les CSV de FORTUNEO BPA dans le format attendu par l'application comptes
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
  echo "Exemple   $0 fCC_du_2024_05_10_au_2025_06_23 1865 4375.39 9499.91"
  exit 1
fi

CSV=${1?}
DERNIER_NUMERO=${2?}      # e.g.  1238 , numéro de l'operation
                          # TODO: devrait être calculé en fonction du dernier import
DERNIER_SOLDE=${3?}       # e.g. 983.90, solde apres le dernier impôt
                          # TODO: devrait être calculé en fonction du dernier import
SOLDE_ACTUEL=${4?}        # e.g. 2830.10, solde actuel, à prendre du compte BPA concerné


# voir les TODO: dans le fichier awk

# "Date de comptabilisation;Libelle simplifie;Libelle operation;Reference;Informations complementaires;Type operation;Categorie;Sous categorie;Debit;Credit;Date operation;Date de valeur;Pointage operation"
SEPARATOR=";"
# Le code du compte est codé en dur pour Fortuneo
# car il n'y a qu'un seul compte à traiter pour l'instant 
CODE_COMPTE="fCC"         # e.g.  bCC
BANQUE="FORTUNEO"         # e.g.  BPA
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


# Fichier zip contenant le fichier .csv ~/Downloads/HistoriqueOperations_019666254240(4)
# Fichier créé : ~/Downloads/HistoriqueOperations_019666254240(4)/HistoriqueOperations_019666254240_du_01_10_2023_au_11_06_2025.csv

# met le header dans le fichier temporaire en ascii
echo "Date operation;Date valeur;libelle;Debit;Credit;" \
  > ${TMP_FILE?}

# Inverse l'ordre des lignes et nettoie le CSV d'origine
# Change l'encodage du fichier CSV d'entrée de ISO-8859-1 à US-ASCII//TRANSLIT
# Elimine les retours chariot \r et les espaces multiples
# Remplace les nombres au format "123,456" par 123.456
# Elimine les espaces devant les nombres positifs; "; 123" devient ";123"
cat "$INPUT_FILE" \
  | iconv -f ISO-8859-1 -t US-ASCII//TRANSLIT \
  | tail -n +2 \
  | tac \
  | sed -E 's/"?(-?[0-9]+),([0-9]+)"?/\1.\2/g' \
  | tr -d '\r' \
  | sed -e 's/   */ /g' \
  | sed -E s/'; *([0-9]+)/;\1/g' \
  >> ${TMP_FILE?}


cat ${TMP_FILE? } \
  | gawk "-F${SEPARATOR?}" \
        -v code_compte="${CODE_COMPTE?}" \
        -v numero="${DERNIER_NUMERO?}" \
        -v solde="${DERNIER_SOLDE?}" \
        -v solde_actuel="${SOLDE_ACTUEL?}" \
        -v output="${UNIFIED_FILE?}" \
        -f src/comptes-import-fortuneo-awk.awk

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
