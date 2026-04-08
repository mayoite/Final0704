import type { ReactNode } from "react";
export default function CrmLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-canvas text-inverse antialiased">{children}</div>;
}
