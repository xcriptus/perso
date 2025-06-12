"use strict";
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
exports.Etiquette1CodaMap = exports.TABLE_IMP_OPERATIONS_ID = exports.Etiquette1 = void 0;
exports.etiquette1ToString = etiquette1ToString;
exports.getEtiquettes1 = getEtiquettes1;
const coda_1 = require("./coda");
const metaReader_1 = require("./metaReader");
class Etiquette1 {
    constructor(etiquette1, comptes, labels, description, frequence, max, min, mois) {
        this.etiquette1 = etiquette1;
        this.comptes = comptes;
        this.labels = labels;
        this.description = description;
        this.frequence = frequence;
        this.max = max;
        this.min = min;
        this.mois = mois;
    }
}
exports.Etiquette1 = Etiquette1;
//-----------------------------------------------------------------------------
//     Code implementation
//-----------------------------------------------------------------------------
function etiquette1ToString(etiquette) {
    return `Etiquette: ${etiquette.etiquette1}, Comptes: ${etiquette.comptes.join(", ")}, Labels: ${etiquette.labels.join(", ")}, Description: ${etiquette.description || "N/A"}, Fréquence: ${etiquette.frequence || "N/A"}, Max: ${etiquette.max || "N/A"}, Min: ${etiquette.min || "N/A"}, Mois: ${etiquette.mois ? etiquette.mois.join(", ") : "N/A"}`;
}
const TABLE_TBL_ETIQUETTES1_ID = process.env.TABLE_TBL_ETIQUETTES1_ID;
exports.TABLE_IMP_OPERATIONS_ID = process.env.TABLE_IMP_OPERATIONS_ID;
exports.Etiquette1CodaMap = {
    etiquette1: { code: "c-xZFi114wE3", type: "string", required: true },
    comptes: { code: "c-Gg_doNhHtv", type: "string[]", separator: ",", required: true },
    labels: { code: "c-ujRKCbRZXP", type: "string[]", separator: "\n", required: true },
    description: { code: "c-Cy8IE3Bf9V", type: "string" },
    frequence: { code: "c-JHiysf2fag", type: "string" },
    max: { code: "c-L-5YNTsVKx", type: "number" },
    min: { code: "c-W88fQfG0Zd", type: "number" },
    mois: { code: "c-RqGGuzQBh9", type: "number[]", separator: "," }
};
function getEtiquettes1() {
    return __awaiter(this, void 0, void 0, function* () {
        const rows = yield (0, coda_1.getTableRows)(TABLE_TBL_ETIQUETTES1_ID);
        return rows.map((row) => {
            const values = row.values;
            return new Etiquette1((0, metaReader_1.parseField)(values[exports.Etiquette1CodaMap.etiquette1.code], exports.Etiquette1CodaMap.etiquette1), (0, metaReader_1.parseField)(values[exports.Etiquette1CodaMap.comptes.code], exports.Etiquette1CodaMap.comptes), (0, metaReader_1.parseField)(values[exports.Etiquette1CodaMap.labels.code], exports.Etiquette1CodaMap.labels), (0, metaReader_1.parseField)(values[exports.Etiquette1CodaMap.description.code], exports.Etiquette1CodaMap.description), (0, metaReader_1.parseField)(values[exports.Etiquette1CodaMap.frequence.code], exports.Etiquette1CodaMap.frequence), (0, metaReader_1.parseField)(values[exports.Etiquette1CodaMap.max.code], exports.Etiquette1CodaMap.max), (0, metaReader_1.parseField)(values[exports.Etiquette1CodaMap.min.code], exports.Etiquette1CodaMap.min), (0, metaReader_1.parseField)(values[exports.Etiquette1CodaMap.mois.code], exports.Etiquette1CodaMap.mois));
        });
    });
}
