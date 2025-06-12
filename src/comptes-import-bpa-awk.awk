function erreur(champ, message) {
  print "⚠️ Erreur, ligne #" NR " - <" champ ">: " message > "/dev/stderr"
}

function normalise_nombre(val) {
    gsub(",", ".", val)         # Remplace la virgule par un point
    sub(/^\+/, "", val)         # Supprime le + en début de chaîne
    return val
}
function normalise_date(champ, date) {
    n = split(date, d, "/")
    if (n == 3) {
        return d[3] "/" d[2] "/" d[1]
    } else {
        erreur(champ, "format JJ/MM/AAAA invalide : " date)
        return date
    }
}

function checkDate(champ, val) {
  # print "⚠️" > "/dev/stderr"
  if ( val !~/^20[0-9][0-9]\/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])$/) {
    erreur(champ,  val " n est pas une date valide.")
  }
}

function checkInt(champ, val, signe, vide) {
  # Vérifie que val est un nombre avec point décimal
  if (vide=="vide" && val=="") {
    return 0
  }
  if (val !~ /^\+?-?[0-9]+(\.[0-9]+)?$/) {
    erreur(champ, val " n est pas un nombre valide." )
    return 0
  }

  num = val + 0  # force en numérique

  # Appliquer le test selon le signe
  if      (signe == "<0"  && !(num < 0))   erreur(champ, val " n est pas < 0")
  else if (signe == ">0"  && !(num > 0))   erreur(champ, val " n est pas > 0")
  else if (signe == "<=0" && !(num <= 0))  erreur(champ, val " n est pas <= 0")
  else if (signe == ">=0" && !(num >= 0))  erreur(champ, val " n est pas >= 0")
}

function is_equal(x, y, eps) {
    return (x - y + 0.0< eps) && (y - x + 0.0 < eps)
}

#---- body -----------------------------------------------------------------------------------------

  BEGIN {
      # solde=solde+0.0                  # conversion vers un nombre
      # solde_actuel=solde_actuel+0.0    # conversion vers un nombre
      print "_date de comptabilisation;_date operation;_date de valeur;_info;_type operation;_debit;_credit;_pointage;_compte;_numero;_code;_montant;_solde" > output
      num_ligne = 0
  }
  # lit le header
  NR == 1 {
    for (i = 1; i <= NF; i++) {
      H[$i] = i
      # print i "=" $i
    }
    next
  }
  {
    num_ligne++

    champ = "Date de comptabilisation"
    date_de_comptabilisation  = normalise_date(champ, $(H[champ]))
    checkDate(champ, date_de_comptabilisation)

    champ = "Date operation"
    date_operation            = normalise_date(champ, $(H[champ]))
    checkDate(champ, date_operation)

    champ = "Date de valeur"
    date_de_valeur            = normalise_date(champ, $(H[champ]))
    checkDate(champ, date_de_valeur)

    info                      = "|1 "  $(H["Libelle simplifie"])
    info                      = info " |2 "  $(H["Libelle operation"])
    info                      = info " |3 "  $(H["Informations complementaires"])
    info                      = info " |4 "  $(H["Type operation"])
    info                      = info " |5 "  $(H["Categorie"])
    info                      = info " |6 "  $(H["Sous categorie"])
    info                      = info " |7"  $(H["Reference"])

    type_operation            = $(H["Type operation"])
    # TODO: vérifier si il faut faire un calcul ou pas
    #       voir le fichier importer.md

    debit                     = normalise_nombre($(H["Debit"]))
    checkInt("Debit", debit, "0<", "vide")

    credit                    = normalise_nombre($(H["Credit"]))
    checkInt("Credit", credit, ">0", "vide")

    pointage                  = $(H["Pointage operation"])

    compte                    = code_compte

    numero++

    code                      = compte sprintf("%04d", numero)

    montant                   = debit ? debit : credit

    solde                     = solde + montant
         # printf "\n\n\n" >> output

    printf "%s;%s;%s;", date_de_comptabilisation, date_operation, date_de_valeur >> output
    printf "%s;", info >> output
    printf "%s;%s;%s;%s;", type_operation, debit, credit, pointage >> output
    printf "%s;%s;%s;%s;%s", code_compte, numero, code, montant, solde >> output
    printf "\n" >> output
  }
  NR == 2 {
    premiere_date = date_de_comptabilisation
    premier_code_operation = code
  }
  END {
    printf "%s opérations du %s au %s\n", num_ligne, premiere_date, date_de_comptabilisation
    printf "solde calculé = %s\n", solde
    printf "solde actuel = %s\n", solde_actuel
    if (is_equal(solde,solde_actuel,0.01)) {
       print "✅   Le solde calculé est le correct. Super !"
       balance="ok"
    } else {
       print "⚠️   ERREUR ! Solde actuel (" solde_actuel ") != solde calculé (" solde ")" > "/dev/stderr"
       balance="ko"
    }
    if (balance == "ok") {
      exit 0
    } else {
      exit 1
    }
  }
