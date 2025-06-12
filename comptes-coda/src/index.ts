import { getTableRows, addRow } from "./coda";
import * as dotenv from "dotenv";
dotenv.config();

const TABLE_TBL_ETIQUETTES1_ID = process.env.TABLE_TBL_ETIQUETTES1_ID!;
console.log("TABLE_TBL_ETIQUETTES1_ID=====:", TABLE_TBL_ETIQUETTES1_ID);
const TABLE_IMP_OPERATIONS_ID = process.env.TABLE_IMP_OPERATIONS_ID!;

async function main() {
  // Lire les deux tables
  const etiquettes1_rows = await getTableRows(TABLE_TBL_ETIQUETTES1_ID);
  // const table2Rows = await getTableRows(TABLE2_ID);

  console.log("Etiquettes1:", etiquettes1_rows);
//   // console.log("Table 2 rows:", table2Rows);

//   // Exemple : écrire une nouvelle ligne dans la table 1
// //   await addRow(TABLE1_ID, [
// //     { column: "NomColonne1", value: "Nouvelle valeur" },
// //     { column: "NomColonne2", value: 123 }
// //   ]);
//   //console.log("Nouvelle ligne ajoutée !");
}

main().catch(console.error);