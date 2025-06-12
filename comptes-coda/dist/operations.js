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
exports.OperationCodaMap = exports.Operation = void 0;
exports.operationToString = operationToString;
exports.getOperations = getOperations;
const coda_1 = require("./coda");
const etiquette1_1 = require("./etiquette1");
const metaReader_1 = require("./metaReader");
class Operation {
    constructor(code, _compte, mois, date_de_comptabilisation, date_operation, date_de_valeur, montant, etiquette1, type_particulier, type, info, row_range, _type_operation) {
        this.code = code;
        this._compte = _compte;
        this.mois = mois;
        this.date_de_comptabilisation = date_de_comptabilisation;
        this.date_operation = date_operation;
        this.date_de_valeur = date_de_valeur;
        this.montant = montant;
        this.etiquette1 = etiquette1;
        this.type_particulier = type_particulier;
        this.type = type;
        this.info = info;
        this.row_range = row_range;
        this._type_operation = _type_operation;
    }
}
exports.Operation = Operation;
//-----------------------------------------------------------------------------
//     Code implementation
//-----------------------------------------------------------------------------
exports.OperationCodaMap = {
    code: { code: "c-jU5fUA1C4a", type: "string", required: true },
    _compte: { code: "c-joKUG8V6vc", type: "string", required: true },
    mois: { code: "c-vbPibkLB9E", type: "string" },
    date_de_comptabilisation: { code: "c-6wnL9MuwrD", type: "date", required: true },
    date_operation: { code: "c-ARc0H_kcu-", type: "date", required: true },
    date_de_valeur: { code: "c-ZUql8jWs5p", type: "date", required: true },
    montant: { code: "c-Qjr0-Bm5KX", type: "number", required: true },
    etiquette1: { code: "c-5_sANii1S4", type: "string", required: true },
    type_particulier: { code: "c-IbA_1DKLjU", type: "string" },
    type: { code: "c-NpArY9tQkQ", type: "string" },
    info: { code: "c-APXj7XQtAz", type: "string" },
    row_range: { code: "c-Vw65-XEw-t", type: "string", required: true },
    _type_operation: { code: "c-S3c81aSWNS", type: "string" }
};
function operationToString(operation) {
    var _a, _b, _c;
    return `Code: ${operation.code}, Compte: ${operation._compte}, Mois: ${operation.mois || "N/A"}, Date de comptabilisation: ${((_a = operation.date_de_comptabilisation) === null || _a === void 0 ? void 0 : _a.toISOString()) || "N/A"}, Date d'opération: ${((_b = operation.date_operation) === null || _b === void 0 ? void 0 : _b.toISOString()) || "N/A"}, Date de valeur: ${((_c = operation.date_de_valeur) === null || _c === void 0 ? void 0 : _c.toISOString()) || "N/A"}, Montant: ${operation.montant || "N/A"}, Etiquette1: ${operation.etiquette1 || "N/A"}, Type particulier: ${operation.type_particulier || "N/A"}, Type: ${operation.type || "N/A"}, Info: ${operation.info || "N/A"}, Row range: ${operation.row_range || "N/A"}, Type d'opération: ${operation._type_operation || "N/A"}`;
}
function getOperations() {
    return __awaiter(this, void 0, void 0, function* () {
        const rows = yield (0, coda_1.getTableRows)(etiquette1_1.TABLE_IMP_OPERATIONS_ID);
        return rows.map((row) => {
            const values = row.values;
            return new Operation((0, metaReader_1.parseField)(values[exports.OperationCodaMap.code.code], exports.OperationCodaMap.code), (0, metaReader_1.parseField)(values[exports.OperationCodaMap._compte.code], exports.OperationCodaMap._compte), (0, metaReader_1.parseField)(values[exports.OperationCodaMap.mois.code], exports.OperationCodaMap.mois), (0, metaReader_1.parseField)(values[exports.OperationCodaMap.date_de_comptabilisation.code], exports.OperationCodaMap.date_de_comptabilisation), (0, metaReader_1.parseField)(values[exports.OperationCodaMap.date_operation.code], exports.OperationCodaMap.date_operation), (0, metaReader_1.parseField)(values[exports.OperationCodaMap.date_de_valeur.code], exports.OperationCodaMap.date_de_valeur), (0, metaReader_1.parseField)(values[exports.OperationCodaMap.montant.code], exports.OperationCodaMap.montant), (0, metaReader_1.parseField)(values[exports.OperationCodaMap.etiquette1.code], exports.OperationCodaMap.etiquette1), (0, metaReader_1.parseField)(values[exports.OperationCodaMap.type_particulier.code], exports.OperationCodaMap.type_particulier), (0, metaReader_1.parseField)(values[exports.OperationCodaMap.type.code], exports.OperationCodaMap.type), (0, metaReader_1.parseField)(values[exports.OperationCodaMap.info.code], exports.OperationCodaMap.info), (0, metaReader_1.parseField)(values[exports.OperationCodaMap.row_range.code], exports.OperationCodaMap.row_range), (0, metaReader_1.parseField)(values[exports.OperationCodaMap._type_operation.code], exports.OperationCodaMap._type_operation));
        });
    });
}
