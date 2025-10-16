export const InvestmentGroupType = {
  INVALID: { value: 0, code: 'investmentGroupType.invalid' },
  AVAILABLE: { value: 100, code: 'investmentGroupType.available' },
  FULL: { value: 200, code: 'investmentGroupType.full' },
  SIGNED: { value: 300, code: 'investmentGroupType.signed' },
  DELETED: { value: 400, code: 'investmentGroupType.deleted' },
  DEFAULT: { value: 500, code: 'investmentGroupType.default' }
} as const;

export type InvestmentGroupKey = keyof typeof InvestmentGroupType;

export function getInvestmentGroupLabel(key: InvestmentGroupKey): string {
  const labels: Record<InvestmentGroupKey, string> = {
    INVALID: 'Inválido',
    AVAILABLE: 'Disponible',
    FULL: 'Lleno',
    SIGNED: 'Firmado',
    DELETED: 'Eliminado',
    DEFAULT: 'Por defecto'
  };

  return labels[key] ?? 'Desconocido';
}

export const InvestmentProcessGroupStatus = {
  INVALID: { value: 0, code: 'investmentProcessGroupType.invalid' },
  RUNNING: { value: 100, code: 'investmentProcessGroupType.running' },
  SUCCESS: { value: 200, code: 'investmentProcessGroupType.success' },
  ERROR: { value: 300, code: 'investmentProcessGroupType.error' }
} as const;

export type InvestmentProcessGroupStatusKey = keyof typeof InvestmentProcessGroupStatus;

export function getInvestmentProcessGroupStatusLabel(key: InvestmentProcessGroupStatusKey): string {
  const labels: Record<InvestmentProcessGroupStatusKey, string> = {
    INVALID: 'Inválido',
    RUNNING: 'En ejecución',
    SUCCESS: 'Aprobado',
    ERROR: 'Error'
  };

  return labels[key] ?? 'Desconocido';
}
