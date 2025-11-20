// utils/constants.ts

export interface DocumentType {
  value: string;
  label: string;
  length: number;
  isExact: boolean;
  isNumeric: boolean;
}

export const DOCUMENTS_TYPES = [
  {
    label: 'DNI',
    value: 'DNI',
    length: 8,
    isNumeric: true,
    isExact: true,
  },
  {
    label: 'Carnet de Extranjería',
    value: 'CE',
    length: 12,
    isNumeric: false,
    isExact: false,
  },
  {
    label: 'RUC - Persona Natural',
    value: 'RUC_PERSONA',
    length: 11,
    isNumeric: true,
    isExact: true,
  },
  {
    label: 'RUC - Empresa',
    value: 'RUC_EMPRESA',
    length: 11,
    isNumeric: true,
    isExact: true,
  },
];
