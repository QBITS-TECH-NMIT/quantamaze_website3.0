# Inauguration realtime database

The inauguration stage and Phone 1–9 views synchronize through Supabase Realtime and the `public.inauguration_state` table. The browser uses the public anon key; never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code.

## Setup

1. In the Supabase project used by the site, run [`supabase/inauguration-state.sql`](./supabase/inauguration-state.sql) in the SQL Editor. Run it again when updating an existing installation; it adds support for each guest's persistent diya state while retaining the existing room setup.
2. Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured for the local site and the Vercel deployment, then restart/redeploy.
3. Open the inauguration control page, stage link, and phone links on separate devices. The stage/phone status indicator should report `online`.

## Lighting sequence

Each guest opens their assigned phone link and taps `LIGHT` once to light only their matching diya. A diya stays lit after the guest releases the button. The stage shows the welcome only after all nine different diyas are lit. Reset the sequence from the stage with `R`; number keys `1`–`9` (or the visible stage slots with `&hud=1`) simulate lighting an individual diya during rehearsal.

This is intentionally a no-sign-in setup: anyone with the site links can participate in the `qam3` event. State and guest names in that room are readable by anonymous clients. Remove `qam3` rows from the table after the event if the state is no longer needed.

If a view reports `database read failed` or `write failed`, check the browser console and confirm the SQL setup ran in the same Supabase project as the configured URL. `online · polling` means database reads work but Realtime is disconnected; the views continue syncing by polling. The service-role key is not needed for this client workflow.
