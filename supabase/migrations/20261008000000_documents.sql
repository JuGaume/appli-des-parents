-- Documents envoyés par les parents (photos, PDF) et ce que l'IA en a tiré.
-- Rien n'entre dans l'agenda sans confirmation : les éléments naissent "propose".

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  famille_id uuid not null references public.familles (id) on delete cascade,
  auteur_id uuid default auth.uid() references auth.users (id) on delete set null,
  chemin text not null,
  nom text not null check (char_length(nom) <= 200),
  type_mime text not null check (type_mime in ('image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf')),
  statut text not null default 'en_attente' check (statut in ('en_attente', 'traite', 'erreur')),
  resume text,
  created_at timestamptz not null default now()
);

create index documents_famille_id_idx on public.documents (famille_id, created_at desc);

create table public.elements (
  id uuid primary key default gen_random_uuid(),
  famille_id uuid not null references public.familles (id) on delete cascade,
  document_id uuid references public.documents (id) on delete cascade,
  type text not null check (type in ('evenement', 'tache')),
  titre text not null check (char_length(titre) between 1 and 200),
  date_element date,
  heure_debut time,
  heure_fin time,
  a_preparer text[] not null default '{}',
  enfant_id uuid references public.enfants (id) on delete set null,
  certitude text not null default 'moyenne' check (certitude in ('haute', 'moyenne', 'faible')),
  statut text not null default 'propose' check (statut in ('propose', 'confirme', 'ignore')),
  created_at timestamptz not null default now()
);

create index elements_famille_id_idx on public.elements (famille_id, date_element);
create index elements_document_id_idx on public.elements (document_id);

alter table public.documents enable row level security;
alter table public.elements enable row level security;

create policy "documents_lecture" on public.documents
  for select to authenticated using (public.est_membre(famille_id));
create policy "documents_ajout" on public.documents
  for insert to authenticated with check (public.est_membre(famille_id));
create policy "documents_modification" on public.documents
  for update to authenticated using (public.est_membre(famille_id)) with check (public.est_membre(famille_id));
create policy "documents_suppression" on public.documents
  for delete to authenticated using (public.est_membre(famille_id));

create policy "elements_lecture" on public.elements
  for select to authenticated using (public.est_membre(famille_id));
create policy "elements_ajout" on public.elements
  for insert to authenticated with check (public.est_membre(famille_id));
create policy "elements_modification" on public.elements
  for update to authenticated using (public.est_membre(famille_id)) with check (public.est_membre(famille_id));
create policy "elements_suppression" on public.elements
  for delete to authenticated using (public.est_membre(famille_id));

-- Stockage privé : un dossier par famille, "<famille_id>/<fichier>".
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'])
on conflict (id) do nothing;

-- Renvoie l'identifiant de famille contenu dans un chemin, ou null si le chemin est invalide.
create function public.famille_du_chemin(chemin text)
returns uuid
language sql
immutable
set search_path = ''
as $$
  select case
    when split_part(chemin, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then split_part(chemin, '/', 1)::uuid
  end;
$$;

create policy "documents_fichiers_lecture" on storage.objects
  for select to authenticated
  using (bucket_id = 'documents' and public.est_membre(public.famille_du_chemin(name)));
create policy "documents_fichiers_ajout" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'documents' and public.est_membre(public.famille_du_chemin(name)));
create policy "documents_fichiers_suppression" on storage.objects
  for delete to authenticated
  using (bucket_id = 'documents' and public.est_membre(public.famille_du_chemin(name)));
