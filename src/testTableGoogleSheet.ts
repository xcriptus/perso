import {TableGoogleSheet} from './TableGoogleSheet';

/**
 * Fonction de test pour la classe TableGoogleSheet
 */
async function testTableGoogleSheet() {
    console.log('=== Test de TableGoogleSheet ===');

    try {
        // ID du Google Sheet de test
        const spreadsheetId = '19argc7G_w5PMd-FFFkQ0BDBU2AgHhsHgHMNB9ANYwJE';
        const tabName = 'TEST_API';

        // Définition des colonnes
        const headers = [
            "_date de comptabilisation:Date!",
            "_date operation:Date!",
            "_date de valeur:Date!",
            "_info:String!",
            "_type operation:String!",
            "_debit:Real?",
            "_credit:Real?",
            "_pointage:String!",
            "_compte:String!",
            "_numero:Integer!",
            "_code:String!",
            "_montant:Real!",
            "_solde:Real!"
        ];

        // Création d'une instance de TableGoogleSheet
        console.log('Création d\'une instance de TableGoogleSheet...');
        const table = new TableGoogleSheet(spreadsheetId, tabName, headers);

        // Vérification de l'en-tête
        console.log('Vérification de l\'en-tête...');
        const headerOk = await table.checkHeader();
        console.log(`En-tête valide: ${headerOk}`);

        // Vérification des lignes vides
        console.log('Vérification des lignes vides...');
        const noBlankLinesOk = await table.checkNoBlankLines();
        console.log(`Pas de lignes vides au milieu: ${noBlankLinesOk}`);

        // Vérification de la largeur des lignes
        console.log('Vérification de la largeur des lignes...');
        const widthOk = await table.checkWidth();
        console.log(`Largeur des lignes correcte: ${widthOk}`);

        // Vérification des types de colonnes
        console.log('Vérification des types de colonnes...');
        const infoTypesOk = await table.checkColumnTypes('_info');
        console.log(`Types de la colonne _info valides: ${infoTypesOk}`);

        // Exécution de toutes les vérifications
        console.log('Exécution de toutes les vérifications...');
        const allChecksOk = await table.check();
        console.log(`Toutes les vérifications passées: ${allChecksOk}`);

        // Récupération de la dernière ligne
        console.log('Récupération de la dernière ligne...');
        const lastRow = await table.getLastRow();
        console.log(`Dernière ligne: ${lastRow}`);

        // Récupération d'une ligne spécifique
        if (lastRow >= 2) {
            console.log('Récupération de la ligne 2...');
            const row = await table.getRow(2);
            console.log(`Ligne 2: ${JSON.stringify(row)}`);
        }

        // Ajout d'une nouvelle ligne
        console.log('Ajout d\'une nouvelle ligne...');
        const rowAdded = await table.addRow([
            '2023/05/08', // _date de comptabilisation
            '2023/05/08', // _date operation
            '2023/05/08', // _date de valeur
            'Test info', // _info
            'Test type', // _type operation
            '-42.50', // _debit
            '', // _credit
            '0', // _pointage
            'TST', // _compte
            '42', // _numero
            'TST0042', // _code
            '-42.50', // _montant
            '9000.00' // _solde
        ]);
        console.log(`Ligne ajoutée: ${rowAdded}`);

    } catch (error) {
        console.error('Erreur lors du test de TableGoogleSheet:', error);
    }
}

/**
 * Fonction principale
 */
async function main() {
    try {
        await testTableGoogleSheet();
        console.log('\nTests terminés avec succès!');
    } catch (error) {
        console.error('Erreur lors des tests:', error);
    }
}

// Exécution de la fonction principale
main().catch(console.error);
