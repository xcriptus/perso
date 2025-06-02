import {BaseOperationsGoogleSheet} from "./BaseOperationsGoogleSheet";

/**
 * Fonction de test pour la classe BaseOperationsGoogleSheet
 */
export async function testBaseOperationsGoogleSheet() {
    console.log('\n=== Test de BaseOperationsGoogleSheet ===');

    try {
        // Création d'une instance de BaseOperationsGoogleSheet
        console.log('Création d\'une instance de BaseOperationsGoogleSheet...');
        const operations = new BaseOperationsGoogleSheet();

        // Vérification de l'en-tête
        console.log('Vérification de l\'en-tête...');
        const headerOk = await operations.checkHeader();
        console.log(`En-tête valide: ${headerOk}`);

        // Ajout d'une nouvelle opération
        console.log('Ajout d\'une nouvelle opération...');
        const operationAdded = await operations.addOperation(
            '2023/12/15',
            'Achat fournitures',
            -125.50,
            'Fournitures',
            'Achat de papeterie'
        );
        console.log(`Opération ajoutée: ${operationAdded}`);

        // Recherche d'opérations par catégorie
        console.log('Recherche d\'opérations par catégorie...');
        const categoryOperations = await operations.findByCategory('Fournitures');
        console.log(`Opérations trouvées: ${categoryOperations.length}`);
        console.log(categoryOperations);

        // Calcul du total par catégorie
        console.log('Calcul du total par catégorie...');
        const categoryTotal = await operations.calculateTotalByCategory('Fournitures');
        console.log(`Total pour la catégorie Fournitures: ${categoryTotal}`);

    } catch (error) {
        console.error('Erreur lors du test de BaseOperationsGoogleSheet:', error);
    }
}

async function main() {
    try {
        await testBaseOperationsGoogleSheet();
        console.log('\nTests terminés avec succès!');
    } catch (error) {
        console.error('Erreur lors des tests:', error);
    }
}

main();