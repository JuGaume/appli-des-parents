-- Vérifie l'isolation des documents, des éléments d'agenda et des fichiers entre familles.
-- Lancer avec : npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(9);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'amina@test.fr'),
  ('22222222-2222-2222-2222-222222222222', 'romain@test.fr');

set local role authenticated;

-- Amina crée sa famille, un document, un élément et un fichier.
set local request.jwt.claims to '{"sub": "11111111-1111-1111-1111-111111111111"}';
select public.creer_famille('Famille A');
select set_config('test.famille_a', (select id::text from public.familles), true);

insert into public.documents (id, famille_id, chemin, nom, type_mime)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_setting('test.famille_a')::uuid,
          current_setting('test.famille_a') || '/a.png', 'a.png', 'image/png');
insert into public.elements (famille_id, document_id, type, titre, date_element)
  values (current_setting('test.famille_a')::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'evenement', 'Sortie musée', '2026-10-16');
select lives_ok(
  format($$ insert into storage.objects (bucket_id, name, owner) values ('documents', %L, auth.uid()) $$,
         current_setting('test.famille_a') || '/a.png'),
  'Amina peut déposer un fichier dans le dossier de sa famille');

select is((select count(*) from public.documents)::int, 1, 'Amina voit son document');

-- Romain, autre famille.
set local request.jwt.claims to '{"sub": "22222222-2222-2222-2222-222222222222"}';
select public.creer_famille('Famille B');
select set_config('test.famille_b', (select id::text from public.familles), true);

select is((select count(*) from public.documents)::int, 0, 'Romain ne voit pas le document d''Amina');
select is((select count(*) from public.elements)::int, 0, 'Romain ne voit pas l''agenda d''Amina');
select is((select count(*) from storage.objects where bucket_id = 'documents')::int, 0, 'Romain ne voit pas les fichiers d''Amina');

select throws_ok(
  format($$ insert into storage.objects (bucket_id, name, owner) values ('documents', %L, auth.uid()) $$,
         current_setting('test.famille_a') || '/intrus.png'),
  '42501', null, 'Romain ne peut pas déposer un fichier chez Amina');
select throws_ok(
  format($$ insert into public.elements (famille_id, type, titre) values (%L, 'tache', 'Intrus') $$,
         current_setting('test.famille_a')),
  '42501', null, 'Romain ne peut pas ajouter un élément chez Amina');

update public.elements set titre = 'Piraté';
delete from public.documents;

set local request.jwt.claims to '{"sub": "11111111-1111-1111-1111-111111111111"}';
select is((select titre from public.elements), 'Sortie musée', 'L''agenda d''Amina est intact');
select is((select count(*) from public.documents)::int, 1, 'Le document d''Amina est intact');

select * from finish();
rollback;
