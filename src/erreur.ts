import path from "path";
import fs from "fs";

export function erreur(message: string): void {
    const outputDir = path.join(__dirname, 'output');
    const logFile = path.join(outputDir, 'erreurs.log');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    fs.appendFileSync(logFile, `${new Date().toISOString()} - ${message}\n`);
    console.error("Erreur:", message);
}