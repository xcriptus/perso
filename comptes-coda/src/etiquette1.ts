import { getTableRows } from './coda'
import { CodaFieldMap } from './meta'
import { parseField } from './metaReader'

export class Etiquette1 {
    constructor(
        public etiquette1: string,
        public comptes: string[],
        public labels: string[],
        public description?: string,
        public frequence?: string,
        public max?: number,
        public min?: number,
        public mois?: number[]
    ) {}
}

export const Etiquette1Label = 'Etiquette1'
export const Etiquettes1PluralLabel = 'Etiquettes1'

//-----------------------------------------------------------------------------
//     Code implementation
//-----------------------------------------------------------------------------

export function etiquette1ToString(etiquette: Etiquette1): string {
    return `Etiquette: ${etiquette.etiquette1}, Comptes: ${etiquette.comptes.join(', ')}, Labels: ${etiquette.labels.join(', ')}, Description: ${etiquette.description || 'N/A'}, Fréquence: ${etiquette.frequence || 'N/A'}, Max: ${etiquette.max || 'N/A'}, Min: ${etiquette.min || 'N/A'}, Mois: ${etiquette.mois ? etiquette.mois.join(', ') : 'N/A'}`
}

const CODA_TABLE_TBL_ETIQUETTES1_ID = process.env.CODA_TABLE_TBL_ETIQUETTES1_ID!

export const Etiquette1CodaMap: Record<string, CodaFieldMap> = {
    etiquette1: { code: 'c-xZFi114wE3', type: 'string', required: true },
    comptes: {
        code: 'c-Gg_doNhHtv',
        type: 'string[]',
        separator: ',',
        required: true,
    },
    labels: {
        code: 'c-ujRKCbRZXP',
        type: 'string[]',
        separator: '\n',
        required: true,
    },
    description: { code: 'c-Cy8IE3Bf9V', type: 'string' },
    frequence: { code: 'c-JHiysf2fag', type: 'string' },
    max: { code: 'c-L-5YNTsVKx', type: 'number' },
    min: { code: 'c-W88fQfG0Zd', type: 'number' },
    mois: { code: 'c-RqGGuzQBh9', type: 'number[]', separator: ',' },
}

export async function getEtiquettes1(): Promise<Etiquette1[]> {
    const rows = await getTableRows(
        CODA_TABLE_TBL_ETIQUETTES1_ID,
        Etiquettes1PluralLabel
    )
    return rows.map((row: any) => {
        const values = row.values
        return new Etiquette1(
            parseField(
                values[Etiquette1CodaMap.etiquette1.code],
                Etiquette1CodaMap.etiquette1
            ),
            parseField(
                values[Etiquette1CodaMap.comptes.code],
                Etiquette1CodaMap.comptes
            ),
            parseField(
                values[Etiquette1CodaMap.labels.code],
                Etiquette1CodaMap.labels
            ),
            parseField(
                values[Etiquette1CodaMap.description.code],
                Etiquette1CodaMap.description
            ),
            parseField(
                values[Etiquette1CodaMap.frequence.code],
                Etiquette1CodaMap.frequence
            ),
            parseField(
                values[Etiquette1CodaMap.max.code],
                Etiquette1CodaMap.max
            ),
            parseField(
                values[Etiquette1CodaMap.min.code],
                Etiquette1CodaMap.min
            ),
            parseField(
                values[Etiquette1CodaMap.mois.code],
                Etiquette1CodaMap.mois
            )
        )
    })
}
