/**
 * Planner Configuration System
 * 
 * Centralized configuration management for the One&Only Workspace Planner.
 * Enforces type safety and provides environment-specific overrides.
 */

export interface PlannerConfig {
  canvas: {
    padding: number;
    minWidth: number;
    minHeight: number;
    defaultRoomWidth: number;
    defaultRoomDepth: number;
  };
  logic: {
    minimumWallGapCm: number;
    defaultWallThicknessCm: number;
    snappingGridSizeCm: number;
  };
  ui: {
    sidebarWidthLg: number;
    sidebarWidthXl: number;
    inspectorWidthLg: number;
    inspectorWidthXl: number;
    transitionDurationMs: number;
  };
  export: {
    pdfScale: number;
    pdfPageColor: string;
    pdfHeaderColor: string;
  };
}

const baseConfig: PlannerConfig = {
  canvas: {
    padding: 18,
    minWidth: 320,
    minHeight: 220,
    defaultRoomWidth: 960,
    defaultRoomDepth: 640,
  },
  logic: {
    minimumWallGapCm: 180,
    defaultWallThicknessCm: 10,
    snappingGridSizeCm: 10,
  },
  ui: {
    sidebarWidthLg: 312,
    sidebarWidthXl: 324,
    inspectorWidthLg: 300,
    inspectorWidthXl: 320,
    transitionDurationMs: 500,
  },
  export: {
    pdfScale: 2,
    pdfPageColor: "#f8fbff",
    pdfHeaderColor: "#172235",
  },
};

const developmentConfig: Partial<PlannerConfig> = {
  // Overrides for local development if needed
};

const productionConfig: Partial<PlannerConfig> = {
  // Overrides for production environment
};

const env = process.env.NODE_ENV || 'development';
const overrides = env === 'production' ? productionConfig : developmentConfig;

/**
 * Deep merge base config with environment overrides
 */
export const PLANNER_CONFIG: PlannerConfig = {
  ...baseConfig,
  canvas: { ...baseConfig.canvas, ...overrides.canvas },
  logic: { ...baseConfig.logic, ...overrides.logic },
  ui: { ...baseConfig.ui, ...overrides.ui },
  export: { ...baseConfig.export, ...overrides.export },
};
