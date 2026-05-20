-- ============================================================
-- Kita Connect — Beobachtungsbögen (eigene Entwicklung)
-- Orientiert an: Berliner Bildungsprogramm, Bayerischer BEP,
--                Gelbes Heft (U-Untersuchungen), DJI-Konzepte
-- KEINE Übernahme lizenzierter Originalformulierungen
--   (SISMIK, SELDAK, PERIK sind Marken von Don Bosco/DJI)
-- Ausführen in: Supabase Dashboard > SQL Editor
-- ============================================================

-- ----------------------------------------------------------------
-- 1. BEOBACHTUNGSBOGEN-TYPEN
--    Eigene Bezeichnungen — keine Markennamen der Originalinstrumente
-- ----------------------------------------------------------------
create table if not exists assessment_templates (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  description text,
  target_age_min_months int,
  target_age_max_months int,
  language_focus boolean default false,  -- true = Sprachbeobachtungsbogen
  created_at  timestamptz default now()
);

create table if not exists assessment_questions (
  id              uuid primary key default gen_random_uuid(),
  template_id     uuid not null references assessment_templates(id) on delete cascade,
  section         text not null,   -- Abschnittsname innerhalb des Bogens
  order_index     int not null,
  question_text   text not null,
  scale_min       int default 1,
  scale_max       int default 4,
  scale_labels    jsonb,           -- z.B. {"1":"selten","2":"manchmal","3":"oft","4":"sehr oft"}
  notes_field     boolean default true
);

alter table assessment_templates enable row level security;
alter table assessment_questions enable row level security;

create policy "Erzieher lesen Bögen"
  on assessment_templates for select
  using (exists (select 1 from profiles where id = auth.uid() and role in ('teacher','admin')));

create policy "Admin verwaltet Bögen"
  on assessment_templates for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Erzieher lesen Fragen"
  on assessment_questions for select
  using (exists (select 1 from profiles where id = auth.uid() and role in ('teacher','admin')));

create policy "Admin verwaltet Fragen"
  on assessment_questions for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ----------------------------------------------------------------
-- 2. BOGEN-TYPEN ANLEGEN
-- ----------------------------------------------------------------
insert into assessment_templates (slug, title, description, target_age_min_months, target_age_max_months, language_focus) values

  ('sprachbeobachtung-mehrsprachig',
   'Sprachbeobachtung — Mehrsprachige Kinder',
   'Beobachtungsbogen zur Sprachentwicklung bei Kindern mit mehrsprachigem Aufwachsen. Erfasst Kompetenzen in Herkunftssprache und Deutsch.',
   42, 72, true),

  ('sprachbeobachtung-einsprachig',
   'Sprachbeobachtung — Einsprachig deutschsprachige Kinder',
   'Beobachtungsbogen zur Sprachentwicklung und Literacy-Erfahrungen bei deutschsprachig aufwachsenden Kindern.',
   48, 72, true),

  ('sozialemotionale-entwicklung',
   'Soziale & emotionale Entwicklung',
   'Beobachtungsbogen zur Resilienz, Selbstregulation und sozialen Kompetenzen im Kita-Alltag.',
   48, 72, false),

  ('motorik-koerper',
   'Motorik & Körperbewusstsein',
   'Beobachtungsbogen zur Grob- und Feinmotorik sowie zur Körperwahrnehmung.',
   24, 72, false)

on conflict (slug) do nothing;

-- ----------------------------------------------------------------
-- 3. FRAGEN — Sprachbeobachtung Mehrsprachig
-- ----------------------------------------------------------------
with t as (select id from assessment_templates where slug = 'sprachbeobachtung-mehrsprachig')
insert into assessment_questions (template_id, section, order_index, question_text, scale_labels) select
  t.id, section, order_index, question_text,
  '{"1":"selten / nie","2":"manchmal","3":"häufig","4":"sehr häufig / immer"}'::jsonb
from t, (values
  ('Sprachgebrauch im Alltag', 1, 'Das Kind nimmt von sich aus Kontakt zu anderen Kindern auf.'),
  ('Sprachgebrauch im Alltag', 2, 'Das Kind beteiligt sich an Gesprächen in der Gruppe.'),
  ('Sprachgebrauch im Alltag', 3, 'Das Kind wechselt situationsangemessen zwischen seinen Sprachen.'),
  ('Sprachgebrauch im Alltag', 4, 'Das Kind nutzt Deutsch, wenn es mit deutschsprachigen Personen spricht.'),
  ('Deutschkenntnisse', 5, 'Das Kind versteht einfache Aufforderungen auf Deutsch.'),
  ('Deutschkenntnisse', 6, 'Das Kind verwendet deutsche Wörter oder kurze Sätze aktiv.'),
  ('Deutschkenntnisse', 7, 'Das Kind kann sich in Alltagssituationen auf Deutsch verständlich machen.'),
  ('Deutschkenntnisse', 8, 'Das Kind stellt Fragen auf Deutsch.'),
  ('Herkunftssprache', 9, 'Das Kind nutzt die Herkunftssprache sicher und ausdrucksstark.'),
  ('Herkunftssprache', 10, 'Das Kind kann Erlebnisse in der Herkunftssprache schildern.'),
  ('Literacy & Bücher', 11, 'Das Kind zeigt Interesse an Büchern und Bilderbüchern.'),
  ('Literacy & Bücher', 12, 'Das Kind erkennt Schriftzeichen oder seinen eigenen Namen.')
) as q(section, order_index, question_text);

