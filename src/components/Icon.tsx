import { AdjustmentsHorizontalIcon, BeakerIcon, BoltIcon, CloudIcon, HeartIcon, LightBulbIcon, SparklesIcon, SunIcon, SwatchIcon } from '@heroicons/react/24/outline'
import type { IconName } from '../config/devices'

const iconMap: Record<IconName, typeof SunIcon> = {
  temperature: SunIcon,
  humidity: CloudIcon,
  light: LightBulbIcon,
  soil: SwatchIcon,
  energy: BoltIcon,
  pump: BeakerIcon,
  streetlight: SunIcon,
  ventilation: AdjustmentsHorizontalIcon,
  status: SparklesIcon,
  heartbeat: HeartIcon,
  kpi: SparklesIcon,
}

export function NamedIcon({ name, className }: { name: IconName; className?: string }) {
  const Icon = iconMap[name] ?? SparklesIcon
  return <Icon className={className} />
}
