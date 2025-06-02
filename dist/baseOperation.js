"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseOperation = exports.TypeDOperation = void 0;
const erreur_1 = require("./erreur");
var TypeDOperation;
(function (TypeDOperation) {
    TypeDOperation["carteBancaire"] = "carteBancaire";
    TypeDOperation["cheque"] = "cheque";
    TypeDOperation["depotDeCheque"] = "depotDeCheque";
    TypeDOperation["diversDivers"] = "diversDivers";
    TypeDOperation["fraisBancaires"] = "fraisBancaires";
    TypeDOperation["prelevement"] = "prelevement";
    TypeDOperation["retraitDEspeces"] = "retraitDEspeces";
    TypeDOperation["virement"] = "virement";
    TypeDOperation["virementRecu"] = "virementRecu";
    TypeDOperation["virtuel"] = "virtuel";
    TypeDOperation["inconnu"] = "inconnu";
})(TypeDOperation = exports.TypeDOperation || (exports.TypeDOperation = {}));
function parseDate(str) {
    const [yyyy, mm, dd] = str.split('/');
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (isNaN(d.getTime())) {
        (0, erreur_1.erreur)(`Date invalide : ${str}`);
    }
    return d;
}
class BaseOperation {
    constructor(dateDeComptabilisation, dateDOperation, dateDeValeur, info, typeOperation, debit, credit, pointage, compte, numero, solde) {
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
        this._code = this._compte + numero.toString().padStart(4, '0');
        this._montant = this.calculateMontant();
        this.valider(); // Validation automatique dans le constructeur
    }
    calculateMontant() {
        if (this._debit !== '')
            return (-parseInt(this._debit)).toString();
        if (this._credit !== '')
            return this._credit;
        return '0'; // valeur par défaut qui sera invalidée par la validation
    }
    valider() {
        this.validerCompte();
        this.validerNumero();
        this.validerPointage();
        this.validerDebitCreditMontant();
        this.validerSolde();
    }
    validerCompte() {
        if (!/^[a-zA-Z]{3,4}$/.test(this._compte)) {
            (0, erreur_1.erreur)(`Compte invalide: ${this._compte}`);
        }
    }
    validerNumero() {
        if (!Number.isInteger(this._numero) || this._numero < 1 || this._numero > 9999) {
            (0, erreur_1.erreur)(`Numéro invalide: ${this._numero}`);
        }
    }
    validerPointage() {
        if (!["0", "x"].includes(this._pointage)) {
            (0, erreur_1.erreur)(`Pointage invalide: ${this._pointage}`);
        }
    }
    validerSolde() {
        if (!/^[-+]?\d+$/.test(this._solde)) {
            (0, erreur_1.erreur)(`Solde invalide: ${this._solde}`);
        }
    }
    validerDebitCreditMontant() {
        const debitNum = this._debit === '' ? null : parseInt(this._debit);
        const creditNum = this._credit === '' ? null : parseInt(this._credit);
        const montantNum = parseInt(this._montant);
        if (this._debit !== '' && this._credit !== '') {
            (0, erreur_1.erreur)("Débit et crédit ne peuvent pas être renseignés en même temps");
        }
        if (this._debit === '' && this._credit === '') {
            (0, erreur_1.erreur)("Un des champs crédit ou débit doit être renseigné");
        }
        if (this._debit !== '' && (isNaN(debitNum) || debitNum >= 0)) {
            (0, erreur_1.erreur)(`Débit doit être un entier négatif : ${this._debit}`);
        }
        if (this._credit !== '' && (isNaN(creditNum) || creditNum <= 0)) {
            (0, erreur_1.erreur)(`Crédit doit être un entier positif : ${this._credit}`);
        }
        if (this._debit !== '' && montantNum !== -debitNum) {
            if (debitNum === null) {
                (0, erreur_1.erreur)(`Montant incohérent avec débit : montant=${montantNum}, debit erroné`);
            }
            else {
                (0, erreur_1.erreur)(`Montant incohérent avec débit : montant=${montantNum}, attendu=${-debitNum}`);
            }
        }
        if (this._credit !== '' && montantNum !== creditNum) {
            (0, erreur_1.erreur)(`Montant incohérent avec crédit : montant=${montantNum}, attendu=${creditNum}`);
        }
    }
    // Getters
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
exports.BaseOperation = BaseOperation;
