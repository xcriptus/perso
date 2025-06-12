import * as dotenv from "dotenv";
import { getEtiquettes1 } from "./etiquette1";
import { getOperations } from "./operations";

dotenv.config();

// Exemple d'utilisation
async function main() {
  const etiquettes1 = await getEtiquettes1();
  console.log("Etiquettes1:", etiquettes1);

  const operations = await getOperations();
  console.log("Operations:", operations);
}

main().catch(console.error);