import { z } from "zod";

const plannerManagedProductText = z.string().trim().min(1);
const plannerManagedProductOptionalText = z.string().trim().nullish().transform((value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
});

const plannerManagedProductStringArray = z
  .array(z.string().trim())
  .default([])
  .transform((items) => items.filter((item) => item.length > 0));

const plannerManagedProductJsonRecord = z.record(z.string(), z.unknown()).default({});

export const plannerManagedProductRowSchema = z.object({
  id: z.string().uuid(),
  legacy_product_id: plannerManagedProductOptionalText,
  slug: plannerManagedProductText,
  planner_source_slug: plannerManagedProductText,
  name: plannerManagedProductText,
  description: z.string().default(""),
  category: plannerManagedProductText,
  category_id: plannerManagedProductText,
  category_name: plannerManagedProductText,
  series_id: plannerManagedProductText,
  series_name: plannerManagedProductText,
  price: z.number().int().nonnegative().default(0),
  flagship_image: z.string().default(""),
  images: plannerManagedProductStringArray,
  specs: plannerManagedProductJsonRecord,
  metadata: plannerManagedProductJsonRecord,
  active: z.boolean().default(true),
  created_by: z.string().uuid().nullish().transform((value) => value ?? null),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

export const plannerManagedProductWriteSchema = plannerManagedProductRowSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  id: z.string().uuid().optional(),
});

export type PlannerManagedProductRow = z.infer<typeof plannerManagedProductRowSchema>;
export type PlannerManagedProductWrite = z.infer<typeof plannerManagedProductWriteSchema>;
