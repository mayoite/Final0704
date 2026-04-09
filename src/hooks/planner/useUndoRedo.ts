import { usePlannerStore } from "@/lib/planner/store";
import { useCallback } from "react";

/**
 * Custom hook for managing planner state history (Undo/Redo).
 * 
 * Provides a simplified interface for undo/redo actions and 
 * tracking historical state availability.
 * 
 * @returns {Object} Undo/Redo state and handlers
 */
export function useUndoRedo() {
  const canUndo = usePlannerStore((state) => state.history.past.length > 0);
  const canRedo = usePlannerStore((state) => state.history.future.length > 0);
  const undoDocument = usePlannerStore((state) => state.undoDocument);
  const redoDocument = usePlannerStore((state) => state.redoDocument);
  const setStatus = usePlannerStore((state) => state.setStatus);
  const setSelectedCatalogItemId = usePlannerStore((state) => state.setSelectedCatalogItemId);
  const setSceneSelection = usePlannerStore((state) => state.setSceneSelection);

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    undoDocument();
    setSelectedCatalogItemId(null);
    setSceneSelection(null);
    setStatus("Undo applied");
  }, [canUndo, undoDocument, setSelectedCatalogItemId, setSceneSelection, setStatus]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    redoDocument();
    setSelectedCatalogItemId(null);
    setSceneSelection(null);
    setStatus("Redo applied");
  }, [canRedo, redoDocument, setSelectedCatalogItemId, setSceneSelection, setStatus]);

  return {
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
  };
}
