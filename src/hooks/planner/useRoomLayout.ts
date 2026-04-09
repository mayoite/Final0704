import { usePlannerStore } from "@/lib/planner/store";
import { useCallback, useMemo } from "react";
import { 
  movePlannerItem, 
  rotatePlannerItem, 
  duplicatePlannerItem, 
  removePlannerItem,
  resizePlannerRoom,
  movePlannerWall
} from "@/lib/planner/document";
import { formatLengthPair } from "@/lib/planner/units";
import type { PlannerCatalogItem } from "@/components/planner/types";

/**
 * Custom hook for managing room layout state and interactions.
 * 
 * Handles item placement, selection, movement, rotation, duplication,
 * and wall/room modifications.
 * 
 * @returns {Object} Layout state and handlers
 */
export function useRoomLayout(catalog: PlannerCatalogItem[]) {
  const plannerDocument = usePlannerStore((state) => state.history.present);
  const sceneSelection = usePlannerStore((state) => state.sceneSelection);
  const activeTool = usePlannerStore((state) => state.activeTool);
  
  const commitDocument = usePlannerStore((state) => state.commitDocument);
  const setStatus = usePlannerStore((state) => state.setStatus);
  const setSceneSelection = usePlannerStore((state) => state.setSceneSelection);
  const setSelectedCatalogItemId = usePlannerStore((state) => state.setSelectedCatalogItemId);
  const setActiveTool = usePlannerStore((state) => state.setActiveTool);

  const room = plannerDocument.rooms[0] ?? null;
  
  const roomDimensions = useMemo(() => {
    if (!room) return { widthLabel: "0m", depthLabel: "0m" };
    const xs = room.outline.map((p) => p.x);
    const ys = room.outline.map((p) => p.y);
    const widthCm = xs.length > 0 ? Math.max(...xs) - Math.min(...xs) : 0;
    const depthCm = ys.length > 0 ? Math.max(...ys) - Math.min(...ys) : 0;
    return {
      widthLabel: formatLengthPair(widthCm),
      depthLabel: formatLengthPair(depthCm),
      widthCm,
      depthCm
    };
  }, [room]);

  const handleSelectItem = useCallback((itemId: string) => {
    const placedItem = plannerDocument.items.find((i) => i.id === itemId);
    if (!placedItem) return;

    const catalogItem = catalog.find((c) => c.id === placedItem.catalogId);
    setSelectedCatalogItemId(placedItem.catalogId);
    setSceneSelection({
      kind: "item",
      id: itemId,
      title: placedItem.name || catalogItem?.name || "Placed item",
      detail: catalogItem ? "Selected in workspace" : "Custom item selected",
    });
  }, [plannerDocument.items, catalog, setSelectedCatalogItemId, setSceneSelection]);

  const handleMoveItem = useCallback((itemId: string, x: number, z: number) => {
    commitDocument(movePlannerItem(plannerDocument, itemId, { x, z }));
    setStatus("Item moved");
  }, [plannerDocument, commitDocument, setStatus]);

  const handleRotateItem = useCallback((deltaDeg: number) => {
    if (sceneSelection?.kind !== "item" || !sceneSelection.id) return;
    commitDocument(rotatePlannerItem(plannerDocument, sceneSelection.id, deltaDeg));
    setStatus(`Rotated item ${deltaDeg}°`);
  }, [plannerDocument, sceneSelection, commitDocument, setStatus]);

  const handleDuplicateItem = useCallback(() => {
    if (sceneSelection?.kind !== "item" || !sceneSelection.id) return;
    const nextDoc = duplicatePlannerItem(plannerDocument, sceneSelection.id);
    commitDocument(nextDoc);
    const newItem = nextDoc.items.at(-1);
    if (newItem) {
      setSceneSelection({
        kind: "item",
        id: newItem.id,
        title: newItem.name,
        detail: "Duplicated item",
      });
    }
    setStatus("Item duplicated");
  }, [plannerDocument, sceneSelection, commitDocument, setSceneSelection, setStatus]);

  const handleDeleteItem = useCallback(() => {
    if (sceneSelection?.kind !== "item" || !sceneSelection.id) return;
    commitDocument(removePlannerItem(plannerDocument, sceneSelection.id));
    setSceneSelection(null);
    setStatus("Item removed");
  }, [plannerDocument, sceneSelection, commitDocument, setSceneSelection, setStatus]);

  const handleApplyRoomSize = useCallback((widthCm: number, depthCm: number) => {
    commitDocument(resizePlannerRoom(plannerDocument, widthCm, depthCm));
    setStatus(`Room resized to ${formatLengthPair(widthCm)} x ${formatLengthPair(depthCm)}`);
  }, [plannerDocument, commitDocument, setStatus]);

  const handleMoveWall = useCallback((wallId: string, coordinate: number) => {
    commitDocument(movePlannerWall(plannerDocument, wallId, coordinate));
    setStatus("Wall moved");
  }, [plannerDocument, commitDocument, setStatus]);

  return {
    plannerDocument,
    sceneSelection,
    activeTool,
    roomDimensions,
    handleSelectItem,
    handleMoveItem,
    handleRotateItem,
    handleDuplicateItem,
    handleDeleteItem,
    handleApplyRoomSize,
    handleMoveWall,
    setActiveTool,
    setStatus,
  };
}
