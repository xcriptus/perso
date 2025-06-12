import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const CODA_API_TOKEN = process.env.CODA_API_TOKEN!;
console.log("CODA_API_TOKEN:", CODA_API_TOKEN);
const DOC_ID = process.env.DOC_ID!;
console.log("DOC_ID:", DOC_ID);
const BASE_URL = "https://coda.io/apis/v1";

const headers = {
  Authorization: `Bearer ${CODA_API_TOKEN}`,
};

export async function getTableRows(tableId: string) {
  const url = `${BASE_URL}/docs/${DOC_ID}/tables/${tableId}/rows`;
  console.log("Fetching rows from:", url);
  const res = await axios.get(url, { headers });
  return res.data.items;
}

export async function addRow(tableId: string, cells: {column: string, value: any}[]) {
  const url = `${BASE_URL}/docs/${DOC_ID}/tables/${tableId}/rows`;
  const res = await axios.post(
    url,
    { rows: [{ cells }] },
    { headers }
  );
  return res.data;
}