import Link from "next/link";
import { ClientBadge, type ClientBadgeData } from "@/components/ClientBadge";
import { formatTrustedClientsFooter } from "@/lib/kpiFormat";

// Featured 16 clients — sourced from full client list (ClientMarquee)
const FEATURED_CLIENTS: ClientBadgeData[] = [
  { name: "Titan", sector: "Manufacturing" },
  { name: "Usha International", sector: "Manufacturing" },
  { name: "DMRC", sector: "Government" },
  { name: "Government of Bihar", sector: "Government" },
  { name: "Tata Steel", sector: "Manufacturing" },
  { name: "Tata Motors", sector: "Automotive" },
  { name: "L&T", sector: "Manufacturing" },
  { name: "HDFC", sector: "Finance" },
  { name: "State Bank of India", sector: "Finance" },
  { name: "NTPC", sector: "Energy" },
  { name: "IndianOil", sector: "Energy" },
  { name: "Maruti Suzuki", sector: "Automotive" },
  { name: "Asian Paints", sector: "FMCG" },
  { name: "ITC Limited", sector: "FMCG" },
  { name: "Indian Army", sector: "Government" },
  { name: "BHEL", sector: "Energy" },
];

interface OurWorkProps {
  clientCount: number;
}

export function OurWork({ clientCount }: OurWorkProps) {
  return (
    <section className="w-full bg-hover py-20 md:py-28 border-t border-soft">
      <div className="container-wide">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <p className="scheme-text-muted text-xs font-bold tracking-[0.25em] uppercase mb-4">
              Trusted Clients
            </p>
            <h2 className="text-3xl md:text-4xl text-strong tracking-tight leading-tight">
              Trusted by India&apos;s most respected organisations.
            </h2>
          </div>
          <Link
            href="/projects"
            className="shrink-0 text-xs font-bold tracking-max uppercase text-muted hover:text-strong transition-colors border-b border-muted hover:border-strong pb-1"
          >
            View all clients →
          </Link>
        </div>

        {/* Badge grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {FEATURED_CLIENTS.map((client) => (
            <ClientBadge key={client.name} {...client} />
          ))}
        </div>

        {/* Count footer */}
        <p data-testid="kpi-clients-footer" className="scheme-text-muted mt-8 text-xs font-medium tracking-wide text-center">
          {formatTrustedClientsFooter(clientCount)}
        </p>
      </div>
    </section>
  );
}

