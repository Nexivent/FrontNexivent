// utils/constants.ts

export interface DocumentType {
  value: string;
  label: string;
  length: number;
  isExact: boolean;
  isNumeric: boolean;
}

export const DOCUMENTS_TYPES: DocumentType[] = [
  {
    value: '01',
    label: 'DNI',
    length: 8,
    isExact: true,
    isNumeric: true,
  },
  {
    value: '02',
    label: 'RUC',
    length: 11,
    isExact: true,
    isNumeric: true,
  },
  {
    value: '03',
    label: 'Carnet de Extranjería',
    length: 12,
    isExact: false,
    isNumeric: false,
  },
];
