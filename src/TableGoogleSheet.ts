import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { erreur } from './erreur';

/**
 * Type pour définir les contraintes d'une colonne
 * Le type peut être Date, Integer, Real, String
 * Si le type se termine par !, la colonne ne peut pas être vide
 * Si le type se termine par ?, la colonne peut être vide
 */
type ColumnDefinition = {
    name: string;
    type: 'Date' | 'Integer' | 'Real' | 'String';
    required: boolean;
};

/**
 * Classe représentant un tableau CSV stocké dans un onglet Google Sheet
 */
export class TableGoogleSheet {
    private spreadsheetId: string;
    private tabName: string;
    private columnDefinitions: ColumnDefinition[];
    private dateFormat: string;
    private sheets: any;

    /**
     * Constructeur de la classe TableGoogleSheet
     * @param spreadsheetId - ID du Google Sheet
     * @param tabName - Nom de l'onglet contenant le tableau
     * @param headers - Liste de paires ["col1:type1!", "col2:type2?", ...] où type peut être Date, Integer, Real, String
     *                  Si le type se termine par !, la colonne n'est jamais vide
     *                  Si le type se termine par ?, la colonne peut être vide
     * @param dateFormat - Format des dates (par défaut: YYYY/MM/DD)
     */
    constructor(spreadsheetId: string, tabName: string, headers: string[], dateFormat: string = 'YYYY/MM/DD') {
        this.spreadsheetId = spreadsheetId;
        this.tabName = tabName;
        this.dateFormat = dateFormat;
        this.columnDefinitions = this.parseHeaders(headers);

        // Initialiser l'API Google Sheets
        const credentials = require('../apis/google/credentials.json');
        const client = new google.auth.JWT(
            credentials.client_email,
            undefined,
            credentials.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
        );
        this.sheets = google.sheets({ version: 'v4', auth: client as JWT });
    }

    /**
     * Parse les en-têtes pour extraire les définitions de colonnes
     * @param headers - Liste de paires ["col1:type1!", "col2:type2?", ...]
     * @returns Liste des définitions de colonnes
     */
    private parseHeaders(headers: string[]): ColumnDefinition[] {
        return headers.map(header => {
            const parts = header.split(':');
            if (parts.length !== 2) {
                throw new Error(`Format d'en-tête invalide: ${header}. Format attendu: "nom:type!" ou "nom:type?"`);
            }

            const name = parts[0];
            const typeWithConstraint = parts[1];

            let type: 'Date' | 'Integer' | 'Real' | 'String';
            let required = false;

            if (typeWithConstraint.endsWith('!')) {
                type = typeWithConstraint.slice(0, -1) as 'Date' | 'Integer' | 'Real' | 'String';
                required = true;
            } else if (typeWithConstraint.endsWith('?')) {
                type = typeWithConstraint.slice(0, -1) as 'Date' | 'Integer' | 'Real' | 'String';
                required = false;
            } else {
                type = typeWithConstraint as 'Date' | 'Integer' | 'Real' | 'String';
                required = false;
            }

            // Vérifier que le type est valide
            if (!['Date', 'Integer', 'Real', 'String'].includes(type)) {
                throw new Error(`Type invalide: ${type}. Types valides: Date, Integer, Real, String`);
            }

            return { name, type, required };
        });
    }

