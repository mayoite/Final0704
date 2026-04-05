CREATE TABLE IF NOT EXISTS public.planner_saves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled plan',
  project_name TEXT,
  client_name TEXT,
  prepared_by TEXT,
  -- Room config snapshot
  room_width_mm INTEGER NOT NULL DEFAULT 6000,
  room_depth_mm INTEGER NOT NULL DEFAULT 8000,
  seat_target INTEGER NOT NULL DEFAULT 10,
  unit_system TEXT NOT NULL DEFAULT 'metric' CHECK (unit_system IN ('metric', 'imperial')),
  -- Full scene snapshot (JSON)
  scene_json JSONB NOT NULL DEFAULT '{}',
  -- Metadata
  item_count INTEGER NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS
ALTER TABLE public.planner_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own saves"
  ON public.planner_saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saves"
  ON public.planner_saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saves"
  ON public.planner_saves FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saves"
  ON public.planner_saves FOR DELETE
  USING (auth.uid() = user_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER planner_saves_updated_at
  BEFORE UPDATE ON public.planner_saves
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
