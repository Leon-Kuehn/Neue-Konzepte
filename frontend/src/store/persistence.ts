import type { PlantState } from '../types/modules'

const STORAGE_KEY = 'plant-builder-state-v2'

const isBrowser = typeof window !== 'undefined'

export const plantStorage = {
  load(): PlantState | undefined {
    if (!isBrowser) return undefined
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return undefined
      return JSON.parse(raw) as PlantState
    } catch (err) {
      console.warn('Konnte Layout nicht laden', err)
      return undefined
    }
  },
  save(state: PlantState) {
    if (!isBrowser) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (err) {
      console.warn('Konnte Layout nicht speichern', err)
    }
  },
  clear() {
    if (!isBrowser) return
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch (err) {
      console.warn('Konnte Layout nicht löschen', err)
    }
  },
}