    /**
     * Vérifie que la première ligne contient exactement les noms de colonnes attendus
     * @returns true si l'en-tête correspond exactement aux noms de colonnes, false sinon
     */
    async checkHeader(): Promise<boolean> {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: this.tabName,
            });

            const values = response.data.values;

            // Si aucune donnée n'est trouvée, l'en-tête n'existe pas
            if (!values || values.length === 0) {
                erreur(`En-tête manquant: aucune donnée trouvée dans l'onglet "${this.tabName}"`);
                return false;
            }

            // Récupérer la première ligne (l'en-tête)
            const headerRow = values[0];

            // Vérifier si l'en-tête existe
            if (!headerRow) {
                erreur(`En-tête manquant: la première ligne est vide dans l'onglet "${this.tabName}"`);
                return false;
            }

            // Extraire les noms de colonnes attendus
            const expectedHeaders = this.columnDefinitions.map(col => col.name);

            // Vérifier si le nombre de colonnes correspond
            if (headerRow.length !== expectedHeaders.length) {
                erreur(`Nombre de colonnes incorrect: attendu ${expectedHeaders.length}, trouvé ${headerRow.length} dans l'onglet "${this.tabName}"`);
                return false;
            }

            // Vérifier si chaque colonne correspond exactement au nom attendu
            const mismatchedHeaders = [];
            for (let i = 0; i < expectedHeaders.length; i++) {
                if (headerRow[i] !== expectedHeaders[i]) {
                    mismatchedHeaders.push({
                        index: i,
                        expected: expectedHeaders[i],
                        actual: headerRow[i] || '(vide)'
                    });
                }
            }

            // Si des en-têtes ne correspondent pas, générer un message d'erreur détaillé
            if (mismatchedHeaders.length > 0) {
                let errorMessage = `En-têtes incorrects dans l'onglet "${this.tabName}":\n`;
                errorMessage += `En-têtes attendus: ${JSON.stringify(expectedHeaders)}\n`;
                errorMessage += `En-têtes trouvés: ${JSON.stringify(headerRow)}\n`;
                errorMessage += `Détails des différences:\n`;
                mismatchedHeaders.forEach(mismatch => {
                    errorMessage += `  - Colonne ${mismatch.index + 1}: attendu "${mismatch.expected}", trouvé "${mismatch.actual}"\n`;
                });
                erreur(errorMessage);
                return false;
            }

            // Tous les noms de colonnes correspondent
            return true;
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'en-tête:', error);
            throw error;
        }
    }

    /**
     * Vérifie qu'il n'y a pas de lignes vides, sauf à la fin
     * @returns true si aucune ligne vide n'est trouvée au milieu des données, false sinon
     */
    async checkNoBlankLines(): Promise<boolean> {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: this.tabName,
            });

            const values = response.data.values;

            // Si aucune donnée n'est trouvée
            if (!values || values.length === 0) {
                return true; // Pas de données, pas de problème
            }

            // Trouver l'index de la dernière ligne non vide
            let lastNonEmptyRowIndex = -1;
            for (let i = values.length - 1; i >= 0; i--) {
                const row = values[i];
                if (row && row.length > 0 && row.some((cell: any) => cell !== null && cell !== undefined && cell !== '')) {
                    lastNonEmptyRowIndex = i;
                    break;
                }
            }

            // Si aucune ligne non vide n'est trouvée
            if (lastNonEmptyRowIndex === -1) {
                return true; // Pas de données non vides, pas de problème
            }

            // Vérifier s'il y a des lignes vides au milieu des données
            const emptyRowsInMiddle = [];
            for (let i = 1; i < lastNonEmptyRowIndex; i++) { // Commencer à 1 pour sauter l'en-tête
                const row = values[i];
                if (!row || row.length === 0 || row.every((cell: any) => cell === null || cell === undefined || cell === '')) {
                    emptyRowsInMiddle.push(i + 1); // +1 pour l'index 1-indexed
                }
            }

            // Générer un message d'erreur si nécessaire
            if (emptyRowsInMiddle.length > 0) {
                const errorMessage = `Lignes vides trouvées au milieu des données dans l'onglet "${this.tabName}":\n` +
                    `Lignes vides: ${emptyRowsInMiddle.join(', ')}`;
                erreur(errorMessage);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Erreur lors de la vérification des lignes vides:', error);
            throw error;
        }
    }

    /**
     * Vérifie qu'il n'y a pas de lignes plus longues que l'en-tête
     * @returns true si aucune ligne n'est plus longue que l'en-tête, false sinon
     */
    async checkWidth(): Promise<boolean> {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: this.tabName,
            });

            const values = response.data.values;

            // Si aucune donnée n'est trouvée
            if (!values || values.length === 0) {
                return true; // Pas de données, pas de problème
            }

            // Récupérer l'en-tête (première ligne)
            const headerRow = values[0];
            const headerLength = headerRow ? headerRow.length : 0;

            // Vérifier si des lignes sont plus longues que l'en-tête
            const longRows = [];
            for (let i = 1; i < values.length; i++) { // Commencer à 1 pour sauter l'en-tête
                const row = values[i];
                if (row && row.length > headerLength) {
                    longRows.push({
                        rowIndex: i + 1, // +1 pour l'index 1-indexed
                        rowLength: row.length,
                        headerLength: headerLength
                    });
                }
            }

            // Générer un message d'erreur si nécessaire
            if (longRows.length > 0) {
                const errorMessage = `Lignes plus longues que l'en-tête trouvées dans l'onglet "${this.tabName}":\n` +
                    longRows.map(row => `  - Ligne ${row.rowIndex}: longueur ${row.rowLength}, en-tête: ${row.headerLength}`).join('\n');
                erreur(errorMessage);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Erreur lors de la vérification de la largeur des lignes:', error);
            throw error;
        }
    }

    /**
     * Vérifie que la colonne mentionnée contient uniquement des valeurs correspondant au type spécifié
     * @param columnName - Nom de la colonne à vérifier
     * @returns true si toutes les valeurs de la colonne correspondent au type spécifié, false sinon
     */
    async checkColumnTypes(columnName: string): Promise<boolean> {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: this.tabName,
            });

            const values = response.data.values;

            // Si aucune donnée n'est trouvée
            if (!values || values.length === 0) {
                return true; // Pas de données, pas de problème
            }

            // Récupérer l'en-tête (première ligne)
            const headerRow = values[0];
            if (!headerRow) {
                erreur(`En-tête manquant dans l'onglet "${this.tabName}"`);
                return false;
            }

            // Trouver l'index de la colonne
            const columnIndex = headerRow.findIndex((header: any) => header === columnName);
            if (columnIndex === -1) {
                erreur(`Colonne "${columnName}" non trouvée dans l'en-tête de l'onglet "${this.tabName}"`);
                return false;
            }

            // Trouver la définition de la colonne
            const columnDef = this.columnDefinitions.find(col => col.name === columnName);
            if (!columnDef) {
                erreur(`Définition de la colonne "${columnName}" non trouvée`);
                return false;
            }

            // Vérifier chaque valeur de la colonne
            const errors = [];
            for (let i = 1; i < values.length; i++) { // Commencer à 1 pour sauter l'en-tête
                const row = values[i];
                if (!row) continue; // Ignorer les lignes vides

                const value = row[columnIndex];
                const isEmpty = value === null || value === undefined || value === '';

                // Vérifier si la valeur peut être vide
                if (isEmpty && columnDef.required) {
                    errors.push({
                        rowIndex: i + 1, // +1 pour l'index 1-indexed
                        value: '(vide)',
                        error: 'Valeur obligatoire manquante'
                    });
                    continue;
                }

                // Si la valeur est vide et n'est pas obligatoire, passer à la valeur suivante
                if (isEmpty && !columnDef.required) {
                    continue;
                }

                // Vérifier le type de la valeur
                let isValid = false;
                switch (columnDef.type) {
                    case 'Date':
                        // Vérifier si la valeur est une date valide au format spécifié
                        isValid = this.isValidDate(value);
                        break;
                    case 'Integer':
                        // Vérifier si la valeur est un entier
                        isValid = /^-?\d+$/.test(value);
                        break;
                    case 'Real':
                        // Vérifier si la valeur est un nombre réel (avec un point décimal, pas une virgule)
                        isValid = /^-?\d+(\.\d+)?$/.test(value);
                        break;
                    case 'String':
                        // Toutes les valeurs sont valides pour le type String
                        isValid = true;
                        break;
                }

                if (!isValid) {
                    errors.push({
                        rowIndex: i + 1, // +1 pour l'index 1-indexed
                        value: value,
                        error: `Valeur invalide pour le type ${columnDef.type}`
                    });
                }
            }

            // Générer un message d'erreur si nécessaire
            if (errors.length > 0) {
                let errorMessage = `Erreurs de type dans la colonne "${columnName}" de l'onglet "${this.tabName}":\n`;
                errors.forEach(error => {
                    errorMessage += `  - Ligne ${error.rowIndex}: valeur "${error.value}", erreur: ${error.error}\n`;
                });
                erreur(errorMessage);
                return false;
            }

            return true;
        } catch (error) {
            console.error(`Erreur lors de la vérification des types de la colonne "${columnName}":`, error);
            throw error;
        }
    }

    /**
     * Vérifie si une chaîne est une date valide au format spécifié
     * @param dateString - Chaîne à vérifier
     * @returns true si la chaîne est une date valide, false sinon
     */
    private isValidDate(dateString: string): boolean {
        if (this.dateFormat === 'YYYY/MM/DD') {
            // Format YYYY/MM/DD
            const regex = /^\d{4}\/\d{2}\/\d{2}$/;
            if (!regex.test(dateString)) return false;

            // Vérifier si la date est valide
            const parts = dateString.split('/');
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Les mois commencent à 0 en JavaScript
            const day = parseInt(parts[2], 10);

            const date = new Date(year, month, day);
            return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
        }

        // Ajouter d'autres formats de date si nécessaire

        return false;
    }

    /**
     * Exécute toutes les vérifications
     * @returns true si toutes les vérifications sont passées, false sinon
     */
    async check(): Promise<boolean> {
        try {
            // Vérifier l'en-tête
            const headerOk = await this.checkHeader();
            if (!headerOk) return false;

            // Vérifier les lignes vides
            const noBlankLinesOk = await this.checkNoBlankLines();
            if (!noBlankLinesOk) return false;

            // Vérifier la largeur des lignes
            const widthOk = await this.checkWidth();
            if (!widthOk) return false;

            // Vérifier les types de chaque colonne
            for (const columnDef of this.columnDefinitions) {
                const columnTypesOk = await this.checkColumnTypes(columnDef.name);
                if (!columnTypesOk) return false;
            }

            return true;
        } catch (error) {
            console.error('Erreur lors de l\'exécution des vérifications:', error);
            throw error;
        }
    }

    /**
     * Retourne le numéro de la dernière ligne non vide
     * @returns Le numéro de la dernière ligne non vide (1-indexed)
     */
    async getLastRow(): Promise<number> {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: this.tabName,
            });

            const values = response.data.values;

            // Si aucune donnée n'est trouvée
            if (!values || values.length === 0) {
                return 0; // Pas de données
            }

            // Trouver l'index de la dernière ligne non vide
            for (let i = values.length - 1; i >= 0; i--) {
                const row = values[i];
                if (row && row.length > 0 && row.some((cell: any) => cell !== null && cell !== undefined && cell !== '')) {
                    return i + 1; // +1 pour l'index 1-indexed
                }
            }

            return 0; // Toutes les lignes sont vides
        } catch (error) {
            console.error('Erreur lors de la recherche de la dernière ligne non vide:', error);
            throw error;
        }
    }

    /**
     * Retourne la ligne n (sachant que la première ligne est l'en-tête)
     * @param n - Numéro de la ligne à retourner (2 pour la première ligne de données)
     * @returns La ligne demandée ou null si la ligne n'existe pas
     */
    async getRow(n: number): Promise<string[] | null> {
        if (n < 2) {
            throw new Error('Le numéro de ligne doit être supérieur ou égal à 2 (la ligne 1 est l\'en-tête)');
        }

        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${this.tabName}!A${n}:Z${n}`, // Récupérer la ligne n
            });

            const values = response.data.values;

            // Si aucune donnée n'est trouvée
            if (!values || values.length === 0) {
                return null; // La ligne n'existe pas
            }

            return values[0]; // Retourner la ligne
        } catch (error) {
            console.error(`Erreur lors de la récupération de la ligne ${n}:`, error);
            throw error;
        }
    }

    /**
     * Ajoute une ligne en fin de tableau
     * @param values - Valeurs à ajouter
     * @returns true si l'opération a réussi, false sinon
     */
    async addRow(values: any[]): Promise<boolean> {
        try {
            // Vérifier que le nombre de valeurs correspond au nombre de colonnes
            if (values.length !== this.columnDefinitions.length) {
                erreur(`Nombre de valeurs incorrect: attendu ${this.columnDefinitions.length}, reçu ${values.length}`);
                return false;
            }

            // Vérifier les types des valeurs
            for (let i = 0; i < values.length; i++) {
                const value = values[i];
                const columnDef = this.columnDefinitions[i];
                const isEmpty = value === null || value === undefined || value === '';

                // Vérifier si la valeur peut être vide
                if (isEmpty && columnDef.required) {
                    erreur(`Valeur obligatoire manquante pour la colonne "${columnDef.name}"`);
                    return false;
                }

                // Si la valeur est vide et n'est pas obligatoire, passer à la valeur suivante
                if (isEmpty && !columnDef.required) {
                    continue;
                }

                // Vérifier le type de la valeur
                let isValid = false;
                switch (columnDef.type) {
                    case 'Date':
                        // Vérifier si la valeur est une date valide au format spécifié
                        isValid = this.isValidDate(value);
                        break;
                    case 'Integer':
                        // Vérifier si la valeur est un entier
                        isValid = /^-?\d+$/.test(value);
                        break;
                    case 'Real':
                        // Vérifier si la valeur est un nombre réel (avec un point décimal, pas une virgule)
                        isValid = /^-?\d+(\.\d+)?$/.test(value);
                        break;
                    case 'String':
                        // Toutes les valeurs sont valides pour le type String
                        isValid = true;
                        break;
                }

                if (!isValid) {
                    erreur(`Valeur invalide pour la colonne "${columnDef.name}": "${value}" (type attendu: ${columnDef.type})`);
                    return false;
                }
            }

            // Trouver la première ligne vide
            const lastRow = await this.getLastRow();
            const newRowIndex = lastRow + 1;

            // Ajouter la ligne
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `${this.tabName}!A${newRowIndex}`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [values],
                },
            });

            return true;
        } catch (error) {
            console.error('Erreur lors de l\'ajout d\'une ligne:', error);
            throw error;
        }
    }
}
