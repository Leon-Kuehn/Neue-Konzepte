export type WarehouseSlot = {
  id: string
  row: number
  col: number
  topic: string
  label?: string
}

export const warehouseSlots: WarehouseSlot[] = [
  { id: 'A1', row: 0, col: 0, topic: 'dhbw/iot/warehouse/A1', label: 'A1' },
  { id: 'A2', row: 0, col: 1, topic: 'dhbw/iot/warehouse/A2', label: 'A2' },
  { id: 'A3', row: 0, col: 2, topic: 'dhbw/iot/warehouse/A3', label: 'A3' },
  { id: 'A4', row: 0, col: 3, topic: 'dhbw/iot/warehouse/A4', label: 'A4' },
  { id: 'B1', row: 1, col: 0, topic: 'dhbw/iot/warehouse/B1', label: 'B1' },
  { id: 'B2', row: 1, col: 1, topic: 'dhbw/iot/warehouse/B2', label: 'B2' },
  { id: 'B3', row: 1, col: 2, topic: 'dhbw/iot/warehouse/B3', label: 'B3' },
  { id: 'B4', row: 1, col: 3, topic: 'dhbw/iot/warehouse/B4', label: 'B4' },
  { id: 'C1', row: 2, col: 0, topic: 'dhbw/iot/warehouse/C1', label: 'C1' },
  { id: 'C2', row: 2, col: 1, topic: 'dhbw/iot/warehouse/C2', label: 'C2' },
  { id: 'C3', row: 2, col: 2, topic: 'dhbw/iot/warehouse/C3', label: 'C3' },
  { id: 'C4', row: 2, col: 3, topic: 'dhbw/iot/warehouse/C4', label: 'C4' },
  { id: 'D1', row: 3, col: 0, topic: 'dhbw/iot/warehouse/D1', label: 'D1' },
  { id: 'D2', row: 3, col: 1, topic: 'dhbw/iot/warehouse/D2', label: 'D2' },
  { id: 'D3', row: 3, col: 2, topic: 'dhbw/iot/warehouse/D3', label: 'D3' },
  { id: 'D4', row: 3, col: 3, topic: 'dhbw/iot/warehouse/D4', label: 'D4' },
]

export const warehouseDimensions = {
  rows: 4,
  cols: 4,
}
