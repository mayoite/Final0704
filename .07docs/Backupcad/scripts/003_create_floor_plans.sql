-- Create floor_plans table
CREATE TABLE IF NOT EXISTS public.floor_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  canvas_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  room_width_cm NUMERIC DEFAULT 1000,
  room_depth_cm NUMERIC DEFAULT 800,
  room_height_cm NUMERIC DEFAULT 300,
  thumbnail_url TEXT,
  is_template BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.floor_plans ENABLE ROW LEVEL SECURITY;

-- Users can view their own floor plans
CREATE POLICY "floor_plans_select_own" ON public.floor_plans 
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view public floor plans
CREATE POLICY "floor_plans_select_public" ON public.floor_plans 
  FOR SELECT USING (is_public = true);

-- Users can insert their own floor plans
CREATE POLICY "floor_plans_insert_own" ON public.floor_plans 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own floor plans
CREATE POLICY "floor_plans_update_own" ON public.floor_plans 
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own floor plans
CREATE POLICY "floor_plans_delete_own" ON public.floor_plans 
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can manage all floor plans
CREATE POLICY "floor_plans_admin_all" ON public.floor_plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create placed_furniture table
CREATE TABLE IF NOT EXISTS public.placed_furniture (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  floor_plan_id UUID NOT NULL REFERENCES public.floor_plans(id) ON DELETE CASCADE,
  furniture_item_id UUID NOT NULL REFERENCES public.furniture_items(id),
  position_x NUMERIC NOT NULL,
  position_y NUMERIC NOT NULL,
  rotation NUMERIC DEFAULT 0,
  scale_x NUMERIC DEFAULT 1,
  scale_y NUMERIC DEFAULT 1,
  custom_color TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.placed_furniture ENABLE ROW LEVEL SECURITY;

-- Users can view placed furniture in their own plans
CREATE POLICY "placed_furniture_select_own" ON public.placed_furniture 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.floor_plans WHERE id = floor_plan_id AND user_id = auth.uid())
  );

-- Users can view placed furniture in public plans
CREATE POLICY "placed_furniture_select_public" ON public.placed_furniture 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.floor_plans WHERE id = floor_plan_id AND is_public = true)
  );

-- Users can insert placed furniture in their own plans
CREATE POLICY "placed_furniture_insert_own" ON public.placed_furniture 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.floor_plans WHERE id = floor_plan_id AND user_id = auth.uid())
  );

-- Users can update placed furniture in their own plans
CREATE POLICY "placed_furniture_update_own" ON public.placed_furniture 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.floor_plans WHERE id = floor_plan_id AND user_id = auth.uid())
  );

-- Users can delete placed furniture in their own plans
CREATE POLICY "placed_furniture_delete_own" ON public.placed_furniture 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.floor_plans WHERE id = floor_plan_id AND user_id = auth.uid())
  );

-- Indexes
CREATE INDEX IF NOT EXISTS floor_plans_user_id_idx ON public.floor_plans(user_id);
CREATE INDEX IF NOT EXISTS floor_plans_is_public_idx ON public.floor_plans(is_public);
CREATE INDEX IF NOT EXISTS placed_furniture_floor_plan_id_idx ON public.placed_furniture(floor_plan_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS floor_plans_updated_at ON public.floor_plans;
CREATE TRIGGER floor_plans_updated_at
  BEFORE UPDATE ON public.floor_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
