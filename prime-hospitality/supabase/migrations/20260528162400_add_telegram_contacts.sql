-- Create table for storing incoming Telegram webhook contacts
CREATE TABLE public.telegram_contacts (
  telegram_id bigint PRIMARY KEY,
  phone_number text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: Enable RLS but don't add public policies, since only the edge function needs it
ALTER TABLE public.telegram_contacts ENABLE ROW LEVEL SECURITY;
