export type DefaultSimulationSeed = {
  id: string;
  name: string;
  description?: string;
  repeat?: number;
  steps: unknown;
};

export const DEFAULT_SIMULATION_SEEDS: DefaultSimulationSeed[] = [
  {
    id: 'entry-route-demo',
    name: 'Entry Route Demo',
    description: 'Default demo simulation for the entry route flow.',
    repeat: 1,
    steps: [
      {
        id: 'step-9a57aa41-3729-48d3-a107-e774e8065025',
        atMs: 0,
        label: '',
        changes: [
          { state: 'on', motion: 'none', hotspotId: 'inductive-1' },
          { state: 'on', motion: 'none', hotspotId: 'conveyor-1' },
        ],
      },
      {
        id: 'step-0fa410a5-4b39-439c-8d79-6e1bd26de012',
        atMs: 500,
        label: '',
        changes: [{ state: 'off', motion: 'none', hotspotId: 'inductive-1' }],
      },
      {
        id: 'step-cb46167b-1863-4669-a814-4c96d5d51748',
        atMs: 2000,
        label: '',
        changes: [
          { state: 'on', motion: 'none', hotspotId: 'inductive-2' },
          { state: 'on', motion: 'none', hotspotId: 'rfid-1' },
          { state: 'on', motion: 'none', hotspotId: 'conveyor-2' },
        ],
      },
      {
        id: 'step-0dd0a729-925e-4672-9ec1-df0138860bc8',
        atMs: 2500,
        label: '',
        changes: [
          { state: 'off', motion: 'none', hotspotId: 'rfid-1' },
          { state: 'off', motion: 'none', hotspotId: 'inductive-2' },
        ],
      },
      {
        id: 'step-a13bbe5a-0d68-449a-bacb-edd1387d0675',
        atMs: 4000,
        label: '',
        changes: [
          { state: 'on', motion: 'none', hotspotId: 'inductive-3' },
          { state: 'off', motion: 'none', hotspotId: 'conveyor-1' },
          { state: 'on', motion: 'none', hotspotId: 'conveyor-3' },
        ],
      },
      {
        id: 'step-6e162d8d-73ef-4c8b-acb5-27ef7b1476e3',
        atMs: 4500,
        label: '',
        changes: [{ state: 'off', motion: 'none', hotspotId: 'inductive-3' }],
      },
      {
        id: 'step-8e89ec95-3145-4756-962d-23ecce73a4e2',
        atMs: 6000,
        label: '',
        changes: [
          { state: 'on', motion: 'none', hotspotId: 'inductive-4' },
          { state: 'on', motion: 'none', hotspotId: 'rfid-2' },
          { state: 'off', motion: 'none', hotspotId: 'conveyor-2' },
        ],
      },
      {
        id: 'step-c8cde173-2ea0-4121-8e9f-149de1ca05df',
        atMs: 6500,
        label: '',
        changes: [
          { state: 'off', motion: 'none', hotspotId: 'rfid-2' },
          { state: 'off', motion: 'none', hotspotId: 'inductive-4' },
        ],
      },
      {
        id: 'step-7c068d19-8a3c-4c3d-a1b6-4ba1152329a8',
        atMs: 7000,
        label: '',
        changes: [{ state: 'off', motion: 'none', hotspotId: 'inductive-3' }],
      },
      {
        id: 'step-1c6c519b-9dae-46b3-8d2f-8db251614cc3',
        atMs: 7500,
        label: '',
        changes: [{ state: 'on', motion: 'none', hotspotId: 'inductive-5' }],
      },
      {
        id: 'step-1c5a1545-4c32-41ee-9a22-c113c40beee4',
        atMs: 8000,
        label: '',
        changes: [{ state: 'off', motion: 'none', hotspotId: 'inductive-5' }],
      },
      {
        id: 'step-6be23c0f-fc26-47df-854c-5c6a179a649a',
        atMs: 8500,
        label: '',
        changes: [
          { state: 'on', motion: 'none', hotspotId: 'inductive-6' },
          { state: 'on', motion: 'none', hotspotId: 'conveyor-4' },
        ],
      },
      {
        id: 'step-3a9ab3dd-b597-4137-9a80-d81c81c3068a',
        atMs: 9000,
        label: '',
        changes: [
          { state: 'off', motion: 'none', hotspotId: 'inductive-6' },
          { state: 'on', motion: 'none', hotspotId: 'rotating-conveyor-1' },
        ],
      },
      {
        id: 'step-93cd3213-737c-431a-8abc-4930036f6022',
        atMs: 11000,
        label: '',
        changes: [
          { state: 'on', motion: 'none', hotspotId: 'rfid-3' },
          { state: 'off', motion: 'none', hotspotId: 'conveyor-3' },
          { state: 'off', motion: 'none', hotspotId: 'rotating-conveyor-1' },
          { state: 'on', motion: 'none', hotspotId: 'conveyor-5' },
        ],
      },
      {
        id: 'step-30397421-4f2f-4a9b-96ea-59e03d0bdeb8',
        atMs: 11500,
        label: '',
        changes: [{ state: 'off', motion: 'none', hotspotId: 'rfid-3' }],
      },
      {
        id: 'step-323c449e-0498-41f5-8790-0dc30095794f',
        atMs: 13000,
        label: '',
        changes: [
          { state: 'on', motion: 'none', hotspotId: 'lightbarrier-1' },
          { state: 'off', motion: 'none', hotspotId: 'conveyor-4' },
        ],
      },
      {
        id: 'step-697017df-b6e4-48a3-ba2f-f1f1d61f0c92',
        atMs: 13500,
        label: '',
        changes: [{ state: 'off', motion: 'none', hotspotId: 'lightbarrier-1' }],
      },
      {
        id: 'step-db5e3350-b179-480c-a8f3-d2b12549a9e6',
        atMs: 14000,
        label: '',
        changes: [
          { state: 'on', motion: 'none', hotspotId: 'highbay-storage-1' },
          { state: 'off', motion: 'none', hotspotId: 'conveyor-5' },
        ],
      },
      {
        id: 'step-17db9a33-1de5-4cff-bf9a-6b7ddfc094ab',
        atMs: 20000,
        label: '',
        changes: [{ state: 'off', motion: 'none', hotspotId: 'highbay-storage-1' }],
      },
    ],
  },
];
