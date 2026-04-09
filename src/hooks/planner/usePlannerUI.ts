import { PLANNER_CONFIG } from "@/lib/planner/planner.config";
import { useCallback, useEffect, useState } from "react";

/**
 * Custom hook for managing planner UI states like sidebar and inspector visibility.
 * 
 * Provides handlers for toggling panels and centralized transition logic.
 * 
 * @returns {Object} UI state and handlers
 */
export function usePlannerUI() {
  const isDesktopViewport = () =>
    typeof window === "undefined" ? true : window.innerWidth >= 1024;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [isClientBarOpen, setIsClientBarOpen] = useState(false);

  useEffect(() => {
    function syncPanelsToViewport() {
      if (isDesktopViewport()) {
        setIsSidebarOpen(true);
        setIsInspectorOpen(true);
        setIsClientBarOpen(false);
        return;
      }

      setIsSidebarOpen(false);
      setIsInspectorOpen(false);
      setIsClientBarOpen(false);
    }

    syncPanelsToViewport();
    window.addEventListener("resize", syncPanelsToViewport);

    return () => {
      window.removeEventListener("resize", syncPanelsToViewport);
    };
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => {
      const next = !prev;

      if (next && !isDesktopViewport()) {
        setIsInspectorOpen(false);
        setIsClientBarOpen(false);
      }

      return next;
    });
  }, []);

  const toggleInspector = useCallback(() => {
    setIsInspectorOpen((prev) => {
      const next = !prev;

      if (next) {
        setIsClientBarOpen(false);
        if (!isDesktopViewport()) {
          setIsSidebarOpen(false);
        }
      }

      return next;
    });
  }, []);

  const toggleClientBar = useCallback(() => {
    setIsClientBarOpen((prev) => {
      const next = !prev;

      if (next) {
        setIsInspectorOpen(false);
        if (!isDesktopViewport()) {
          setIsSidebarOpen(false);
        }
      }

      return next;
    });
  }, []);

  return {
    isSidebarOpen,
    isInspectorOpen,
    isClientBarOpen,
    toggleSidebar,
    toggleInspector,
    toggleClientBar,
    setIsSidebarOpen,
    setIsInspectorOpen,
    setIsClientBarOpen,
    config: PLANNER_CONFIG.ui,
  };
}
