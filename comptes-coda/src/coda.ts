import axios from 'axios'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import { DATA_DIR, askQuestion } from './reader'
dotenv.config()

const CODA_API_TOKEN = process.env.CODA_API_TOKEN!
//console.log("CODA_API_TOKEN:", CODA_API_TOKEN);
const CODA_DOC_ID = process.env.CODA_DOC_ID!
//console.log("DOC_ID:", DOC_ID);
const CODA_BASE_URL = 'https://coda.io/apis/v1'

const headers = {
    Authorization: `Bearer ${CODA_API_TOKEN}`,
}

export async function getTableRows(
    tableId: string,
    label?: string
): Promise<any[]> {
    let url = `${CODA_BASE_URL}/docs/${CODA_DOC_ID}/tables/${tableId}/rows`
    let rows: any[] = []
    let pageToken: string | undefined = undefined
    let firstPage = true

    if (label) {
        process.stdout.write(`Lecture de ${label} : `)
    }

    do {
        const params: any = {}
        if (pageToken) params.pageToken = pageToken
        const res = await axios.get(url, { headers, params })
        rows = rows.concat(res.data.items)
        if (label) process.stdout.write('.')
        pageToken = res.data.nextPageToken
    } while (pageToken)

    if (label) {
        process.stdout.write(` ${rows.length} ${label}\n`)
    }

    return rows
}

export async function addRow(
    tableId: string,
    cells: { column: string; value: any }[]
) {
    const url = `${CODA_BASE_URL}/docs/${CODA_DOC_ID}/tables/${tableId}/rows`
    const res = await axios.post(url, { rows: [{ cells }] }, { headers })
    return res.data
}

function getCacheMode(): "yes" | "ask" | "no" {
    const idx = process.argv.indexOf("--cache")
    if (idx !== -1 && process.argv[idx + 1]) {
        const val = process.argv[idx + 1].toLowerCase()
        if (val === "yes" || val === "ask" || val === "no") return val
    }
    return "ask" // valeur par défaut
}


export async function loadOrFetch<T extends any[]>(cachePath: string, fetchFn: () => Promise<T>, label: string): Promise<T> {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR)
    let useCache = false
    const cacheMode = getCacheMode()
    if (fs.existsSync(cachePath)) {
        if (cacheMode === "yes") {
            useCache = true
        } else if (cacheMode === "no") {
            useCache = false
        } else if (cacheMode === "ask") {
            const ans = await askQuestion(`Voulez-vous télécharger les données ${label} (o/n) ? `)
            useCache = (ans.trim().toLowerCase() !== "o")
        }
    }
    // Si le cache n'existe pas, on fetch obligatoirement
    if (useCache) {
        const data = JSON.parse(fs.readFileSync(cachePath, "utf-8"))
        console.log(`${label}: ${data.length}`)
        return data
    } else {
        const data = await fetchFn()
        fs.writeFileSync(cachePath, JSON.stringify(data, null, 2), "utf-8")
        console.log(`${label}: ${data.length}`)
        return data
    }
}