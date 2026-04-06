"use client";

import type { Editor } from "tldraw";

import { CatalogPanel } from "./CatalogPanel";
import { InspectorPanel } from "./InspectorPanel";
import { LayersPanel } from "./LayersPanel";
import { MobileDrawerSheet } from "./MobileDrawerSheet";
import type { BoqItem, CatalogProduct, PlannerStep, RoomPreset } from "./types";

interface PlannerMobilePanelsProps {
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
  mobileCatalogOpen: boolean;
  mobileLayersOpen: boolean;
  mobileInspectorOpen: boolean;
  isSnapMode: boolean;
  onOpenCatalogChange: (open: boolean) => void;
  onOpenLayersChange: (open: boolean) => void;
  onOpenInspectorChange: (open: boolean) => void;
  onDropFurniture: (product: CatalogProduct | { name: string; category: string }) => void;
  onApplyRoomPreset: (preset: RoomPreset) => void;
  onActivateWallTool: () => void;
  onActivateBasicShapeTool: () => void;
  onFitSelection: () => void;
  onToggleSnap: () => void;
  onUnitSystemChange: (unit: "mm" | "ft-in") => void;
  onGenerateQuote: () => void;
}

export function PlannerMobilePanels({
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
  mobileCatalogOpen,
  mobileLayersOpen,
  mobileInspectorOpen,
  isSnapMode,
  onOpenCatalogChange,
  onOpenLayersChange,
  onOpenInspectorChange,
  onDropFurniture,
  onApplyRoomPreset,
  onActivateWallTool,
  onActivateBasicShapeTool,
  onFitSelection,
  onToggleSnap,
  onUnitSystemChange,
  onGenerateQuote,
}: PlannerMobilePanelsProps) {
  return (
    <>
      <MobileDrawerSheet
        open={mobileCatalogOpen}
        onOpenChange={onOpenCatalogChange}
        title={currentStep === "room" ? "Room Builder" : "Product Catalog"}
        trigger={<span />}
      >
        {mobileCatalogOpen ? (
          <CatalogPanel
            products={catalogProducts}
            editor={editor}
            currentStep={currentStep}
            canPlaceFurniture={currentStep === "catalog"}
            roomPresets={roomPresets}
            onApplyRoomPreset={onApplyRoomPreset}
            onActivateWallTool={onActivateWallTool}
            onActivateBasicShapeTool={onActivateBasicShapeTool}
            onDropFurniture={(product) => {
              onDropFurniture(product);
              onOpenCatalogChange(false);
            }}
            onClose={() => onOpenCatalogChange(false)}
            pinned={false}
            onTogglePin={() => {}}
            showPinToggle={false}
          />
        ) : null}
      </MobileDrawerSheet>

      <MobileDrawerSheet
        open={mobileLayersOpen}
        onOpenChange={onOpenLayersChange}
        title="Layers"
        trigger={<span />}
      >
        {mobileLayersOpen ? (
          <LayersPanel
            editor={editor}
            onFitSelection={onFitSelection}
            onClose={() => onOpenLayersChange(false)}
            pinned={false}
            onTogglePin={() => {}}
            showPinToggle={false}
          />
        ) : null}
      </MobileDrawerSheet>

      <MobileDrawerSheet
        open={mobileInspectorOpen}
        onOpenChange={onOpenInspectorChange}
        title="Layout Inspector"
        trigger={<span />}
      >
        {mobileInspectorOpen ? (
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
            onGenerateQuote={() => {
              onGenerateQuote();
              onOpenInspectorChange(false);
            }}
            onClose={() => onOpenInspectorChange(false)}
            pinned={false}
            onTogglePin={() => {}}
            showPinToggle={false}
          />
        ) : null}
      </MobileDrawerSheet>
    </>
  );
}
