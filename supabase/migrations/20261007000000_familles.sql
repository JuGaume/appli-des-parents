-- Familles, membres (parents) et enfants.
-- Règle d'or : chaque table a la RLS activée et ne montre que les lignes de la famille de l'utilisateur.

create table public.familles (
  id uuid primary key default gen_random_uuid(),
  nom text not null check (char_length(nom) between 1 and 80),
  created_at timestamptz not null default now()
);

create table public.membres (
  famille_id uuid not null references public.familles (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'parent' check (role in ('parent')),
  created_at timestamptz not null default now(),
  primary key (famille_id, user_id)
);

create index membres_user_id_idx on public.membres (user_id);

create table public.enfants (
  id uuid primary key default gen_random_uuid(),
  famille_id uuid not null references public.familles (id) on delete cascade,
  prenom text not null check (char_length(prenom) between 1 and 40),
  annee_naissance smallint check (annee_naissance between 2005 and 2030),
  classe text check (classe in ('creche', 'PS', 'MS', 'GS', 'CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', 'lycee')),
  allergies text[] not null default '{}',
  gouts text check (char_length(gouts) <= 500),
  created_at timestamptz not null default now()
);

create index enfants_famille_id_idx on public.enfants (famille_id);

-- Vrai si l'utilisateur connecté est membre de la famille.
-- security definer : évite que les règles de "membres" se lisent elles-mêmes en boucle.
create function public.est_membre(f uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.membres m
    where m.famille_id = f and m.user_id = (select auth.uid())
  );
$$;

revoke all on function public.est_membre(uuid) from public;
grant execute on function public.est_membre(uuid) to authenticated;

-- Crée une famille et y inscrit l'utilisateur connecté comme parent.
create function public.creer_famille(nom text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  nouvelle_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'connexion requise';
  end if;

  insert into public.familles (nom) values (creer_famille.nom) returning id into nouvelle_id;
  insert into public.membres (famille_id, user_id) values (nouvelle_id, (select auth.uid()));
  return nouvelle_id;
end;
$$;

revoke all on function public.creer_famille(text) from public;
grant execute on function public.creer_famille(text) to authenticated;

alter table public.familles enable row level security;
alter table public.membres enable row level security;
alter table public.enfants enable row level security;

-- familles : on voit, modifie et supprime seulement les siennes ; la création passe par creer_famille().
create policy "familles_lecture" on public.familles
  for select to authenticated using (public.est_membre(id));
create policy "familles_modification" on public.familles
  for update to authenticated using (public.est_membre(id)) with check (public.est_membre(id));
create policy "familles_suppression" on public.familles
  for delete to authenticated using (public.est_membre(id));

-- membres : lecture des membres de sa famille ; les invitations viendront en semaine 3.
create policy "membres_lecture" on public.membres
  for select to authenticated using (public.est_membre(famille_id));

-- enfants : tout est permis, mais seulement dans sa famille.
create policy "enfants_lecture" on public.enfants
  for select to authenticated using (public.est_membre(famille_id));
create policy "enfants_ajout" on public.enfants
  for insert to authenticated with check (public.est_membre(famille_id));
create policy "enfants_modification" on public.enfants
  for update to authenticated using (public.est_membre(famille_id)) with check (public.est_membre(famille_id));
create policy "enfants_suppression" on public.enfants
  for delete to authenticated using (public.est_membre(famille_id));
