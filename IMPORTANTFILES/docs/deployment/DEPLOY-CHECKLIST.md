# Deploy Checklist

## Vercel

1. Install dependencies.

```bash
npm install
```

2. Set Vercel env vars for `Production`, `Preview`, and `Development`.

```env
NEXT_PUBLIC_SITE_URL=https://oando.co.in
SITE_URL=https://oando.co.in
NEXT_PUBLIC_SUPABASE_URL=https://erpweaiypimorcunaimz.supabase.co
SUPABASE_URL=https://erpweaiypimorcunaimz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-key>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXT_IMAGE_UNOPTIMIZED=0
OPENAI_MODEL=gpt-5.4
OPENROUTER_MODEL=openrouter/free
```

3. Run the release gate.

```bash
npm run release:gate
```

4. Deploy preview or production.

```bash
npm run vercel:preview
```

```bash
npm run vercel:prod
```

5. Smoke check:

- `/`
- `/planner`
- `/planner-blueprint`
- `/planner-lab`
- `/planners`
- `/configurator`

## Cloudflare / OpenNext

1. Install dependencies.

```bash
npm install
```

2. Set worker vars.

```env
NEXT_PUBLIC_SITE_URL=https://oando.co.in
SITE_URL=https://oando.co.in
NEXT_PUBLIC_SUPABASE_URL=https://erpweaiypimorcunaimz.supabase.co
SUPABASE_URL=https://erpweaiypimorcunaimz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-key>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
OPENAI_MODEL=gpt-5.4
OPENROUTER_MODEL=openrouter/free
NEXT_IMAGE_UNOPTIMIZED=0
CLOUDFLARE_BACKUP_ENABLED=true
```

3. Set the worker secret separately.

```env
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

4. Make sure empty Supabase values are not being pushed from `wrangler.jsonc`.

5. Build or preview.

```bash
npm run cf:build
```

```bash
npm run cf:preview
```

6. Deploy.

```bash
npm run cf:deploy
```

7. If needed, apply backup schema.

```bash
npm run cf:d1:schema:apply
```

8. Smoke check:

- `/`
- `/planner`
- `/planner-blueprint`
- `/planner-lab`
- `/planners`
- `/configurator`
