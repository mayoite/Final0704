ALTER TABLE public.planner_saves
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS project_name TEXT,
  ADD COLUMN IF NOT EXISTS prepared_by TEXT,
  ADD COLUMN IF NOT EXISTS item_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

ALTER TABLE public.planner_saves
  ALTER COLUMN room_width_mm SET DEFAULT 6000,
  ALTER COLUMN room_depth_mm SET DEFAULT 8000,
  ALTER COLUMN seat_target SET DEFAULT 10,
  ALTER COLUMN unit_system SET DEFAULT 'metric',
  ALTER COLUMN scene_json SET DEFAULT '{}'::jsonb,
  ALTER COLUMN item_count SET DEFAULT 0;

UPDATE public.planner_saves
SET item_count = 0
WHERE item_count IS NULL;

ALTER TABLE public.planner_saves
  ALTER COLUMN item_count SET NOT NULL;

CREATE INDEX IF NOT EXISTS planner_saves_user_id_idx ON public.planner_saves(user_id);
CREATE INDEX IF NOT EXISTS planner_saves_updated_at_idx ON public.planner_saves(updated_at DESC);

DROP POLICY IF EXISTS "Users can manage own saves" ON public.planner_saves;
DROP POLICY IF EXISTS "Users can read own saves" ON public.planner_saves;
DROP POLICY IF EXISTS "Users can insert own saves" ON public.planner_saves;
DROP POLICY IF EXISTS "Users can update own saves" ON public.planner_saves;
DROP POLICY IF EXISTS "Users can delete own saves" ON public.planner_saves;
DROP POLICY IF EXISTS planner_saves_select_own ON public.planner_saves;
DROP POLICY IF EXISTS planner_saves_insert_own ON public.planner_saves;
DROP POLICY IF EXISTS planner_saves_update_own ON public.planner_saves;
DROP POLICY IF EXISTS planner_saves_delete_own ON public.planner_saves;
DROP POLICY IF EXISTS planner_saves_select_admin ON public.planner_saves;
DROP POLICY IF EXISTS planner_saves_update_admin ON public.planner_saves;

CREATE POLICY planner_saves_select_own
  ON public.planner_saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY planner_saves_insert_own
  ON public.planner_saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY planner_saves_update_own
  ON public.planner_saves FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY planner_saves_delete_own
  ON public.planner_saves FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY planner_saves_select_admin
  ON public.planner_saves FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY planner_saves_update_admin
  ON public.planner_saves FOR UPDATE
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
