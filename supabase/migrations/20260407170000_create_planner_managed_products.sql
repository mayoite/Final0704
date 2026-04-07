CREATE TABLE IF NOT EXISTS public.planner_managed_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  legacy_product_id TEXT,
  slug TEXT NOT NULL UNIQUE,
  planner_source_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  category_id TEXT NOT NULL,
  category_name TEXT NOT NULL,
  series_id TEXT NOT NULL,
  series_name TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  flagship_image TEXT NOT NULL DEFAULT '',
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS planner_managed_products_active_idx
  ON public.planner_managed_products(active);

CREATE INDEX IF NOT EXISTS planner_managed_products_source_slug_idx
  ON public.planner_managed_products(planner_source_slug);

ALTER TABLE public.planner_managed_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS planner_managed_products_select_active ON public.planner_managed_products;
DROP POLICY IF EXISTS planner_managed_products_select_admin ON public.planner_managed_products;
DROP POLICY IF EXISTS planner_managed_products_insert_admin ON public.planner_managed_products;
DROP POLICY IF EXISTS planner_managed_products_update_admin ON public.planner_managed_products;
DROP POLICY IF EXISTS planner_managed_products_delete_admin ON public.planner_managed_products;

CREATE POLICY planner_managed_products_select_active
  ON public.planner_managed_products FOR SELECT
  USING (active = true);

CREATE POLICY planner_managed_products_select_admin
  ON public.planner_managed_products FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY planner_managed_products_insert_admin
  ON public.planner_managed_products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY planner_managed_products_update_admin
  ON public.planner_managed_products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY planner_managed_products_delete_admin
  ON public.planner_managed_products FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE OR REPLACE FUNCTION public.set_planner_managed_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS planner_managed_products_updated_at ON public.planner_managed_products;
CREATE TRIGGER planner_managed_products_updated_at
  BEFORE UPDATE ON public.planner_managed_products
  FOR EACH ROW EXECUTE FUNCTION public.set_planner_managed_products_updated_at();
