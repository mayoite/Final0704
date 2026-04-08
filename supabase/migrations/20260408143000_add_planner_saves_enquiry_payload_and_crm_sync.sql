ALTER TABLE public.planner_saves
  ADD COLUMN IF NOT EXISTS enquiry_payload JSONB,
  ADD COLUMN IF NOT EXISTS crm_sync_status TEXT,
  ADD COLUMN IF NOT EXISTS crm_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS crm_sync_error TEXT;

UPDATE public.planner_saves
SET crm_sync_status = 'pending'
WHERE crm_sync_status IS NULL;

ALTER TABLE public.planner_saves
  ALTER COLUMN crm_sync_status SET DEFAULT 'pending',
  ALTER COLUMN crm_sync_status SET NOT NULL;

DO $$
BEGIN
  ALTER TABLE public.planner_saves
    ADD CONSTRAINT planner_saves_crm_sync_status_check
    CHECK (crm_sync_status IN ('pending', 'exported', 'failed'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  ALTER TABLE public.planner_saves
    ADD CONSTRAINT planner_saves_enquiry_payload_object_check
    CHECK (enquiry_payload IS NULL OR jsonb_typeof(enquiry_payload) = 'object');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE INDEX IF NOT EXISTS planner_saves_crm_sync_status_idx
  ON public.planner_saves(crm_sync_status);
