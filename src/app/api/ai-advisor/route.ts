import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getProducts } from "@/lib/getProducts";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { normalizeRequestedCategoryId } from "@/lib/catalogCategories";
import { SITE_URL } from "@/lib/siteUrl";
import {
  buildConfiguratorContextSummary,
  sanitizeAdvisorPriceText,
  type AdvisorRecommendation,
  type AdvisorRequest,
  type AdvisorResult,
  type ConfiguratorAdvisorContext,
} from "@/lib/aiAdvisor";

type ProductLite = Awaited<ReturnType<typeof getProducts>>[number];
type AdvisorClientConfig = {
  client: OpenAI;
  model: string;
};

const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.4";

function createOpenRouterClient(apiKey: string) {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": SITE_URL,
      "X-Title": "One&Only",
    },
  });
}

function resolveAdvisorClient(): AdvisorClientConfig | null {
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (openAiKey) {
    return {
      client: new OpenAI({ apiKey: openAiKey }),
      model: DEFAULT_OPENAI_MODEL,
    };
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
  if (openRouterKey) {
    return {
      client: createOpenRouterClient(openRouterKey),
      model: process.env.OPENROUTER_MODEL || "openrouter/free",
    };
  }

  return null;
}

function parsePayload(
  value: unknown,
): { query: string; userId: string; context?: ConfiguratorAdvisorContext } | null {
  if (!value || typeof value !== "object") return null;
  const source = value as AdvisorRequest & Record<string, unknown>;
  const query = typeof source.query === "string" ? source.query.trim() : "";
  const userId = typeof source.userId === "string" ? source.userId.trim() : "";
  if (!query) return null;
  const context =
    source.context && typeof source.context === "object"
      ? (source.context as ConfiguratorAdvisorContext)
      : undefined;
  return { query, userId, context };
}

function normalizeCategoryId(raw: string): string {
  const canonical = normalizeRequestedCategoryId(raw);
  if (canonical) return canonical;
  const stripped = raw.replace(/^oando-/, "").trim().toLowerCase();
  return stripped || "seating";
}

function parsePriceRange(priceRange: string | undefined): string {
  switch (priceRange) {
    case "budget":
      return "Budget-friendly";
    case "mid":
      return "Mid-range";
    case "premium":
      return "Premium";
    case "luxury":
      return "Luxury";
    default:
      return "On request";
  }
}

function inferBudgetFromQuery(query: string): string {
  const text = query.toLowerCase();
  if (text.includes("budget") || text.includes("cost effective")) return "Indicative value band on request";
  if (text.includes("premium") || text.includes("executive")) return "Indicative premium band on request";
  if (text.includes("luxury") || text.includes("director")) return "Indicative premium band on request";
  return "Indicative budget band on request";
}

function buildHeuristicRecommendations(
  query: string,
  products: ProductLite[],
): AdvisorRecommendation[] {
  const words = query
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((word) => word.trim())
    .filter((word) => word.length > 2);

  const categoryHints: Array<{ id: string; tokens: string[] }> = [
    { id: "seating", tokens: ["chair", "seating", "ergonomic", "visitor", "training"] },
    { id: "workstations", tokens: ["workstation", "desk", "bench", "desking"] },
    { id: "tables", tokens: ["table", "meeting", "conference", "cabin"] },
    { id: "storages", tokens: ["storage", "locker", "cabinet", "pedestal"] },
    { id: "soft-seating", tokens: ["sofa", "lounge", "pod", "collaborative"] },
    { id: "education", tokens: ["classroom", "library", "hostel", "auditorium"] },
  ];

  const hintedCategories = new Set<string>();
  for (const hint of categoryHints) {
    if (hint.tokens.some((token) => query.toLowerCase().includes(token))) {
      hintedCategories.add(hint.id);
    }
  }

  const scored = products.map((product) => {
    const haystack = [
      product.name,
      product.description || "",
      product.category_id,
      product.series_name,
      product.series,
      ...(product.metadata?.tags || []),
      product.metadata?.subcategory || "",
    ]
      .join(" ")
      .toLowerCase();

    let score = 0;
    for (const word of words) {
      if (haystack.includes(word)) score += 2;
    }
    if (hintedCategories.has(normalizeCategoryId(product.category_id))) {
      score += 3;
    }
    return { product, score };
  });

  scored.sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name));
  const picked = scored.filter((entry) => entry.score > 0).slice(0, 5);
  const finalList = (picked.length > 0 ? picked : scored.slice(0, 5)).map((entry) => {
    const product = entry.product;
    const category = normalizeCategoryId(product.category_id);
    return {
      productUrlKey: product.slug,
      productId: product.slug,
      productName: product.name,
      category,
      why:
        product.description?.split(".")[0]?.trim() ||
        `Matches ${category.replace(/-/g, " ")} requirements in your brief.`,
      budgetEstimate: parsePriceRange(product.metadata?.priceRange),
    } satisfies AdvisorRecommendation;
  });

  return finalList;
}

