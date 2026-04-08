import localFont from "next/font/local";

export const ciscoSans = localFont({
  src: [
    {
      path: "../../public/fonts/cisco-sans/CiscoSans-Thin.ttf",
      weight: "250",
      style: "normal",
    },
    {
      path: "../../public/fonts/cisco-sans/CiscoSans-ExtraLight.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/cisco-sans/CiscoSans.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/cisco-sans/CiscoSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-cisco-sans",
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

export const helveticaNeue = localFont({
  src: [
    {
      path: "../../helvetica-neue/helveticaneue-light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../helvetica-neue/helveticaneue.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../helvetica-neue/helveticaneue-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../helvetica-neue/helveticaneue-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-helvetica-neue",
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});
