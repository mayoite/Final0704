CREATE TABLE IF NOT EXISTS public.planner_saves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled plan',
  room_width_mm INTEGER NOT NULL DEFAULT 6000,
  room_depth_mm INTEGER NOT NULL DEFAULT 4000,
  seat_target INTEGER NOT NULL DEFAULT 10,
  unit_system TEXT NOT NULL DEFAULT 'metric' CHECK (unit_system IN ('metric', 'imperial')),
  scene_json JSONB NOT NULL DEFAULT '{}',
  client_name TEXT,
  project_name TEXT,
  prepared_by TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS
ALTER TABLE public.planner_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own saves" ON public.planner_saves
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS planner_saves_user_id_idx ON public.planner_saves(user_id);
CREATE INDEX IF NOT EXISTS planner_saves_updated_at_idx ON public.planner_saves(updated_at DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_planner_saves_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER planner_saves_updated_at
  BEFORE UPDATE ON public.planner_saves
  FOR EACH ROW EXECUTE FUNCTION update_planner_saves_updated_at();
