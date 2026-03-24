import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface SimulationDesignerContextType {
  visibleHotspotIds: string[] | null;
  setVisibleHotspotIds: (ids: string[] | null) => void;
}

const SimulationDesignerContext = createContext<SimulationDesignerContextType | undefined>(
  undefined
);

interface SimulationDesignerProviderProps {
  children: ReactNode;
}

export function SimulationDesignerProvider({ children }: SimulationDesignerProviderProps) {
  const [visibleHotspotIds, setVisibleHotspotIds] = useState<string[] | null>(null);

  const value: SimulationDesignerContextType = {
    visibleHotspotIds,
    setVisibleHotspotIds,
  };

  return (
    <SimulationDesignerContext.Provider value={value}>
      {children}
    </SimulationDesignerContext.Provider>
  );
}

export function useSimulationDesigner(): SimulationDesignerContextType {
  const context = useContext(SimulationDesignerContext);
  if (context === undefined) {
    throw new Error("useSimulationDesigner must be used within SimulationDesignerProvider");
  }
  return context;
}
