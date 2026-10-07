-- Vérifie qu'une famille ne voit jamais les données d'une autre.
-- Lancer avec : npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

-- Deux parents, chacun dans sa famille.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'amina@test.fr'),
  ('22222222-2222-2222-2222-222222222222', 'romain@test.fr');

set local role authenticated;

set local request.jwt.claims to '{"sub": "11111111-1111-1111-1111-111111111111"}';
select lives_ok($$ select public.creer_famille('Famille A') $$, 'Amina crée sa famille');
insert into public.enfants (famille_id, prenom, classe)
  select id, 'Léo', 'CE1' from public.familles;

set local request.jwt.claims to '{"sub": "22222222-2222-2222-2222-222222222222"}';
select lives_ok($$ select public.creer_famille('Famille B') $$, 'Romain crée sa famille');
select set_config('test.famille_b', (select id::text from public.familles), true);

select is((select count(*) from public.familles)::int, 1, 'Romain ne voit que sa famille');
select is((select count(*) from public.enfants)::int, 0, 'Romain ne voit pas Léo');
select is((select count(*) from public.membres)::int, 1, 'Romain ne voit que ses membres');

update public.enfants set prenom = 'Pirate';
delete from public.enfants;

select throws_ok(
  $$ insert into public.familles (nom) values ('Fraude') $$,
  '42501', null, 'Création directe de famille refusée'
);

set local request.jwt.claims to '{"sub": "11111111-1111-1111-1111-111111111111"}';
select is((select prenom from public.enfants), 'Léo', 'Léo est intact après les tentatives de Romain');
select throws_ok(
  $$ insert into public.enfants (famille_id, prenom)
     values (current_setting('test.famille_b')::uuid, 'Intrus') $$,
  '42501', null, 'Amina ne peut pas ajouter un enfant chez Romain'
);

select * from finish();
rollback;
