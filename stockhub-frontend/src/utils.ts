import type { OrderStatus } from './types'

// The backend sends OrderStatus as integers (0=Draft, 1=Confirmed, 2=Completed, 3=Cancelled)
// unless JsonStringEnumConverter is added to Program.cs.
// This helper normalises both so the rest of the app only deals with strings.
const STATUS_MAP: Record<number, OrderStatus> = {
  0: 'Draft',
  1: 'Confirmed',
  2: 'Completed',
  3: 'Cancelled',
}

export function normalizeStatus(status: OrderStatus | number): OrderStatus {
  if (typeof status === 'number') return STATUS_MAP[status] ?? 'Draft'
  return status
}

// Same for StockMovementType
const MOVEMENT_MAP: Record<number, string> = {
  0: 'In',
  1: 'Out',
  2: 'Adjustment',
}

export function normalizeMovementType(type: string | number): string {
  if (typeof type === 'number') return MOVEMENT_MAP[type] ?? 'Adjustment'
  return type
}
