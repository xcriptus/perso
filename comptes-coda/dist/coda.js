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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTableRows = getTableRows;
exports.addRow = addRow;
exports.loadOrFetch = loadOrFetch;
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
const reader_1 = require("./reader");
dotenv.config();
const CODA_API_TOKEN = process.env.CODA_API_TOKEN;
//console.log("CODA_API_TOKEN:", CODA_API_TOKEN);
const CODA_DOC_ID = process.env.CODA_DOC_ID;
//console.log("DOC_ID:", DOC_ID);
const CODA_BASE_URL = 'https://coda.io/apis/v1';
const headers = {
    Authorization: `Bearer ${CODA_API_TOKEN}`,
};
function getTableRows(tableId, label) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = `${CODA_BASE_URL}/docs/${CODA_DOC_ID}/tables/${tableId}/rows`;
        let rows = [];
        let pageToken = undefined;
        let firstPage = true;
        if (label) {
            process.stdout.write(`Lecture de ${label} : `);
        }
        do {
            const params = {};
            if (pageToken)
                params.pageToken = pageToken;
            const res = yield axios_1.default.get(url, { headers, params });
            rows = rows.concat(res.data.items);
            if (label)
                process.stdout.write('.');
            pageToken = res.data.nextPageToken;
        } while (pageToken);
        if (label) {
            process.stdout.write(` ${rows.length} ${label}\n`);
        }
        return rows;
    });
}
function addRow(tableId, cells) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${CODA_BASE_URL}/docs/${CODA_DOC_ID}/tables/${tableId}/rows`;
        const res = yield axios_1.default.post(url, { rows: [{ cells }] }, { headers });
        return res.data;
    });
}
function getCacheMode() {
    const idx = process.argv.indexOf("--cache");
    if (idx !== -1 && process.argv[idx + 1]) {
        const val = process.argv[idx + 1].toLowerCase();
        if (val === "yes" || val === "ask" || val === "no")
            return val;
    }
    return "ask"; // valeur par défaut
}
function loadOrFetch(cachePath, fetchFn, label) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs.existsSync(reader_1.DATA_DIR))
            fs.mkdirSync(reader_1.DATA_DIR);
        let useCache = false;
        const cacheMode = getCacheMode();
        if (fs.existsSync(cachePath)) {
            if (cacheMode === "yes") {
                useCache = true;
            }
            else if (cacheMode === "no") {
                useCache = false;
            }
            else if (cacheMode === "ask") {
                const ans = yield (0, reader_1.askQuestion)(`Voulez-vous télécharger les données ${label} (o/n) ? `);
                useCache = (ans.trim().toLowerCase() !== "o");
            }
        }
        // Si le cache n'existe pas, on fetch obligatoirement
        if (useCache) {
            const data = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
            console.log(`${label}: ${data.length}`);
            return data;
        }
        else {
            const data = yield fetchFn();
            fs.writeFileSync(cachePath, JSON.stringify(data, null, 2), "utf-8");
            console.log(`${label}: ${data.length}`);
            return data;
        }
    });
}
