import type { Metadata } from "next";
import { notFound } from "next/navigation";

const SOLUTION_COPY: Record<string, { title: string; description: string }> = {
  seating: {
    title: "Seating Solutions",
    description: "Ergonomic seating solutions for focused and collaborative work.",
  },
  workstations: {
    title: "Workstation Solutions",
    description:
      "Modular workstation systems for growing teams and evolving office layouts.",
  },
  tables: {
    title: "Table Solutions",
    description:
      "Meeting, cabin, and training table solutions for modern office workflows.",
  },
  storages: {
    title: "Storage Solutions",
    description: "Secure and flexible storage systems for organized workplaces.",
  },
  "soft-seating": {
    title: "Soft Seating Solutions",
    description:
      "Lounge and collaborative seating solutions for breakout and reception areas.",
  },
  education: {
    title: "Education Solutions",
    description:
      "Furniture solutions for classrooms, libraries, hostels, and auditoriums.",
  },
};

type SolutionsParams = Promise<{ category: string }>;

function getSolutionEntry(category: string) {
  return SOLUTION_COPY[category];
}

export async function generateMetadata({
  params,
}: {
  params: SolutionsParams;
}): Promise<Metadata> {
  const { category } = await params;
  const entry = getSolutionEntry(category);

  if (!entry) {
    return {
      title: "Solutions",
      description: "Tailored furniture solutions for every industry.",
    };
  }

  return {
    title: entry.title,
    description: `${entry.description} Built for offices in Patna, Bihar and across India.`,
    alternates: {
      canonical: `/solutions/${category}`,
    },
    openGraph: {
      title: entry.title,
      description: entry.description,
      type: "website",
      url: `/solutions/${category}`,
    },
  };
}

export default async function SolutionsCategoryPage({
  params,
}: {
  params: SolutionsParams;
}) {
  const { category } = await params;
  const entry = getSolutionEntry(category);

  if (!entry) {
    notFound();
  }

  return (
    <section className="container mx-auto px-6 py-24 text-center">
      <h1 className="text-4xl font-light mb-4">{entry.title}</h1>
      <p className="text-muted">{entry.description}</p>
    </section>
  );
}


