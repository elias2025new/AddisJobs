# 🗄️ Supabase Backend — Agent Reference Guide

> **IMPORTANT — READ BEFORE EVERY BACKEND CHANGE**
>
> This file is the authoritative guide for all Supabase-related operations in this project.
> The AI agent MUST read this file before modifying any migration, edge function, or database-related code.
> Always check if a database migration or edge function redeploy is needed after changes.

---

## 📁 Project Structure

```
prime-hospitality/
└── supabase/
    ├── config.toml                          ← Supabase project config
    ├── migrations/
    │   └── 00001_initial_schema.sql        ← Core schema (tables, RLS, triggers)
    └── functions/
        └── validate-telegram-auth/
            └── index.ts                    ← Single multi-action edge function
```

---

## 🗃️ Database Schema

### Tables (all in `public` schema)

| Table | Description |
|---|---|
| `users` | Core identity — every user has a Telegram ID and a role |
| `employers` | Business accounts linked to a `user_id` |
| `profiles` | Job seeker profiles linked to a `user_id` |
| `jobs` | Job listings posted by employers |
| `applications` | Job applications submitted by job seekers |

### Key Columns to Know

- `profiles.phone_number` — can be `NULL` if `contact_shared = false`
- `profiles.selected_categories` — `text[]` array (e.g. `["Waiter", "Barista"]`)
- `profiles.experience_levels` — `jsonb` object (e.g. `{"Waiter": "Mid Level"}`)
- `jobs.status` — one of `pending | active | closed | rejected`
- `applications.status` — one of `pending | reviewed | shortlisted | rejected`

### Row Level Security (RLS)
All tables have RLS enabled. Frontend clients can only read/write their own rows.
**All writes are performed via the Edge Function using the `service_role` key which bypasses RLS.**

---

## ⚡ Edge Function — `validate-telegram-auth`

**Location:** `supabase/functions/validate-telegram-auth/index.ts`

This is a **single, multi-action Deno function** — all backend logic routes through it via `payload.action`. There is no separate REST API.

### Actions supported

| `action` | What it does |
|---|---|
| `submit_application` | Validates Telegram user, rate-limits, inserts into `applications` |
| `create_profile` | Creates `users` + `profiles` rows during onboarding |
| `get_profile` | Fetches a job seeker's profile by `telegram_id` |
| `get_applications` | Fetches all applications for a job seeker |
| `get_employer_dashboard` | Returns employer's jobs, stats, and application counts |
| `post_job` | Inserts a new `pending` job listing for approved employers |

### Environment Variables Required

| Variable | Description |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Used to validate the Telegram `initData` HMAC signature |
| `SUPABASE_URL` | The Supabase project URL (auto-injected by Supabase runtime) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key to bypass RLS (auto-injected) |

---

## 🖥️ CLI Commands Reference

### Link project (first time)
```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
```

### Push a new migration
```bash
npx supabase db push
```

### Create a new migration file
```bash
npx supabase migration new <migration_name>
# e.g. npx supabase migration new add_category_column
# File created at: supabase/migrations/<timestamp>_<migration_name>.sql
```

### Deploy the edge function
```bash
npx supabase functions deploy validate-telegram-auth
```

### Run edge function locally (for testing)
```bash
npx supabase start
npx supabase functions serve validate-telegram-auth --env-file .env.local
```

### View edge function logs
```bash
npx supabase functions logs validate-telegram-auth
```

---

## 🔄 When to Deploy — Decision Checklist

Before finishing any task, always check the following:

| Change Made | Action Required |
|---|---|
| Added/modified a SQL migration file | ✅ `npx supabase db push` |
| Added a new column to a table | ✅ Create a new migration file + `db push` |
| Changed edge function logic in `index.ts` | ✅ `npx supabase functions deploy validate-telegram-auth` |
| Added a new `action` to the edge function | ✅ `npx supabase functions deploy validate-telegram-auth` |
| Changed frontend TypeScript only | ❌ No Supabase deploy needed |
| Changed CSS / UI only | ❌ No Supabase deploy needed |

---

## 🆕 How to Add a New Action to the Edge Function

1. Open `supabase/functions/validate-telegram-auth/index.ts`
2. Add a new `if (action === "your_new_action")` block **before** the final `Unknown action` response
3. Implement and sanitize the logic using the `supabase` service client
4. Run: `npx supabase functions deploy validate-telegram-auth`

---

## 🆕 How to Add a New Database Column

1. Create a new migration file:
   ```bash
   npx supabase migration new add_<column>_to_<table>
   ```
2. Write the `ALTER TABLE` statement inside the generated `.sql` file:
   ```sql
   ALTER TABLE public.profiles ADD COLUMN my_new_column text;
   ```
3. Push to Supabase:
   ```bash
   npx supabase db push
   ```
4. Update the edge function `index.ts` to handle the new column if needed
5. Update the frontend TypeScript types and API calls

---

## ⚠️ Rules & Constraints

- **Never expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend.** It only lives in the edge function environment.
- **Never skip `sanitizeHtml()` on any user-provided text before inserting to the database.**
- **Never add a direct `INSERT` policy for `applications` or `jobs` on the frontend client.** All writes go through the edge function.
- **Always validate Telegram `initData` signature** at the top of every request — the function already does this, do not remove or bypass it.
- When adding new categories to the TypeScript frontend, **no migration is needed** — `category` is stored as `text` in the `jobs` table and `text[]` in the `profiles` table.
