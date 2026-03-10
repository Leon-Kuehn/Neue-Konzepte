import type { Category, PlantComponent, Role } from "../types/PlantComponent";

type BuildOpts = {
  role: Role;
  category: Category;
  count: number;
  namePrefix: string;
  idPrefix: string;
  statusOnModulo?: number;
  onlineOfflineModulo?: number;
  baseCycles: number;
  cyclesStep: number;
  baseUptime: number;
  uptimeStep: number;
};

function buildComponents(opts: BuildOpts): PlantComponent[] {
  const {
    role,
    category,
    count,
    namePrefix,
    idPrefix,
    statusOnModulo = 2,
    onlineOfflineModulo = 5,
    baseCycles,
    cyclesStep,
    baseUptime,
    uptimeStep,
  } = opts;

  return Array.from({ length: count }, (_, index) => {
    const n = index + 1;
    const id = `${idPrefix}-${n}`;

    return {
      id,
      name: `${namePrefix} ${n}`,
      role,
      category,
      status: n % statusOnModulo === 0 ? "off" : "on",
      online: n % onlineOfflineModulo !== 0,
      lastChanged: new Date().toISOString(),
      stats: {
        cycles: baseCycles + n * cyclesStep,
        uptimeHours: baseUptime + n * uptimeStep,
      },
      mqttTopics: {
        status: `plant/${id}/status`,
        command: `plant/${id}/command`,
        telemetry: `plant/${id}/telemetry`,
      },
    };
  });
}

const conveyors = buildComponents({
  role: "actuator",
  category: "conveyor",
  count: 14,
  namePrefix: "Conveyor",
  idPrefix: "conveyor",
  statusOnModulo: 4,
  onlineOfflineModulo: 7,
  baseCycles: 900,
  cyclesStep: 55,
  baseUptime: 220,
  uptimeStep: 6,
});

const rotatingConveyors = buildComponents({
  role: "actuator",
  category: "rotating-conveyor",
  count: 3,
  namePrefix: "Rotating Conveyor",
  idPrefix: "rotating",
  statusOnModulo: 3,
  onlineOfflineModulo: 4,
  baseCycles: 700,
  cyclesStep: 45,
  baseUptime: 180,
  uptimeStep: 7,
});

const presses = buildComponents({
  role: "actuator",
  category: "press",
  count: 3,
  namePrefix: "Press",
  idPrefix: "press",
  statusOnModulo: 2,
  onlineOfflineModulo: 4,
  baseCycles: 260,
  cyclesStep: 35,
  baseUptime: 120,
  uptimeStep: 8,
});

const inductiveSensors = buildComponents({
  role: "sensor",
  category: "inductive-sensor",
  count: 19,
  namePrefix: "Inductive Sensor",
  idPrefix: "ind-sensor",
  statusOnModulo: 6,
  onlineOfflineModulo: 8,
  baseCycles: 3100,
  cyclesStep: 95,
  baseUptime: 260,
  uptimeStep: 4,
});

const rfidSensors = buildComponents({
  role: "sensor",
  category: "rfid-sensor",
  count: 5,
  namePrefix: "RFID Sensor",
  idPrefix: "rfid",
  statusOnModulo: 5,
  onlineOfflineModulo: 6,
  baseCycles: 3900,
  cyclesStep: 110,
  baseUptime: 270,
  uptimeStep: 4,
});

const opticalSensors = buildComponents({
  role: "sensor",
  category: "optical-sensor",
  count: 1,
  namePrefix: "Optical Sensor",
  idPrefix: "optical",
  statusOnModulo: 99,
  onlineOfflineModulo: 99,
  baseCycles: 5200,
  cyclesStep: 0,
  baseUptime: 312,
  uptimeStep: 0,
});

const pneumaticUnits = buildComponents({
  role: "actuator",
  category: "pneumatic-unit",
  count: 5,
  namePrefix: "Pneumatic Unit",
  idPrefix: "pneumatic",
  statusOnModulo: 2,
  onlineOfflineModulo: 6,
  baseCycles: 540,
  cyclesStep: 30,
  baseUptime: 190,
  uptimeStep: 5,
});

const crane = buildComponents({
  role: "actuator",
  category: "crane",
  count: 1,
  namePrefix: "Crane",
  idPrefix: "crane",
  statusOnModulo: 99,
  onlineOfflineModulo: 99,
  baseCycles: 410,
  cyclesStep: 0,
  baseUptime: 290,
  uptimeStep: 0,
});

const storage = buildComponents({
  role: "actuator",
  category: "storage",
  count: 1,
  namePrefix: "Storage",
  idPrefix: "storage",
  statusOnModulo: 99,
  onlineOfflineModulo: 99,
  baseCycles: 970,
  cyclesStep: 0,
  baseUptime: 310,
  uptimeStep: 0,
});

const input = buildComponents({
  role: "sensor",
  category: "input",
  count: 1,
  namePrefix: "Input Station",
  idPrefix: "input",
  statusOnModulo: 99,
  onlineOfflineModulo: 99,
  baseCycles: 980,
  cyclesStep: 0,
  baseUptime: 310,
  uptimeStep: 0,
});

export const mockComponents: PlantComponent[] = [
  ...conveyors,
  ...rotatingConveyors,
  ...presses,
  ...inductiveSensors,
  ...rfidSensors,
  ...opticalSensors,
  ...pneumaticUnits,
  ...crane,
  ...storage,
  ...input,
];
