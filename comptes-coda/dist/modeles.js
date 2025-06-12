"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Etiquette1 = exports.Etiquette1CodaMap = void 0;
exports.Etiquette1CodaMap = {
    etiquette1: { code: "c-xZFi114wE3", type: "string" },
    comptes: { code: "c-Gg_doNhHtv", type: "string[]", separator: "," },
    labels: { code: "c-ujRKCbRZXP", type: "string[]", separator: "\n" },
    description: { code: "c-Cy8IE3Bf9V", type: "string" },
    frequence: { code: "c-JHiysf2fag", type: "string" },
    max: { code: "c-L-5YNTsVKx", type: "number" },
    min: { code: "c-W88fQfG0Zd", type: "number" },
    mois: { code: "c-RqGGuzQBh9", type: "number[]", separator: "," }
};
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
