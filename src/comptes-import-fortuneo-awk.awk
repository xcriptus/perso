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

# function infere_type_operation(info) {

# }

#---- body -----------------------------------------------------------------------------------------

  BEGIN {
      DEBUG=0     # solde=solde+0.0                  # conversion vers un nombre
      PRINT_HEADER=0
      printf "" > output
      # solde_actuel=solde_actuel+0.0    # conversion vers un nombre
      if (PRINT_HEADER) {
        print "_date de comptabilisation;_date operation;_date de valeur;_info;_type operation;_debit;_credit;_pointage;_compte;_numero;_code;_montant;_solde" >> output
      }
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

    champ = "Date operation"
    date_de_comptabilisation  = normalise_date(champ, $(H[champ]))
    checkDate(champ, date_de_comptabilisation)

    # champ = "Date operation"
    date_operation            = date_de_comptabilisation
    # checkDate(champ, date_operation)

    champ = "Date valeur"
    date_de_valeur            = normalise_date(champ, $(H[champ]))
    checkDate(champ, date_de_valeur)

    champ = "libelle"
    libelle                      = $(H[champ])

    # sera éventuellement utilisé pour inférer le type d'opération
    type_operation               = "TODO"
    info                         = libelle # éventuellement modifié plus tard 

    champ = "Debit"
    debit                     = normalise_nombre($(H[champ]))
    checkInt(champ, debit, "0<", "vide")

    champ = "Credit"
    credit                    = normalise_nombre($(H[champ]))
    checkInt(champ, credit, ">0", "vide")

    pointage                  = "0"

    compte                    = code_compte

    numero++

    code                      = compte sprintf("%04d", numero)

    montant                   = debit ? debit : credit

    solde                     = solde + montant


    changement = 0
    # infère le type d'opération/info à partir du libellé et amélior
    if (match(libelle, /CARTE ([0-9][0-9]\/[0-9][0-9]) (.*$)/, m)) {
      checkInt("montant(Carte bancaire)", montant, "<0")
      type_operation = "Carte bancaire"
      info = "CB- " m[1] " " m[2]
      changement = 1
    } else if (match(libelle, /ANN CARTE (.*$)/, m)) {   
      checkInt("montant(Carte bancaire)", montant, ">0")
      type_operation = "Carte bancaire"
      info = "CB+ " m[1]
      changement = 1
    } else if (match(libelle, /RET DAB ([0-9][0-9]\/[0-9][0-9])(\/[0-9][0-9])? (.*)/, m)) {
      checkInt("montant(Carte bancaire)", montant, "<0")
      type_operation = "Retrait d'especes"
      info = "CB- DAB " m[1]m[2] " " m[3]
      changement = 1
    } else if (match(libelle, /VIR (.*)/, m))  {
      if (montant < 0) {
        type_operation = "Virement"
        info = "VIR- " m[1]
      } else {
        type_operation = "Virement recu"
        info = "VIR+ " m[1]        
      }      
      changement = 1
    } else if (match(libelle, /CHQ (.*)/, m))  {
      if (montant < 0) {
        type_operation = "Cheque"
        info = "CHQ- " m[1]
      } else {
        type_operation = "Depot de cheque"
        info = "CHQ+ " m[1]        
      }      
      changement = 1
    } else {
      erreur("libelle", "Impossible d'inférer le type d'opération depuis  : " libelle)
      type_operation = "TODO"
    }

    if (DEBUG) {
      if (changement) {
        print(libelle "     ->  "type_operation " || " info " || " montant)
      }
   }

    printf("%s;%s;%s;", date_de_comptabilisation, date_operation, date_de_valeur) >> output
    printf("%s;", info) >> output
    printf("%s;%s;%s;%s;", type_operation, debit, credit, pointage) >> output
    printf("%s;%s;%s;%s;%s", code_compte, numero, code, montant, solde) >> output
    printf("\n") >> output
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
    print("NOTE: les types d'operation suivants ne sont pas encore inférés pour Fortuneo par manque d'exemples.")
    print("      Divers, Frais bancaires, Prelevement, Virtuel")
    if (balance == "ok") {
      exit 0
    } else {
      exit 1
    }
  }
