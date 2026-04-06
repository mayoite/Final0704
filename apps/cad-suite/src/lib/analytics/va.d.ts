export {};

declare global {
  interface Window {
    va?: {
      track?: (name: string, payload?: Record<string, unknown>) => void;
    };
  }
}

