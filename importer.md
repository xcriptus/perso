Carte bCC CC bancaire
    bCC  Carte bCC bancaire                  (<0)
    fCC prefixe "CARTE "                     (<0)

Annulation carte bCC bancaire
    bCC  Carte bCC bancaire + solde positif ? (>0)
    fCC prefixe "ANN CARTE "             (>0) 

Cheque 
    bCC  Cheque                           (<0)
    fCC ? 

Depot de cheque
    bCC  Depot de cheque                  (>0)
    fCC ?

Retrait d'especes
    bCC  Retrait d'especes                (<0)
    fCC prefixe "RET DAB "

Prelevement
    bCC  Prelevement                      (<0)
    fCC ?

Virement
    bCC  cat(Virement)                    (>0)
    fCC prefixe "VIR " & <0

Virement recu  
    bCC  cat(Virement recu)               (>0)  
    fCC prefixe "VIR " & >0 

Divers
    bCC  Divers   (parts sociales, impots,... ) 
    fCC ?

Virtuel
    bCC  non
    fCC non

