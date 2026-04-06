"use client";

import type { Editor } from "tldraw";

import { CatalogPanel } from "./CatalogPanel";
import { InspectorPanel } from "./InspectorPanel";
import { LayersPanel } from "./LayersPanel";
import type { BoqItem, CatalogProduct, PlannerStep, RoomPreset } from "./types";
import { WorkspacePanel } from "./WorkspacePanel";

interface PlannerDesktopPanelsProps {
  editor: Editor | null;
  catalogProducts: CatalogProduct[];
  roomPresets: RoomPreset[];
  boqItems: BoqItem[];
  totalBoq: number;
  currentStep: PlannerStep;
  canContinueFromRoom: boolean;
  roomMetrics: string;
  selectedMetrics: string | null;
  unitSystem: "mm" | "ft-in";
  showCatalog: boolean;
  showLayers: boolean;
  showInspector: boolean;
  catalogPinned: boolean;
  layersPinned: boolean;
  inspectorPinned: boolean;
  activePanel: "catalog" | "layers" | "inspector" | null;
  isSnapMode: boolean;
  onDropFurniture: (product: CatalogProduct | { name: string; category: string }) => void;
  onApplyRoomPreset: (preset: RoomPreset) => void;
  onActivateWallTool: () => void;
  onActivateBasicShapeTool: () => void;
  onFitSelection: () => void;
  onCloseCatalog: () => void;
  onCloseLayers: () => void;
  onCloseInspector: () => void;
  onToggleCatalogPin: () => void;
  onToggleLayersPin: () => void;
  onToggleInspectorPin: () => void;
  onFocusCatalog: () => void;
  onFocusLayers: () => void;
  onFocusInspector: () => void;
  onToggleSnap: () => void;
  onUnitSystemChange: (unit: "mm" | "ft-in") => void;
  onGenerateQuote: () => void;
}

export function PlannerDesktopPanels({
  editor,
  catalogProducts,
  roomPresets,
  boqItems,
  totalBoq,
  currentStep,
  canContinueFromRoom,
  roomMetrics,
  selectedMetrics,
  unitSystem,
  showCatalog,
  showLayers,
  showInspector,
  catalogPinned,
  layersPinned,
  inspectorPinned,
  activePanel,
  isSnapMode,
  onDropFurniture,
  onApplyRoomPreset,
  onActivateWallTool,
  onActivateBasicShapeTool,
  onFitSelection,
  onCloseCatalog,
  onCloseLayers,
  onCloseInspector,
  onToggleCatalogPin,
  onToggleLayersPin,
  onToggleInspectorPin,
  onFocusCatalog,
  onFocusLayers,
  onFocusInspector,
  onToggleSnap,
  onUnitSystemChange,
  onGenerateQuote,
}: PlannerDesktopPanelsProps) {
  const RIGHT_PANEL_OFFSET = showInspector ? 336 : 0;

  return (
    <>
      {showCatalog ? (
        <WorkspacePanel
          id="catalog-panel"
          side="left"
          docked={catalogPinned}
          isActive={activePanel === "catalog"}
          onFocus={onFocusCatalog}
          topPx={88}
        >
          <CatalogPanel
            products={catalogProducts}
            editor={editor}
            currentStep={currentStep}
            canPlaceFurniture={currentStep === "catalog"}
            roomPresets={roomPresets}
            onApplyRoomPreset={onApplyRoomPreset}
            onActivateWallTool={onActivateWallTool}
            onActivateBasicShapeTool={onActivateBasicShapeTool}
            onDropFurniture={onDropFurniture}
            onClose={onCloseCatalog}
            pinned={catalogPinned}
            onTogglePin={onToggleCatalogPin}
          />
        </WorkspacePanel>
      ) : null}

      {showInspector ? (
        <WorkspacePanel
          id="inspector-panel"
          side="right"
          docked={inspectorPinned}
          isActive={activePanel === "inspector"}
          onFocus={onFocusInspector}
          topPx={88}
        >
          <InspectorPanel
            boqItems={boqItems}
            totalBoq={totalBoq}
            currentStep={currentStep}
            canContinueFromRoom={canContinueFromRoom}
            roomMetrics={roomMetrics}
            selectedMetrics={selectedMetrics}
            unitSystem={unitSystem}
            onUnitSystemChange={onUnitSystemChange}
            isSnapMode={isSnapMode}
            onToggleSnap={onToggleSnap}
            onGenerateQuote={onGenerateQuote}
            onClose={onCloseInspector}
            pinned={inspectorPinned}
            onTogglePin={onToggleInspectorPin}
          />
        </WorkspacePanel>
      ) : null}

      {showLayers ? (
        <WorkspacePanel
          id="layers-panel"
          side="right"
          docked={layersPinned}
          isActive={activePanel === "layers"}
          onFocus={onFocusLayers}
          offsetPx={RIGHT_PANEL_OFFSET}
          topPx={88}
        >
          <LayersPanel
            editor={editor}
            onFitSelection={onFitSelection}
            onClose={onCloseLayers}
            pinned={layersPinned}
            onTogglePin={onToggleLayersPin}
          />
        </WorkspacePanel>
      ) : null}
    </>
  );
}
