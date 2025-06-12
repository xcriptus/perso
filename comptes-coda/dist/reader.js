"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATA_DIR = void 0;
exports.askQuestion = askQuestion;
const dotenv = __importStar(require("dotenv"));
const etiquette1_1 = require("./etiquette1");
const operations_1 = require("./operations");
const readline = __importStar(require("readline"));
const coda_1 = require("./coda");
dotenv.config();
exports.DATA_DIR = "data";
const ETIQUETTES1_CACHE = `${exports.DATA_DIR}/etiquettes1.json`;
const OPERATIONS_CACHE = `${exports.DATA_DIR}/operations.json`;
// Fonctions utilitaires pour la couleur
function color(text, code) {
    return `\x1b[${code}m${text}\x1b[0m`;
}
function blue(text) {
    return color(text, 34);
}
function red(text) {
    return color(text, 31);
}
function green(text) {
    return color(text, 32);
}
function yellow(text) {
    return color(text, 33);
}
function magenta(text) {
    return color(text, 35);
}
function cyan(text) {
    return color(text, 36);
}
function white(text) {
    return color(text, 37);
}
// Retourne une date sous la forme "YYYY-MM-DD" à partir d'une date sous le forme "YYYY-MM-DDTHH:mm:ss.sssZ"
function formatDate(date) {
    if (!date)
        return "N/A";
    const d = (date instanceof Date) ? date : new Date(date);
    if (isNaN(d.getTime()))
        return "N/A";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
const LONGUEUR_LIGNE = 80; // Longueur de ligne pour l'affichage
function askQuestion(query) {
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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // const ETIQUETTES1 = await getEtiquettes1();
        // console.log("Etiquettes1:", ETIQUETTES1.length);
        var _a;
        // const OPERATIONS = await getOperations();
        // console.log("Operations:", OPERATIONS.length);
        const ETIQUETTES1 = yield (0, coda_1.loadOrFetch)(ETIQUETTES1_CACHE, etiquette1_1.getEtiquettes1, etiquette1_1.Etiquettes1PluralLabel);
        const OPERATIONS = yield (0, coda_1.loadOrFetch)(OPERATIONS_CACHE, operations_1.getOperations, operations_1.OperationsPluralLabel);
        let global_label_matches = 0;
        for (const operation of OPERATIONS) {
            let operation_label_matches = 0;
            console.log(blue(operation.code + " " + formatDate(operation.date_de_valeur) + "-".repeat(LONGUEUR_LIGNE)));
            for (const etiquette of ETIQUETTES1) {
                // Vérifie le compte de l'opération si des comptes sont définis dans l'étiquette
                if (etiquette.comptes.length !== 0) {
                    if (!etiquette.comptes.includes(operation._compte)) {
                        continue; // Skip if the compte does not match the expected comptes
                    }
                }
                // Vérifie si un des labels de l'étiquette correspond à l'info de l'opération
                for (const label of etiquette.labels) {
                    if ((_a = operation.info) === null || _a === void 0 ? void 0 : _a.includes(label)) {
                        global_label_matches++;
                        operation_label_matches;
                        // Colorie en rouge la partie qui correspond au label
                        const infoColored = operation.info.replace(new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g"), match => red(match));
                        const etiquetteColored = green(etiquette.etiquette1);
                        console.log(`  "${etiquetteColored}"   <-- ${infoColored}`);
                    }
                }
            }
        }
        console.log("Etiquettes1:", ETIQUETTES1.length);
        console.log("Operations:", OPERATIONS.length);
        console.log(`Global labels matched: ${global_label_matches}`);
    });
}
main().catch(console.error);
