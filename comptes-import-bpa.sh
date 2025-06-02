# usage :
#    comptes-import-bpa.sh bCC-2025-05-29--29052025_59409 bCC 1238 983.90 2830.10
#DIR=/D2/PERSO-LOCAL/BANQUE/BANQUE-BPA/CSV/bCA

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

# inverse l'ordre des lignes et nettoite le csv d'origine
# TODO:voir si on change de separateur pour prendre par defaut celui proposé par la BPA
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