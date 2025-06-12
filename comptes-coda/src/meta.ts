export type CodaFieldType =
    | 'string'
    | 'number'
    | 'string[]'
    | 'number[]'
    | 'date'

export interface CodaFieldMap {
    code: string
    type: CodaFieldType
    separator?: string // présent si c'est un tableau
    required?: boolean // true = obligatoire (!), false/undefined = optionnel (?)
}
