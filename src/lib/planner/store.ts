"use client";

import { create } from "zustand";

import {
  commitPlannerHistory,
  createPlannerHistory,
  redoPlannerHistory,
  replacePlannerHistoryPresent,
  undoPlannerHistory,
} from "@/lib/planner/history";
import {
  createEmptyPlannerDocument,
  plannerDocumentFromBlueprintSerialized,
} from "@/lib/planner/serializer";
import type {
  PlannerDocument,
  PlannerEngineMode,
  PlannerHistoryState,
  PlannerSceneSelection,
  PlannerToolMode,
  PlannerViewMode,
} from "@/lib/planner/types";

type PlannerStoreState = {
  engineMode: PlannerEngineMode;
  status: string;
  currentView: PlannerViewMode;
  activeTool: PlannerToolMode;
  selectedCatalogItemId: string | null;
  sceneSelection: PlannerSceneSelection;
  history: PlannerHistoryState<PlannerDocument>;
  setEngineMode: (engineMode: PlannerEngineMode) => void;
  setStatus: (status: string) => void;
  setCurrentView: (currentView: PlannerViewMode) => void;
  setActiveTool: (activeTool: PlannerToolMode) => void;
  setSelectedCatalogItemId: (selectedCatalogItemId: string | null) => void;
  setSceneSelection: (sceneSelection: PlannerSceneSelection) => void;
  resetDocument: (document: PlannerDocument) => void;
  commitDocument: (document: PlannerDocument) => void;
  replaceDocument: (document: PlannerDocument) => void;
  importBlueprintDocument: (serialized: string) => void;
  undoDocument: () => void;
  redoDocument: () => void;
};

const initialDocument = createEmptyPlannerDocument({
  source: "starter",
  serializedSource: null,
});

export const usePlannerStore = create<PlannerStoreState>()((set) => ({
  engineMode: "blueprint-bridge",
  status: "Preparing planner",
  currentView: "2.5d",
  activeTool: "move",
  selectedCatalogItemId: null,
  sceneSelection: null,
  history: createPlannerHistory(initialDocument),
  setEngineMode: (engineMode) => set({ engineMode }),
  setStatus: (status) => set({ status }),
  setCurrentView: (currentView) => set({ currentView }),
  setActiveTool: (activeTool) => set({ activeTool }),
  setSelectedCatalogItemId: (selectedCatalogItemId) =>
    set({ selectedCatalogItemId }),
  setSceneSelection: (sceneSelection) => set({ sceneSelection }),
  resetDocument: (document) =>
    set({
      history: createPlannerHistory(document),
    }),
  commitDocument: (document) =>
    set((state) => ({
      history: commitPlannerHistory(state.history, document),
    })),
  replaceDocument: (document) =>
    set((state) => ({
      history: replacePlannerHistoryPresent(state.history, document),
    })),
  importBlueprintDocument: (serialized) =>
    set((state) => {
      try {
        return {
          history: commitPlannerHistory(
            state.history,
            plannerDocumentFromBlueprintSerialized(serialized),
          ),
          status: "Blueprint imported",
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unknown blueprint import error";
        return {
          status: `Import failed: ${message}`,
        };
      }
    }),
  undoDocument: () =>
    set((state) => ({
      history: undoPlannerHistory(state.history),
    })),
  redoDocument: () =>
    set((state) => ({
      history: redoPlannerHistory(state.history),
    })),
}));
