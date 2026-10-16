-- Team members for the /members page, managed from /admin/members.
-- Run once in the Supabase SQL Editor. Safe to re-run: the seed only inserts when the table is empty.

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  group_id text not null check (group_id in ('faculty', 'leadership', 'technical', 'administration', 'design', 'events', 'hospitality', 'marketing-and-sponsorship', 'operations', 'rnd', 'social-media')),
  name text not null check (char_length(trim(name)) between 1 and 100),
  role text not null default 'Member' check (char_length(trim(role)) between 1 and 80),
  code text check (code is null or char_length(code) <= 20),
  photo_url text check (photo_url is null or char_length(photo_url) <= 2048),
  is_head boolean not null default false,
  is_top_leadership boolean not null default false,
  image_position text check (image_position is null or char_length(image_position) <= 40),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists team_members_group_sort_idx
  on public.team_members (group_id, sort_order, created_at);

-- Locked down like the other admin tables: only the server (service role) can read/write.
alter table public.team_members enable row level security;
revoke all on table public.team_members from anon, authenticated;
grant all on table public.team_members to service_role;

-- Public bucket for photos uploaded from the admin page (max 4 MB, JPG/PNG/WebP).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('team-photos', 'team-photos', true, 4194304, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Seed with the current roster (74 members). Existing photos keep pointing at /team-photos/*.
insert into public.team_members
  (group_id, name, role, code, photo_url, is_head, is_top_leadership, image_position, sort_order)
select * from (values
  ('faculty', 'Dr N Samanvita', 'Head Of Department', 'FA-01', '/team-photos/fa_01.webp', false, false, null, 10),
  ('faculty', 'Dr Lakshmanan M', 'Faculty', 'FA-02', '/team-photos/fa_02.webp', false, false, null, 20),
  ('faculty', 'Dr Amruth Ramesh', 'Faculty', 'FA-03', '/team-photos/fa_03.webp', false, false, null, 30),
  ('faculty', 'Mr Melam Thirupathaiah', 'Faculty', 'FA-04', '/team-photos/fa_04.webp', false, false, null, 40),
  ('leadership', 'ML Shikhar', 'President', 'LE-01', '/team-photos/le_01.webp', false, true, null, 10),
  ('leadership', 'Shreya Rotti', 'Vice President', 'LE-02', '/team-photos/le_02.webp', false, true, null, 20),
  ('technical', 'Syed Maaz', 'Head', 'TC-01', '/team-photos/tc_01.webp', true, false, null, 10),
  ('technical', 'Jadyn', 'Lead', 'TC-02', '/team-photos/tc_02.webp', false, false, null, 20),
  ('technical', 'Janvika Malapati', 'Member', 'TC-03', '/team-photos/tc_03.webp', false, false, null, 30),
  ('technical', 'Prisha Ruturaj C', 'Member', 'TC-04', '/team-photos/tc_04.webp', false, false, null, 40),
  ('technical', 'Vemala Prajwal', 'Member', 'TC-05', '/team-photos/tc_05.webp', false, false, null, 50),
  ('technical', 'Haripriya Katabathina', 'Member', 'TC-06', '/team-photos/tc_06.webp', false, false, null, 60),
  ('technical', 'Hiranmayi', 'Member', 'TC-07', '/team-photos/tc_07.webp', false, false, null, 70),
  ('technical', 'Pranav Rohan', 'Member', 'TC-08', '/team-photos/tc_08.webp', false, false, null, 80),
  ('technical', 'Arnav Raj Karn', 'Member', 'TC-10', '/team-photos/tc_10.webp', false, false, null, 90),
  ('administration', 'Akshata Choudi', 'Head', 'AD-01', '/team-photos/ad_01.webp', true, false, null, 10),
  ('administration', 'Rifa Anjum', 'Member', 'AD-02', '/team-photos/ad_02.webp', false, false, null, 20),
  ('administration', 'LD Sai Charan', 'Member', 'AD-03', '/team-photos/ad_03.webp', false, false, '50% 18%', 30),
  ('administration', 'Abhinav Deo', 'Member', 'AD-04', '/team-photos/ad_04.webp', false, false, null, 40),
  ('administration', 'Karthik S Rao', 'Member', 'AD-05', '/team-photos/ad_05.webp', false, false, null, 50),
  ('administration', 'Keerthana Bhat', 'Member', 'AD-06', '/team-photos/ad_06.webp', false, false, null, 60),
  ('administration', 'D Ganesh', 'Member', 'AD-07', '/team-photos/ad_07.webp', false, false, null, 70),
  ('administration', 'Raksha P', 'Member', 'AD-08', '/team-photos/ad_08.webp', false, false, null, 80),
  ('design', 'Maaz', 'Head', 'DS-01', '/team-photos/ds_01.webp', true, false, null, 10),
  ('design', 'Vaibhavi', 'Head', 'DS-02', '/team-photos/ds_02.webp', true, false, null, 20),
  ('design', 'Kulsum', 'Lead', 'DS-03', '/team-photos/ds_03.webp', false, false, null, 30),
  ('design', 'Dheshna M', 'Co Lead', 'DS-04', '/team-photos/ds_04.webp', false, false, null, 40),
  ('design', 'Melisha Dsouza', 'Member', 'DS-05', '/team-photos/ds_05.webp', false, false, null, 50),
  ('design', 'Swasti Jain', 'Member', 'DS-07', '/team-photos/ds_07.webp', false, false, null, 60),
  ('design', 'Shanmukhi Vytlaa', 'Member', 'DS-08', '/team-photos/ds_08.webp', false, false, null, 70),
  ('design', 'Adhya', 'Member', 'DS-09', '/team-photos/ds_09.webp', false, false, null, 80),
  ('design', 'Arpita Thakur', 'Member', 'DS-10', '/team-photos/ds_10.webp', false, false, null, 90),
  ('events', 'Haseena Tawfeeqa', 'Head', 'EV-01', '/team-photos/ev_01.webp', true, false, null, 10),
  ('events', 'Raksha Jagadeesha', 'Member', 'EV-02', '/team-photos/ev_02.webp', false, false, null, 20),
  ('events', 'Soham N Jain', 'Member', 'EV-03', '/team-photos/ev_03.webp', false, false, null, 30),
  ('events', 'Shreyas S Patil', 'Member', 'EV-04', '/team-photos/ev_04.webp', false, false, null, 40),
  ('events', 'Keerthana', 'Member', 'EV-05', '/team-photos/ev_05.webp', false, false, null, 50),
  ('events', 'Anya Miryam Camoens', 'Member', 'EV-06', '/team-photos/ev_06.webp', false, false, null, 60),
  ('events', 'M Hemanth Reddy', 'Member', 'EV-07', '/team-photos/ev_07.webp', false, false, null, 70),
  ('events', 'V Jayanth', 'Member', 'EV-08', '/team-photos/ev_08.webp', false, false, null, 80),
  ('hospitality', 'Deepthi M', 'Head', 'HS-01', '/team-photos/hs_01.webp', true, false, null, 10),
  ('hospitality', 'Akshay', 'Member', 'HS-02', '/team-photos/hs_02.webp', false, false, null, 20),
  ('hospitality', 'Harshith D Raj', 'Member', 'HS-03', '/team-photos/hs_03.webp', false, false, null, 30),
  ('marketing-and-sponsorship', 'Kotresh', 'Head', 'MK-01', '/team-photos/mk_01.webp', true, false, null, 10),
  ('marketing-and-sponsorship', 'Zainaba', 'Lead', 'MK-02', '/team-photos/mk_02.webp', false, false, null, 20),
  ('marketing-and-sponsorship', 'Rishiman Dadwal', 'Member', 'MK-03', '/team-photos/mk_03.webp', false, false, null, 30),
  ('marketing-and-sponsorship', 'T Lokeshwar Reddy', 'Member', 'MK-04', '/team-photos/mk_04.webp', false, false, null, 40),
  ('marketing-and-sponsorship', 'Varsha Sanjay', 'Member', 'MK-05', '/team-photos/mk_05.webp', false, false, null, 50),
  ('marketing-and-sponsorship', 'Baibhav Kumar', 'Member', 'MK-06', '/team-photos/mk_06.webp', false, false, null, 60),
  ('marketing-and-sponsorship', 'Ankit', 'Member', 'MK-07', '/team-photos/mk_07.webp', false, false, null, 70),
  ('marketing-and-sponsorship', 'Veeksha Reddy', 'Member', 'MK-08', '/team-photos/mk_08.webp', false, false, null, 80),
  ('operations', 'Vaibhavi L', 'Head', 'OP-01', '/team-photos/op_01.webp', true, false, null, 10),
  ('operations', 'Sanjana N', 'Member', 'OP-03', '/team-photos/op_03.webp', false, false, null, 20),
  ('operations', 'Mohammed Sohail Hussain', 'Member', 'OP-05', '/team-photos/op_05.webp', false, false, null, 30),
  ('operations', 'Manas Reddy', 'Member', 'OP-06', '/team-photos/op_06.webp', false, false, null, 40),
  ('operations', 'Aditi', 'Member', 'OP-07', '/team-photos/op_07.webp', false, false, null, 50),
  ('operations', 'Ritik Kumar Tiwary', 'Member', 'OP-08', '/team-photos/op_08.webp', false, false, null, 60),
  ('operations', 'Melba', 'Member', 'OP-09', null, false, false, null, 70),
  ('rnd', 'Hari Narayan', 'Head', 'RD-01', '/team-photos/rd_01.webp', true, false, null, 10),
  ('rnd', 'Dhruvajyoti Malik', 'Member', 'RD-02', '/team-photos/rd_02.webp', false, false, null, 20),
  ('rnd', 'Hana Fathima Ameen', 'Member', 'RD-04', '/team-photos/rd_04.webp', false, false, null, 30),
  ('rnd', 'Neha', 'Member', 'RD-05', '/team-photos/rd_05.webp', false, false, null, 40),
  ('rnd', 'Sharanya', 'Member', 'RD-06', '/team-photos/rd_06.webp', false, false, null, 50),
  ('rnd', 'Nanditha', 'Member', 'RD-07', '/team-photos/rd_07.webp', false, false, null, 60),
  ('rnd', 'Shreeya Attri', 'Member', 'RD-09', '/team-photos/rd_09.webp', false, false, null, 70),
  ('rnd', 'Kunal Kulkarni', 'Member', 'RD-10', '/team-photos/rd_10.webp', false, false, null, 80),
  ('social-media', 'Harshitha S', 'Head', 'SM-01', '/team-photos/sm_01.webp', true, false, null, 10),
  ('social-media', 'Lingala Hasini Reddy', 'Member', 'SM-02', '/team-photos/sm_02.webp', false, false, null, 20),
  ('social-media', 'Haniel J Josephus', 'Member', 'SM-03', '/team-photos/sm_03.webp', false, false, null, 30),
  ('social-media', 'Varun Sharma', 'Member', 'SM-04', '/team-photos/sm_04.webp', false, false, null, 40),
  ('social-media', 'Tejas S Reddy', 'Member', 'SM-05', '/team-photos/sm_05.webp', false, false, null, 50),
  ('social-media', 'Mradul', 'Member', 'SM-06', '/team-photos/sm_06.webp', false, false, null, 60),
  ('social-media', 'Varsha R', 'Member', 'SM-07', '/team-photos/sm_07.webp', false, false, null, 70),
  ('social-media', 'Gayatri', 'Member', 'SM-08', '/team-photos/sm_08.webp', false, false, null, 80)
) as seed(group_id, name, role, code, photo_url, is_head, is_top_leadership, image_position, sort_order)
where not exists (select 1 from public.team_members);
