#!/bin/bash

TOKEN_NAME="comptes-coda"
API_TOKEN=$(awk -v name="$TOKEN_NAME" '$1 == name {print $2}' ~/.coda-tokens)
DOC_ID="WL5JxvhRRj"
TABLE_ID="table--BYvLj69gT"

JSON_FILE=tmp/test.json

# Appel API pour récupérer les lignes de la table
curl -s -H "Authorization: Bearer $API_TOKEN" \
    "https://coda.io/apis/v1/docs/$DOC_ID/tables/$TABLE_ID/rows" \
| sed -e 's/\\n/@@@/g' \
| jq -r '
        .items as $rows
        | [ $rows[].values | keys_unsorted ] | add | unique as $cols
        | ($cols),
        ($rows[].values | [ .[$cols[]] ])
        | @tsv
    ' \
| sed 's/\t/|/g' \
| head -n 20 \
> tmp/coda_data3.csv


mlr --csv --fs '|' --ofs '|' \
  cut -f c-xZFi114wE3,c-Gg_doNhHtv,c-WPfvLnglts,c-ujRKCbRZXP \
  then reorder -f c-xZFi114wE3,c-Gg_doNhHtv,c-WPfvLnglts,c-ujRKCbRZXP \
  tmp/coda_data3.csv

  # > tmp/coda_data3.csv    
    # #     .items as $rows
    # #     | [ $rows[].values | keys_unsorted ] | add | unique as $cols
    # #     | ($cols | @csv),
    # #     ($rows[].values | [ .[$cols[]] ] | @csv)
    # # '  > tmp/coda_data3.csv



    # | jq . #$JSON_FILE
#     > $JSON_FILE
# wc $JSON_FILE
# jq . $JSON_FILE
   # \
# | jq -r \
#     '
#         .items as $rows
#         | [ $rows[].values | keys_unsorted ] | add | unique as $cols
#         | ($cols | @csv),
#         ($rows[].values | [ .[$cols[]] ] | @csv)
#     '  > tmp/coda_data3.csv
#   | jq '.items[] | .values'