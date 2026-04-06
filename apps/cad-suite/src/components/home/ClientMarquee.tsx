"use client";

import { useId } from "react";
import { TRUSTED_BY_CLIENTS } from "@/data/site/proof";

const CLIENT_NAMES = TRUSTED_BY_CLIENTS.map((client) => client.name);
const MIDPOINT = Math.ceil(CLIENT_NAMES.length / 2);
const CLIENTS_ROW_1 = CLIENT_NAMES.slice(0, MIDPOINT);
const CLIENTS_ROW_2 = CLIENT_NAMES.slice(MIDPOINT);

export function ClientMarquee() {
  const firstTrackId = useId();
  const secondTrackId = useId();

  return (
    <section className="client-marquee w-full overflow-hidden py-10 md:py-12">
      <div className="container mb-6 px-6 2xl:px-0">
        <p className="text-brand-slate-light text-left text-sm font-semibold tracking-wide md:text-right">
          Clients we have delivered for
        </p>
      </div>

      <div className="relative flex select-none flex-col gap-4 md:gap-5">
        <div
          id={firstTrackId}
          className="flex w-max animate-marquee motion-reduce:animate-none hover:[animation-play-state:paused]"
          style={{ animationDuration: "60s" }}
        >
          {[...Array(2)].map((_, i) => (
            <div
              key={`row1-${i}`}
              className="flex items-center whitespace-nowrap px-4"
            >
              {CLIENTS_ROW_1.map((client) => (
                <div
                  key={client}
                  className="text-brand-slate-bright mx-5 text-xl font-light tracking-tight opacity-70 transition-opacity duration-300 hover:opacity-100 md:text-3xl"
                >
                  {client}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div
          id={secondTrackId}
          className="flex w-max animate-marquee-reverse motion-reduce:animate-none hover:[animation-play-state:paused]"
          style={{ animationDuration: "60s" }}
        >
          {[...Array(2)].map((_, i) => (
            <div
              key={`row2-${i}`}
              className="flex items-center whitespace-nowrap px-4"
            >
              {CLIENTS_ROW_2.map((client) => (
                <div
                  key={client}
                  className="text-brand-slate-bright mx-5 text-xl font-light tracking-tight opacity-70 transition-opacity duration-300 hover:opacity-100 md:text-3xl"
                >
                  {client}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="client-marquee__fade--left absolute inset-y-0 left-0 w-16 pointer-events-none md:w-32" />
        <div className="client-marquee__fade--right absolute inset-y-0 right-0 w-16 pointer-events-none md:w-32" />
      </div>
    </section>
  );
}
