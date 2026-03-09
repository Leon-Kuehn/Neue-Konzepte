import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { defaultBindings, defaultModules } from '../config/modules'
import type { ModuleBinding, ModuleType, PlantState, PlacedModule, Rotation } from '../types/modules'
import { plantStorage } from './persistence'

type PlantAction =
  | { type: 'ADD_MODULE'; module: PlacedModule; binding?: ModuleBinding }
  | { type: 'UPDATE_MODULE'; id: string; patch: Partial<PlacedModule> }
  | { type: 'UPDATE_BINDING'; id: string; binding: Partial<ModuleBinding> }
  | { type: 'REMOVE_MODULE'; id: string }
  | { type: 'RESET' }

const createInitialState = (): PlantState => {
  const fromStorage = plantStorage.load()
  if (fromStorage) return fromStorage
  return { modules: defaultModules, bindings: defaultBindings }
}

const reducer = (state: PlantState, action: PlantAction): PlantState => {
  switch (action.type) {
    case 'ADD_MODULE': {
      const modules = [...state.modules, action.module]
      const bindings = action.binding ? { ...state.bindings, [action.module.id]: action.binding } : state.bindings
      return { modules, bindings }
    }
    case 'UPDATE_MODULE': {
      const modules = state.modules.map((m) => (m.id === action.id ? { ...m, ...action.patch } : m))
      return { ...state, modules }
    }
    case 'UPDATE_BINDING': {
      const existing = state.bindings[action.id] ?? { deviceType: 'sensor' }
      return { ...state, bindings: { ...state.bindings, [action.id]: { ...existing, ...action.binding } } }
    }
    case 'REMOVE_MODULE': {
      const modules = state.modules.filter((m) => m.id !== action.id)
      const bindings = { ...state.bindings }
      delete bindings[action.id]
      return { modules, bindings }
    }
    case 'RESET': {
      return { modules: defaultModules, bindings: defaultBindings }
    }
    default:
      return state
  }
}

type PlantStoreValue = {
  state: PlantState
  addModule: (type: ModuleType, position: { x: number; y: number }, rotation?: Rotation, label?: string) => string
  updateModule: (id: string, patch: Partial<PlacedModule>) => void
  updateBinding: (id: string, binding: Partial<ModuleBinding>) => void
  removeModule: (id: string) => void
  reset: () => void
}

const PlantStoreContext = createContext<PlantStoreValue | undefined>(undefined)

export function PlantStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)

  useEffect(() => {
    plantStorage.save(state)
  }, [state])

  const addModule: PlantStoreValue['addModule'] = (type, position, rotation = 0 as Rotation, label) => {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${type}-${Date.now()}-${Math.round(Math.random() * 1000)}`
    const module: PlacedModule = {
      id,
      type,
      x: position.x,
      y: position.y,
      rotation,
      label: label ?? type,
    }
    const binding: ModuleBinding =
      type === 'sensor'
        ? { deviceType: 'sensor' }
        : type === 'nfc'
          ? { deviceType: 'sensor', metaTopic: '' }
          : { deviceType: 'actuator' }
    dispatch({ type: 'ADD_MODULE', module, binding })
    return id
  }

  const updateModule: PlantStoreValue['updateModule'] = (id, patch) => dispatch({ type: 'UPDATE_MODULE', id, patch })
  const updateBinding: PlantStoreValue['updateBinding'] = (id, binding) =>
    dispatch({ type: 'UPDATE_BINDING', id, binding })
  const removeModule: PlantStoreValue['removeModule'] = (id) => dispatch({ type: 'REMOVE_MODULE', id })
  const reset = () => {
    plantStorage.clear()
    dispatch({ type: 'RESET' })
  }

  const value = useMemo(
    () => ({
      state,
      addModule,
      updateModule,
      updateBinding,
      removeModule,
      reset,
    }),
    [state]
  )

  return <PlantStoreContext.Provider value={value}>{children}</PlantStoreContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePlantStore = () => {
  const ctx = useContext(PlantStoreContext)
  if (!ctx) throw new Error('usePlantStore must be used within PlantStoreProvider')
  return ctx
}
