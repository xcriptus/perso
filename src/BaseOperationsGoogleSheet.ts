import { TableGoogleSheet } from './TableGoogleSheet';


const SPREADSHEET_ID = '19argc7G_w5PMd-FFFkQ0BDBU2AgHhsHgHMNB9ANYwJE'
const TAB_NAME = 'Operations'
const HEADERS = [
    "_date de comptabilisation:Date!",
    "_date operation:Date!",
    "_date de valeur:Date!",
    "_info:String!",
    "_type operation:String!",
    "_debit:Real?",
    "_credit:Real?",
    "_pointage:{x,y}?",
    "_compte:String!",
    "_numero:Integer!",
    "_code:String!",
    "_montant:Real!",
    "_solde:Real!",
]
const DATE_FORMAT = 'YYYY/MM/DD'

/**
 * Classe représentant une table d'opérations de base dans un Google Sheet
 * Cette classe hérite de TableGoogleSheet et spécifie l'ID du Google Sheet,
 * le nom de l'onglet et la liste des colonnes dans le constructeur.
 */
export class BaseOperationsGoogleSheet extends TableGoogleSheet {
    constructor() {
        super(SPREADSHEET_ID, TAB_NAME, HEADERS, DATE_FORMAT);
    }

    /**
     * Ajoute une nouvelle opération
     * @param date - Date de l'opération (format YYYY/MM/DD)
     * @param description - Description de l'opération
     * @param montant - Montant de l'opération (nombre réel avec point décimal)
     * @param categorie - Catégorie de l'opération (optionnelle)
     * @param notes - Notes supplémentaires (optionnelles)
     * @returns true si l'opération a été ajoutée avec succès, false sinon
     */
    async addOperation(
        date: string,
        description: string,
        montant: number,
        categorie: string = '',
        notes: string = ''
    ): Promise<boolean> {
        // Convertir le montant en chaîne avec un point décimal
        const montantStr = montant.toString();

        // Ajouter la ligne avec les valeurs
        return await this.addRow([date, description, montantStr, categorie, notes]);
    }

    /**
     * Recherche des opérations par catégorie
     * @param categorie - Catégorie à rechercher
     * @returns Tableau des lignes correspondantes
     */
    async findByCategory(categorie: string): Promise<any[]> {
        try {
            // Obtenir le nombre total de lignes
            const lastRow = await this.getLastRow();
            const results = [];

            // Parcourir toutes les lignes de données (en commençant par la ligne 2)
            for (let i = 2; i <= lastRow; i++) {
                const row = await this.getRow(i);
                if (row && row[3] === categorie) { // L'index 3 correspond à la colonne "Catégorie"
                    results.push({
                        date: row[0],
                        description: row[1],
                        montant: parseFloat(row[2]),
                        categorie: row[3],
                        notes: row[4]
                    });
                }
            }

            return results;
        } catch (error) {
            console.error('Erreur lors de la recherche par catégorie:', error);
            throw error;
        }
    }

    /**
     * Calcule le total des montants pour une catégorie donnée
     * @param categorie - Catégorie pour laquelle calculer le total
     * @returns Le total des montants pour la catégorie spécifiée
     */
    async calculateTotalByCategory(categorie: string): Promise<number> {
        try {
            const operations = await this.findByCategory(categorie);
            return operations.reduce((total, op) => total + op.montant, 0);
        } catch (error) {
            console.error('Erreur lors du calcul du total par catégorie:', error);
            throw error;
        }
    }
}