function buildContextualNextActions(
  context: ConfiguratorAdvisorContext | undefined,
): string[] {
  if (!context || context.source !== "configurator") {
    return [
      "Share team size, city, and category priorities to tighten the shortlist.",
      "Confirm whether budget, delivery speed, or ergonomics should lead the recommendation.",
    ];
  }

  const actions = [
    "Review the fit result before locking product family decisions.",
    "Compare one lower-budget and one ergonomic alternative against the current snapshot.",
  ];
  if (context.fitStatus?.toLowerCase().includes("over")) {
    actions.unshift("Reduce seat or unit density, or increase the usable planning zone.");
  }
  if (!context.siteLocation) {
    actions.push("Add site location to tune installation and delivery assumptions.");
  }
  return actions;
}

function buildContextualWarnings(
  context: ConfiguratorAdvisorContext | undefined,
): string[] {
  if (!context || context.source !== "configurator") return [];
  const warnings: string[] = [];
  if (context.fitStatus?.toLowerCase().includes("over")) {
    warnings.push("Current layout does not fit inside the stated planning zone.");
  }
  if (!context.budgetBand || context.budgetBand.toLowerCase().includes("guidance")) {
    warnings.push("Budget band is still open, so pricing remains indicative only.");
  }
  return warnings;
}

function buildFallbackAdvisorResponse(
  query: string,
  products: ProductLite[],
  context?: ConfiguratorAdvisorContext,
): AdvisorResult {
  const recommendations = buildHeuristicRecommendations(query, products);
  return {
    recommendations,
    totalBudget:
      context?.estimatedBudget && !context.estimatedBudget.toLowerCase().includes("$")
        ? context.estimatedBudget
        : inferBudgetFromQuery(query),
    summary:
      context?.source === "configurator"
        ? "Here is a practical shortlist based on the current configurator snapshot. Use this to decide the next change, not as a final BOQ."
        : "Here is a practical shortlist based on your brief and our available catalog. Share team size and site details for a tighter recommendation.",
    nextActions: buildContextualNextActions(context),
    warnings: buildContextualWarnings(context),
    pricingMode: context?.estimatedBudget ? "band" : "on-request",
    fallbackUsed: true,
  };
}

function normalizeRecommendation(
  entry: unknown,
  byUrlKey: Map<string, ProductLite>,
): AdvisorRecommendation | null {
  if (!entry || typeof entry !== "object") return null;
  const source = entry as Record<string, unknown>;
  const productUrlKey =
    typeof source.productUrlKey === "string" && source.productUrlKey.trim().length > 0
      ? source.productUrlKey.trim()
      : typeof source.productId === "string" && source.productId.trim().length > 0
        ? source.productId.trim()
        : "";

  if (!productUrlKey) return null;
  const product = byUrlKey.get(productUrlKey);
  const categoryFromEntry =
    typeof source.category === "string" ? source.category : product?.category_id || "";
  const category = normalizeCategoryId(categoryFromEntry);

  return {
    productUrlKey,
    productId: productUrlKey,
    productName:
      typeof source.productName === "string" && source.productName.trim().length > 0
        ? source.productName
        : product?.name || "",
    category,
    why:
      typeof source.why === "string" && source.why.trim().length > 0
        ? source.why
        : product?.description?.split(".")[0] || "",
    budgetEstimate:
      typeof source.budgetEstimate === "string" && source.budgetEstimate.trim().length > 0
        ? sanitizeAdvisorPriceText(source.budgetEstimate, parsePriceRange(product?.metadata?.priceRange))
        : parsePriceRange(product?.metadata?.priceRange),
  };
}

function isMissingUserHistoryTable(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("could not find the table") &&
    normalized.includes("public.user_history")
  );
}

