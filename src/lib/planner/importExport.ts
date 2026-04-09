import {
  parsePlannerDocument,
  plannerDocumentFromBlueprintSerialized,
  serializePlannerDocument,
} from "@/lib/planner/serializer";
import type { PlannerDocument } from "@/lib/planner/types";

export function exportPlannerDocument(document: PlannerDocument) {
  return {
    fileName: "oneonly-workspace.planner.json",
    contents: serializePlannerDocument(document),
    mimeType: "application/json",
  };
}

export function importPlannerDocument(raw: string): {
  document: PlannerDocument;
  source: "planner-document" | "blueprint-bridge";
} {
  try {
    return {
      document: parsePlannerDocument(raw),
      source: "planner-document",
    };
  } catch (plannerError) {
    try {
      return {
        document: plannerDocumentFromBlueprintSerialized(raw),
        source: "blueprint-bridge",
      };
    } catch (blueprintError) {
      const plannerMessage =
        plannerError instanceof Error
          ? plannerError.message
          : "Unknown planner import error";
      const blueprintMessage =
        blueprintError instanceof Error
          ? blueprintError.message
          : "Unknown blueprint import error";
      throw new Error(
        `Unsupported import file. Planner: ${plannerMessage}. Blueprint: ${blueprintMessage}.`,
      );
    }
  }
}
