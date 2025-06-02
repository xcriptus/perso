"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.erreur = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function erreur(message) {
    const outputDir = path_1.default.join(__dirname, 'output');
    const logFile = path_1.default.join(outputDir, 'erreurs.log');
    if (!fs_1.default.existsSync(outputDir))
        fs_1.default.mkdirSync(outputDir);
    fs_1.default.appendFileSync(logFile, `${new Date().toISOString()} - ${message}\n`);
    console.error("Erreur:", message);
}
exports.erreur = erreur;
