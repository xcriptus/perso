import { getTableRows } from "./coda";
import { TABLE_IMP_OPERATIONS_ID } from "./etiquette1";
import { CodaFieldMap } from "./meta";
import { parseField } from "./metaReader";


export class Operation {
  constructor(
    public code: string,
    public _compte: string,
    public mois?: string,
    public date_de_comptabilisation?: Date,
    public date_operation?: Date,
    public date_de_valeur?: Date,
    public montant?: number,
    public etiquette1?: string,
    public type_particulier?: string,
    public type?: string,
    public info?: string,
    public row_range?: string,
    public _type_operation?: string
  ) {}
}



//-----------------------------------------------------------------------------
//     Code implementation
//-----------------------------------------------------------------------------

export const OperationCodaMap: Record<string, CodaFieldMap> = {
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

export function operationToString(operation: Operation): string {
  return `Code: ${operation.code}, Compte: ${operation._compte}, Mois: ${operation.mois || "N/A"}, Date de comptabilisation: ${operation.date_de_comptabilisation?.toISOString() || "N/A"}, Date d'opération: ${operation.date_operation?.toISOString() || "N/A"}, Date de valeur: ${operation.date_de_valeur?.toISOString() || "N/A"}, Montant: ${operation.montant || "N/A"}, Etiquette1: ${operation.etiquette1 || "N/A"}, Type particulier: ${operation.type_particulier || "N/A"}, Type: ${operation.type || "N/A"}, Info: ${operation.info || "N/A"}, Row range: ${operation.row_range || "N/A"}, Type d'opération: ${operation._type_operation || "N/A"}`;
}export async function getOperations(): Promise<Operation[]> {
    const rows = await getTableRows(TABLE_IMP_OPERATIONS_ID);
    return rows.map((row: any) => {
        const values = row.values;
        return new Operation(
            parseField(values[OperationCodaMap.code.code], OperationCodaMap.code),
            parseField(values[OperationCodaMap._compte.code], OperationCodaMap._compte),
            parseField(values[OperationCodaMap.mois.code], OperationCodaMap.mois),
            parseField(values[OperationCodaMap.date_de_comptabilisation.code], OperationCodaMap.date_de_comptabilisation),
            parseField(values[OperationCodaMap.date_operation.code], OperationCodaMap.date_operation),
            parseField(values[OperationCodaMap.date_de_valeur.code], OperationCodaMap.date_de_valeur),
            parseField(values[OperationCodaMap.montant.code], OperationCodaMap.montant),
            parseField(values[OperationCodaMap.etiquette1.code], OperationCodaMap.etiquette1),
            parseField(values[OperationCodaMap.type_particulier.code], OperationCodaMap.type_particulier),
            parseField(values[OperationCodaMap.type.code], OperationCodaMap.type),
            parseField(values[OperationCodaMap.info.code], OperationCodaMap.info),
            parseField(values[OperationCodaMap.row_range.code], OperationCodaMap.row_range),
            parseField(values[OperationCodaMap._type_operation.code], OperationCodaMap._type_operation)
        );
    });
}

