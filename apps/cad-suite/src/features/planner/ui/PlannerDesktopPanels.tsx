"use client";

import type { Editor } from "tldraw";

import type { BoqItem, CatalogProduct, PlannerStep, RoomPreset } from "@/components/draw/types";

import { CatalogPanel } from "./CatalogPanel";
import { InspectorPanel } from "./InspectorPanel";
import { LayersPanel } from "./LayersPanel";
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
  selectionDimensions: import("../lib/editorTools").PlannerSelectionDimensions | null;
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
  onAddWallSegment: () => void;
  onAddDoorOpening: () => void;
  onResolveWallJoins: () => void;
  onFitSelection: () => void;
  onAlignSelection: (operation: "left" | "center-horizontal" | "right" | "top" | "center-vertical" | "bottom") => void;
  onDistributeSelection: (operation: "horizontal" | "vertical") => void;
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
  onUpdateSelectionDimensions: (next: { widthMm?: number; heightMm?: number | null }) => void;
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
  selectionDimensions,
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
  onAddWallSegment,
  onAddDoorOpening,
  onResolveWallJoins,
  onFitSelection,
  onAlignSelection,
  onDistributeSelection,
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
  onUpdateSelectionDimensions,
  onUnitSystemChange,
  onGenerateQuote,
}: PlannerDesktopPanelsProps) {
  const rightPanelOffset = showInspector ? 336 : 0;

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
            unitSystem={unitSystem}
            onApplyRoomPreset={onApplyRoomPreset}
            onActivateWallTool={onActivateWallTool}
            onActivateBasicShapeTool={onActivateBasicShapeTool}
            onAddWallSegment={onAddWallSegment}
            onAddDoorOpening={onAddDoorOpening}
            onResolveWallJoins={onResolveWallJoins}
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
            selectionDimensions={selectionDimensions}
            unitSystem={unitSystem}
            onUnitSystemChange={onUnitSystemChange}
            isSnapMode={isSnapMode}
            onToggleSnap={onToggleSnap}
            onUpdateSelectionDimensions={onUpdateSelectionDimensions}
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
          offsetPx={rightPanelOffset}
          topPx={88}
        >
          <LayersPanel
            editor={editor}
            unitSystem={unitSystem}
            onFitSelection={onFitSelection}
            onAlignSelection={onAlignSelection}
            onDistributeSelection={onDistributeSelection}
            onClose={onCloseLayers}
            pinned={layersPinned}
            onTogglePin={onToggleLayersPin}
          />
        </WorkspacePanel>
      ) : null}
    </>
  );
}
