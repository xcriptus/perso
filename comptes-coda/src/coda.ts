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

export async function loadOrFetch<T>(
    cachePath: string,
    fetchFn: () => Promise<T>,
    label: string
): Promise<T> {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR)
    let useCache = false
    if (fs.existsSync(cachePath)) {
        const ans = await askQuestion(
            `Voulez-vous télécharger à nouveau les ${label} (o/n) ? `
        )
        useCache = ans.trim().toLowerCase() !== 'o'
    }
    if (useCache) {
        const data = JSON.parse(fs.readFileSync(cachePath, 'utf-8'))
        console.log(`${label}: ${data.length}`)
        return data
    } else {
        const data = await fetchFn()
        fs.writeFileSync(cachePath, JSON.stringify(data, null, 2), 'utf-8')
        console.log(`${label}: ${data.length}`)
        return data
    }
}
