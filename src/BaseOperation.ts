import {erreur} from "./erreur";

// Enumération des types d'opérations bancaires possibles
export enum TypeDOperation {
    carteBancaire = "carteBancaire",
    cheque = "cheque",
    depotDeCheque = "depotDeCheque",
    diversDivers = "diversDivers",
    fraisBancaires = "fraisBancaires",
    prelevement = "prelevement",
    retraitDEspeces = "retraitDEspeces",
    virement = "virement",
    virementRecu = "virementRecu",
    virtuel = "virtuel",
    inconnu = "inconnu"
}

// Fonction utilitaire pour parser une date au format "yyyy/mm/dd"
function parseDate(str: string): Date {
    const [yyyy, mm, dd] = str.split('/');
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (isNaN(d.getTime())) {
        erreur(`Date invalide : ${str}`);
    }
    return d;
}

// Classe représentant une opération bancaire de base
export class BaseOperation {
    // Attributs privés de l'opération
    private _dateDeComptabilisation: Date;
    private _dateDOperation: Date;
    private _dateDeValeur: Date;
    private _info: string;
    private _typeOperation: TypeDOperation;
    private _debit: string;
    private _credit: string;
    private _montant: string;
    private _pointage: string;
    private _compte: string;
    private _numero: number;
    private _code: string;
    private _solde: string;

    /**
     * Constructeur de l'opération bancaire
     * @param dateDeComptabilisation Date de comptabilisation (format "yyyy/mm/dd")
     * @param dateDOperation Date d'opération (format "yyyy/mm/dd")
     * @param dateDeValeur Date de valeur (format "yyyy/mm/dd")
     * @param info Informations complémentaires
     * @param typeOperation Type d'opération (enum)
     * @param debit Montant débité (string, négatif ou vide)
     * @param credit Montant crédité (string, positif ou vide)
     * @param pointage Statut de pointage ("0" ou "x")
     * @param compte Code du compte (string)
     * @param numero Numéro d'opération (number)
     * @param solde Solde du compte après opération (string)
     */
    constructor(
        dateDeComptabilisation: string,
        dateDOperation: string,
        dateDeValeur: string,
        info: string,
        typeOperation: TypeDOperation,
        debit: string,
        credit: string,
        pointage: string,
        compte: string,
        numero: number,
        solde: string
    ) {
        // Initialisation des attributs avec parsing et validation
        this._dateDeComptabilisation = parseDate(dateDeComptabilisation);
        this._dateDOperation = parseDate(dateDOperation);
        this._dateDeValeur = parseDate(dateDeValeur);
        this._info = info;
        this._typeOperation = typeOperation;
        this._debit = debit;
        this._credit = credit;
        this._pointage = pointage;
        this._compte = compte;
        this._numero = numero;
        this._solde = solde;

        // Génération d'un code unique pour l'opération
        this._code = this._compte + numero.toString().padStart(4, '0');

        // Calcul automatique du montant
        this._montant = this.calculateMontant();
        this.valider(); // Validation automatique dans le constructeur
    }

    // Calcule le montant de l'opération à partir du débit/crédit
    private calculateMontant(): string {
        if (this._debit !== '') return (-parseInt(this._debit)).toString();
        if (this._credit !== '') return this._credit;
        return '0'; // valeur par défaut qui sera invalidée par la validation
    }

    // Valide l'intégrité de l'opération (appelée automatiquement)
    public valider(): void {
        this.validerCompte();
        this.validerNumero();
        this.validerPointage();
        this.validerDebitCreditMontant();
        this.validerSolde();
    }

    // Vérifie la validité du code compte
    private validerCompte(): void {
        if (!/^[a-zA-Z]{3,4}$/.test(this._compte)) {
            erreur(`Compte invalide: ${this._compte}`);
        }
    }

    // Vérifie la validité du numéro d'opération
    private validerNumero(): void {
        if (!Number.isInteger(this._numero) || this._numero < 1 || this._numero > 9999) {
            erreur(`Numéro invalide: ${this._numero}`);
        }
    }

    // Vérifie la validité du pointage
    private validerPointage(): void {
        if (!["0", "x"].includes(this._pointage)) {
            erreur(`Pointage invalide: ${this._pointage}`);
        }
    }

    // Vérifie la validité du solde
    private validerSolde(): void {
        if (!/^[-+]?\d+$/.test(this._solde)) {
            erreur(`Solde invalide: ${this._solde}`);
        }
    }

    // Vérifie la cohérence entre débit, crédit et montant
    private validerDebitCreditMontant(): void {
        const debitNum = this._debit === '' ? null : parseInt(this._debit);
        const creditNum = this._credit === '' ? null : parseInt(this._credit);
        const montantNum = parseInt(this._montant);

        if (this._debit !== '' && this._credit !== '') {
            erreur("Débit et crédit ne peuvent pas être renseignés en même temps");
        }

        if (this._debit === '' && this._credit === '') {
            erreur("Un des champs crédit ou débit doit être renseigné");
        }

        if (this._debit !== '' && (isNaN(debitNum!) || debitNum! >= 0)) {
            erreur(`Débit doit être un entier négatif : ${this._debit}`);
        }

        if (this._credit !== '' && (isNaN(creditNum!) || creditNum! <= 0)) {
            erreur(`Crédit doit être un entier positif : ${this._credit}`);
        }

        if (this._debit !== '' && montantNum !== -debitNum!) {
            if (debitNum === null) {
                erreur(`Montant incohérent avec débit : montant=${montantNum}, debit erroné`)
            } else {
                erreur(`Montant incohérent avec débit : montant=${montantNum}, attendu=${-debitNum}`);
            }
        }

        if (this._credit !== '' && montantNum !== creditNum!) {
            erreur(`Montant incohérent avec crédit : montant=${montantNum}, attendu=${creditNum}`);
        }
    }

    // Getters pour accéder aux propriétés de l'opération
    get dateDeComptabilisation() { return this._dateDeComptabilisation; }
    get dateDOperation() { return this._dateDOperation; }
    get dateDeValeur() { return this._dateDeValeur; }
    get info() { return this._info; }
    get typeOperation() { return this._typeOperation; }
    get debit() { return this._debit; }
    get credit() { return this._credit; }
    get montant() { return this._montant; }
    get pointage() { return this._pointage; }
    get compte() { return this._compte; }
    get numero() { return this._numero; }
    get code() { return this._code; }
    get solde() { return this._solde; }
}