export async function POST(req: NextRequest) {
  try {
    const parsedBody = parsePayload(await req.json());
    if (!parsedBody) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }
    const { query, userId, context } = parsedBody;

    const products = await getProducts();
    if (!products || products.length === 0) {
      return NextResponse.json(
        {
          recommendations: [],
          totalBudget: "On request",
          summary: "Catalog is temporarily unavailable.",
          nextActions: buildContextualNextActions(context),
          warnings: buildContextualWarnings(context),
          pricingMode: "on-request",
          fallbackUsed: true,
        },
        { status: 200 },
      );
    }

    const productsByUrlKey = new Map(products.map((product) => [product.slug, product]));

    const advisorClient = resolveAdvisorClient();
    if (!advisorClient) {
      return NextResponse.json(buildFallbackAdvisorResponse(query, products, context), {
        status: 200,
      });
    }

    let historyContext = "";
    if (userId) {
      const supabaseAdmin = createSupabaseAdminClient();
      const { data, error } = await supabaseAdmin
        .from("user_history")
        .select("viewed_products")
        .eq("user_id", userId)
        .single();
      if (error && !isMissingUserHistoryTable(error.message)) {
        console.error("[ai-advisor] user_history error:", error.message);
      }
      if (data?.viewed_products?.length) {
        historyContext =
          `\nClient History (Recently Viewed Products): ${data.viewed_products.join(", ")}` +
          "\nPrioritize recommending complementary or similar items based on this history.";
      }
    }

    const productList = products
      .slice(0, 80)
      .map(
        (p) =>
          `- Product URL Key: ${p.slug} | Name: ${p.name} | Category: ${p.category_id} | ${p.description?.slice(0, 80)}`,
      )
      .join("\n");

    const contextSummary = buildConfiguratorContextSummary(context);
    const systemPrompt = `You are an enterprise workspace engineering consultant for One & Only Furniture.
Recommend 3 to 5 specific products from the catalog.
Consider team size, industry, budget sensitivity, location context, and ergonomic needs.
Only use the live catalog below.
This is an India-facing experience, so never return USD or dollar pricing. Use INR budget bands or "On request".
Do not fabricate a final BOQ or fake precision totals.
${historyContext}
${contextSummary ? `\n${contextSummary}\n` : ""}

Available products:
${productList}

Respond ONLY with valid JSON in this exact shape:
{
  "recommendations": [
    {
      "productUrlKey": "<product URL key from catalog>",
      "productId": "<same value as productUrlKey for backward compatibility>",
      "productName": "<name>",
      "category": "<category>",
      "why": "<one sentence engineering rationale>",
      "budgetEstimate": "<budget range>"
    }
  ],
  "totalBudget": "<estimated project total range>",
  "summary": "<2-sentence consultation summary>",
  "nextActions": ["<specific next change or validation step>"],
  "warnings": ["<optional risk or confidence caveat>"],
  "pricingMode": "band"
}`;

    const completion = await advisorClient.client.chat.completions.create({
      model: advisorClient.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      temperature: 0.4,
    });

    let parsed: Record<string, unknown> = {};
    try {
      let raw = completion.choices[0]?.message?.content ?? "{}";
      raw = raw.replace(/^```json\n/, "").replace(/\n```$/, "").trim();
      parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return NextResponse.json(buildFallbackAdvisorResponse(query, products, context), {
        status: 200,
      });
    }

    const recommendations = Array.isArray(parsed.recommendations)
      ? parsed.recommendations
          .map((entry) => normalizeRecommendation(entry, productsByUrlKey))
          .filter((item): item is AdvisorRecommendation => Boolean(item))
      : [];

    if (recommendations.length === 0) {
      return NextResponse.json(buildFallbackAdvisorResponse(query, products, context), {
        status: 200,
      });
    }

    return NextResponse.json({
      recommendations,
      totalBudget: sanitizeAdvisorPriceText(
        typeof parsed.totalBudget === "string" && parsed.totalBudget.trim().length > 0
          ? parsed.totalBudget
          : context?.estimatedBudget || inferBudgetFromQuery(query),
        context?.estimatedBudget || inferBudgetFromQuery(query),
      ),
      summary:
        typeof parsed.summary === "string" && parsed.summary.trim().length > 0
          ? parsed.summary
          : "Recommendation shortlist generated from your project brief and current catalog.",
      nextActions: Array.isArray(parsed.nextActions)
        ? parsed.nextActions.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        : buildContextualNextActions(context),
      warnings: Array.isArray(parsed.warnings)
        ? parsed.warnings.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        : buildContextualWarnings(context),
      pricingMode:
        parsed.pricingMode === "band" || parsed.pricingMode === "on-request"
          ? parsed.pricingMode
          : context?.estimatedBudget
            ? "band"
            : "on-request",
      fallbackUsed: false,
    });
  } catch (err) {
    console.error("[ai-advisor] Error:", err);
    return NextResponse.json(
      {
        recommendations: [],
        totalBudget: "On request",
        summary: "Unable to process advisor request right now.",
        nextActions: buildContextualNextActions(undefined),
        warnings: [],
        pricingMode: "on-request",
        fallbackUsed: true,
      },
      { status: 200 },
    );
  }
}
