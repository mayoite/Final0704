"use client";

import {
  DefaultColorStyle,
  DefaultDashStyle,
  DefaultFillStyle,
  DefaultSizeStyle,
  GeoShapeGeoStyle,
} from "@tldraw/tlschema";
import type { Editor } from "tldraw";

export function configureWallTool(editor: Editor) {
  editor.setCurrentTool("line");
  editor.setStyleForNextShapes(DefaultColorStyle, "grey");
  editor.setStyleForNextShapes(DefaultDashStyle, "solid");
  editor.setStyleForNextShapes(DefaultSizeStyle, "m");
}

export function configureBasicShapeTool(editor: Editor) {
  editor.setCurrentTool("geo");
  editor.setStyleForNextShapes(GeoShapeGeoStyle, "rectangle");
  editor.setStyleForNextShapes(DefaultColorStyle, "grey");
  editor.setStyleForNextShapes(DefaultFillStyle, "none");
  editor.setStyleForNextShapes(DefaultDashStyle, "solid");
  editor.setStyleForNextShapes(DefaultSizeStyle, "m");
}
