-- Create furniture_items table for the catalog
CREATE TABLE IF NOT EXISTS public.furniture_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('workstation', 'desk', 'chair', 'table', 'storage', 'seating', 'accessory')),
  subcategory TEXT,
  brand TEXT DEFAULT 'One & Only',
  width_cm NUMERIC NOT NULL,
  depth_cm NUMERIC NOT NULL,
  height_cm NUMERIC NOT NULL,
  image_url TEXT,
  thumbnail_url TEXT,
  model_3d_url TEXT,
  color_options JSONB DEFAULT '[]'::jsonb,
  price_inr NUMERIC,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.furniture_items ENABLE ROW LEVEL SECURITY;

-- Everyone can view active furniture items
CREATE POLICY "furniture_items_select_all" ON public.furniture_items 
  FOR SELECT USING (is_active = true);

-- Admins can view all items including inactive
CREATE POLICY "furniture_items_admin_select" ON public.furniture_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can insert furniture items
CREATE POLICY "furniture_items_admin_insert" ON public.furniture_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can update furniture items
CREATE POLICY "furniture_items_admin_update" ON public.furniture_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can delete furniture items
CREATE POLICY "furniture_items_admin_delete" ON public.furniture_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create index for faster category filtering
CREATE INDEX IF NOT EXISTS furniture_items_category_idx ON public.furniture_items(category);
CREATE INDEX IF NOT EXISTS furniture_items_is_active_idx ON public.furniture_items(is_active);

-- Trigger for updated_at on furniture_items
DROP TRIGGER IF EXISTS furniture_items_updated_at ON public.furniture_items;
CREATE TRIGGER furniture_items_updated_at
  BEFORE UPDATE ON public.furniture_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
