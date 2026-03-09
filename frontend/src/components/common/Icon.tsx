import {
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  BeakerIcon,
  BoltIcon,
  CloudIcon,
  EyeIcon,
  HeartIcon,
  LightBulbIcon,
  MapPinIcon,
  SparklesIcon,
  SunIcon,
  SwatchIcon,
  WifiIcon,
} from '@heroicons/react/24/outline'
import type { IconName } from '../../types/devices'

const iconMap: Record<IconName, typeof SunIcon> = {
  temperature: SunIcon,
  humidity: CloudIcon,
  light: LightBulbIcon,
  soil: SwatchIcon,
  energy: BoltIcon,
  pump: BeakerIcon,
  streetlight: SunIcon,
  ventilation: AdjustmentsHorizontalIcon,
  conveyor: ArrowsRightLeftIcon,
  motor: ArrowPathIcon,
  presence: EyeIcon,
  position: MapPinIcon,
  nfc: WifiIcon,
  status: SparklesIcon,
  heartbeat: HeartIcon,
  kpi: SparklesIcon,
}

export function NamedIcon({ name, className }: { name: IconName; className?: string }) {
  const Icon = iconMap[name] ?? SparklesIcon
  return <Icon className={className} />
}