-- ----------------------------------------------------------------
-- 4. FRAGEN — Sprachbeobachtung Einsprachig
-- ----------------------------------------------------------------
with t as (select id from assessment_templates where slug = 'sprachbeobachtung-einsprachig')
insert into assessment_questions (template_id, section, order_index, question_text, scale_labels) select
  t.id, section, order_index, question_text,
  '{"1":"selten / nie","2":"manchmal","3":"häufig","4":"sehr häufig / immer"}'::jsonb
from t, (values
  ('Sprachverständnis', 1, 'Das Kind versteht altersgemäße Aufforderungen und Fragen.'),
  ('Sprachverständnis', 2, 'Das Kind folgt kurzen Geschichten oder Erklärungen aufmerksam.'),
  ('Aktiver Wortschatz', 3, 'Das Kind verwendet einen vielfältigen Wortschatz im Alltag.'),
  ('Aktiver Wortschatz', 4, 'Das Kind kann Gegenstände, Farben und Formen benennen.'),
  ('Grammatik & Satzbildung', 5, 'Das Kind bildet vollständige Sätze mit korrekter Grundstruktur.'),
  ('Grammatik & Satzbildung', 6, 'Das Kind verwendet Zeitformen situationsangemessen.'),
  ('Erzählen & Berichten', 7, 'Das Kind erzählt Erlebnisse zusammenhängend nach.'),
  ('Erzählen & Berichten', 8, 'Das Kind stellt Fragen und zeigt Gesprächsinteresse.'),
  ('Literacy', 9, 'Das Kind zeigt Interesse an Büchern und lässt sich vorlesen.'),
  ('Literacy', 10, 'Das Kind erkennt einzelne Buchstaben oder seinen Namen in Schrift.'),
  ('Literacy', 11, 'Das Kind versucht selbst zu "schreiben" oder Zeichen nachzumalen.')
) as q(section, order_index, question_text);

-- ----------------------------------------------------------------
-- 5. FRAGEN — Soziale & Emotionale Entwicklung
-- ----------------------------------------------------------------
with t as (select id from assessment_templates where slug = 'sozialemotionale-entwicklung')
insert into assessment_questions (template_id, section, order_index, question_text, scale_labels) select
  t.id, section, order_index, question_text,
  '{"1":"selten / nie","2":"manchmal","3":"häufig","4":"sehr häufig / immer"}'::jsonb
from t, (values
  ('Selbstregulation', 1, 'Das Kind kann eigene Gefühle benennen (z.B. traurig, wütend, froh).'),
  ('Selbstregulation', 2, 'Das Kind kann in aufregenden Situationen ruhig bleiben oder sich beruhigen.'),
  ('Selbstregulation', 3, 'Das Kind hält bei Aufgaben durch, auch wenn es schwierig wird.'),
  ('Soziale Kompetenzen', 4, 'Das Kind teilt Spielmaterial mit anderen Kindern.'),
  ('Soziale Kompetenzen', 5, 'Das Kind löst kleinere Konflikte ohne sofortige Erwachsenenhilfe.'),
  ('Soziale Kompetenzen', 6, 'Das Kind zeigt Empathie (tröstet andere, nimmt Rücksicht).'),
  ('Soziale Kompetenzen', 7, 'Das Kind findet Zugang zu Spielgruppen und wird akzeptiert.'),
  ('Resilienz', 8, 'Das Kind erholt sich nach Misserfolgen oder Enttäuschungen angemessen schnell.'),
  ('Resilienz', 9, 'Das Kind probiert neue Dinge aus, auch wenn es unsicher ist.'),
  ('Resilienz', 10, 'Das Kind sucht bei Bedarf angemessen Unterstützung bei Erwachsenen.'),
  ('Selbständigkeit', 11, 'Das Kind zieht sich selbständig an und aus (altersgemäß).'),
  ('Selbständigkeit', 12, 'Das Kind übernimmt kleine Aufgaben im Kita-Alltag (z.B. Tisch decken).')
) as q(section, order_index, question_text);

-- ----------------------------------------------------------------
-- 6. FRAGEN — Motorik & Körperbewusstsein
-- ----------------------------------------------------------------
with t as (select id from assessment_templates where slug = 'motorik-koerper')
insert into assessment_questions (template_id, section, order_index, question_text, scale_labels) select
  t.id, section, order_index, question_text,
  '{"1":"selten / nie","2":"manchmal","3":"häufig","4":"sehr häufig / immer"}'::jsonb
from t, (values
  ('Grobmotorik', 1, 'Das Kind läuft sicher und koordiniert.'),
  ('Grobmotorik', 2, 'Das Kind springt beidbeinig und einbeinig.'),
  ('Grobmotorik', 3, 'Das Kind klettert, balanciert und überwindet Hindernisse sicher.'),
  ('Grobmotorik', 4, 'Das Kind fängt und wirft einen Ball gezielt.'),
  ('Feinmotorik', 5, 'Das Kind hält Stifte und Pinsel mit angemessenem Griff.'),
  ('Feinmotorik', 6, 'Das Kind schneidet mit einer Schere entlang einer Linie.'),
  ('Feinmotorik', 7, 'Das Kind schüttet, gießt und fädelt ohne große Schwierigkeiten.'),
  ('Körperwahrnehmung', 8, 'Das Kind kennt die Körperteile und benennt sie.'),
  ('Körperwahrnehmung', 9, 'Das Kind nimmt Nähe und Distanz zu anderen sensibel wahr.'),
  ('Bewegungsfreude', 10, 'Das Kind bewegt sich gerne und sucht aktiv Bewegungsanlässe.')
) as q(section, order_index, question_text);

-- ================================================================
-- Fertig! Beobachtungsbögen bereit.
-- Tabelle standardized_assessments.answers_json speichert die
-- ausgefüllten Bögen als JSONB: { "q_uuid": score, ... }
-- ================================================================
