import clsx from 'clsx'
import type { LogisticsModuleType } from '../../types/logistics'

import inputStation from '../../assets/modules/input-station.svg'
import product from '../../assets/modules/produkt.svg'
import conveyorLong from '../../assets/modules/foerderband-lang.svg'
import conveyorShort from '../../assets/modules/foerderband-kurz.svg'
import conveyorTurntable from '../../assets/modules/foerderband-kurve.svg'
import fillingUnit from '../../assets/modules/pneumatische-fuell-einheit.svg'
import lift from '../../assets/modules/lift.svg'
import warehouseColumn from '../../assets/modules/hochregallager.svg'
import binarySensor from '../../assets/modules/binaer-sensor.svg'
import nfcSensor from '../../assets/modules/nfc-sensor.svg'

const iconMap: Record<LogisticsModuleType, string> = {
  InputStation: inputStation,
  ProductSensor: product,
  ConveyorLong: conveyorLong,
  ConveyorShort: conveyorShort,
  ConveyorTurntable: conveyorTurntable,
  FillingUnit: fillingUnit,
  Lift: lift,
  WarehouseColumn: warehouseColumn,
  BinarySensor: binarySensor,
  NfcSensor: nfcSensor,
}

const sizeMap: Record<LogisticsModuleType, number> = {
  ConveyorLong: 210,
  ConveyorShort: 120,
  ConveyorTurntable: 110,
  FillingUnit: 140,
  InputStation: 90,
  ProductSensor: 70,
  Lift: 90,
  WarehouseColumn: 60,
  BinarySensor: 32,
  NfcSensor: 36,
}

type ModuleIconProps = {
  type: LogisticsModuleType
  rotation?: number
  className?: string
}

export function ModuleIcon({ type, rotation = 0, className }: ModuleIconProps) {
  const width = sizeMap[type] ?? 120
  return (
    <div
      className={clsx('pointer-events-none select-none', className)}
      style={{
        transform: `rotate(${rotation}deg)`,
        width,
      }}
    >
      <img src={iconMap[type]} alt={type} className="h-auto w-full drop-shadow-sm" draggable={false} />
    </div>
  )
}
