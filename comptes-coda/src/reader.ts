import * as dotenv from "dotenv";
import { Etiquettes1PluralLabel, getEtiquettes1 } from "./etiquette1";
import { OperationsPluralLabel, getOperations } from "./operations";
import * as readline from "readline";
import { loadOrFetch } from "./coda";


dotenv.config();

export const DATA_DIR = "data";
const ETIQUETTES1_CACHE = `${DATA_DIR}/etiquettes1.json`;
const OPERATIONS_CACHE = `${DATA_DIR}/operations.json`;

// Fonctions utilitaires pour la couleur
function color(text: string, code: number): string {
    return `\x1b[${code}m${text}\x1b[0m`
}
function blue(text: string): string {
    return color(text, 34)
}
function red(text: string): string {
    return color(text, 31)
}
function green(text: string): string {
    return color(text, 32)
}
function yellow(text: string): string {
    return color(text, 33)
}
function magenta(text: string): string {
    return color(text, 35)
}
function cyan(text: string): string {
    return color(text, 36)
}
function white(text: string): string {
    return color(text, 37)
}

// Retourne une date sous la forme "YYYY-MM-DD" à partir d'une date sous le forme "YYYY-MM-DDTHH:mm:ss.sssZ"
function formatDate(date: Date): string {
    if (!date) return "N/A"
    const d = (date instanceof Date) ? date : new Date(date)
    if (isNaN(d.getTime())) return "N/A"
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const LONGUEUR_LIGNE = 80; // Longueur de ligne pour l'affichage

export function askQuestion(query: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}



// Exemple d'utilisation
async function main() {
    // const ETIQUETTES1 = await getEtiquettes1();
    // console.log("Etiquettes1:", ETIQUETTES1.length);

    // const OPERATIONS = await getOperations();
    // console.log("Operations:", OPERATIONS.length);
    const ETIQUETTES1 = await loadOrFetch(ETIQUETTES1_CACHE, getEtiquettes1, Etiquettes1PluralLabel);
    const OPERATIONS = await loadOrFetch(OPERATIONS_CACHE, getOperations, OperationsPluralLabel);


    let global_label_matches = 0

    for (const operation of OPERATIONS) {
        let operation_label_matches = 0;

        console.log(blue(operation.code + " " + formatDate(operation.date_de_valeur!) + "-".repeat(LONGUEUR_LIGNE)))
        for (const etiquette of ETIQUETTES1) {
            // Vérifie le compte de l'opération si des comptes sont définis dans l'étiquette
            if (etiquette.comptes.length !== 0) {
                if (!etiquette.comptes.includes(operation._compte)) {
                    continue; // Skip if the compte does not match the expected comptes
                }
            }
            // Vérifie si un des labels de l'étiquette correspond à l'info de l'opération
            for (const label of etiquette.labels) {
                
                if (operation.info?.includes(label)) {
                    global_label_matches++;
                    operation_label_matches
                    // Colorie en rouge la partie qui correspond au label
                    const infoColored = operation.info.replace(
                        new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g"),
                        match => red(match)
                    );
                    const etiquetteColored = green(etiquette.etiquette1)
                    console.log( `  "${etiquetteColored}"   <-- ${infoColored}`
                    
                }
            }
        }
    }
    console.log("Etiquettes1:", ETIQUETTES1.length);
    console.log("Operations:", OPERATIONS.length);
    console.log(`Global labels matched: ${global_label_matches}`);
}



main().catch(console.error);