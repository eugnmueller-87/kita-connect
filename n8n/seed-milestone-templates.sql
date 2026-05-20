-- ============================================================
-- Kita Connect — Milestone Templates (Referenzwerte)
-- Quellen: Gelbes Heft (U-Untersuchungen G-BA),
--          Berliner Bildungsprogramm, Bayerischer BEP
-- Inhaltliche Anlehnung — keine 1:1-Reproduktion lizenzierter Texte
-- Ausführen in: Supabase Dashboard > SQL Editor
-- Voraussetzung: milestone_categories muss befüllt sein (supabase-schema.sql)
-- ============================================================

-- ----------------------------------------------------------------
-- Sprache & Kommunikation
-- ----------------------------------------------------------------
with cat as (select id from milestone_categories where slug = 'sprache')
insert into milestone_templates (category_id, age_months_min, age_months_max, title, description, source) select
  cat.id, min_m, max_m, title, description, source
from cat, (values
  (6,  9,  'Lautäußerungen & Silbenplappern',
           'Das Kind plappert aktiv mit Silbenfolgen wie "bababa" oder "mamama" und reagiert auf Ansprache.',
           'Gelbes Heft U5/U6'),
  (9,  12, 'Erste Wörter verstehen',
           'Das Kind versteht einfache Worte wie "nein", "tschüss", den eigenen Namen und reagiert darauf.',
           'Gelbes Heft U6'),
  (12, 18, 'Erste Worte sprechen',
           'Das Kind spricht 2–5 einzelne Worte mit Bedeutung (z.B. "Mama", "da", "mehr").',
           'Gelbes Heft U6/U7'),
  (18, 24, 'Wortschatz wächst',
           'Das Kind verfügt über mindestens 20 Wörter und zeigt auf bekannte Dinge wenn man sie nennt.',
           'Gelbes Heft U7'),
  (24, 30, 'Zwei-Wort-Sätze',
           'Das Kind kombiniert zwei Wörter zu einfachen Aussagen ("Auto weg", "Mama komm").',
           'Gelbes Heft U7a'),
  (30, 36, 'Kurze Sätze bilden',
           'Das Kind spricht 3-Wort-Sätze und kann einfache Fragen stellen ("Wo ist?").',
           'Gelbes Heft U7a'),
  (36, 48, 'Erzählen & Fragen',
           'Das Kind erzählt kurze Erlebnisse nach, stellt Warum-Fragen und nutzt Mehrzahlformen.',
           'Berliner Bildungsprogramm'),
  (48, 60, 'Gespräche führen',
           'Das Kind führt zusammenhängende Gespräche, erklärt Dinge und versteht komplexere Anweisungen.',
           'Berliner Bildungsprogramm'),
  (60, 72, 'Vorschulsprachentwicklung',
           'Das Kind spricht in vollständigen Sätzen mit korrekter Grundgrammatik, kann Reime bilden und zeigt Interesse an Schrift.',
           'Gelbes Heft U9')
) as m(min_m, max_m, title, description, source);

-- ----------------------------------------------------------------
-- Motorik & Bewegung
-- ----------------------------------------------------------------
with cat as (select id from milestone_categories where slug = 'motorik')
insert into milestone_templates (category_id, age_months_min, age_months_max, title, description, source) select
  cat.id, min_m, max_m, title, description, source
from cat, (values
  (3,  6,  'Kopfkontrolle',
           'Das Kind hält den Kopf in Bauchlage aufrecht und dreht ihn zur Seite.',
           'Gelbes Heft U4/U5'),
  (6,  9,  'Freies Sitzen',
           'Das Kind sitzt kurzzeitig ohne Unterstützung und dreht sich aus der Rückenlage.',
           'Gelbes Heft U5/U6'),
  (9,  12, 'Krabbeln & Aufstehen',
           'Das Kind krabbelt koordiniert und zieht sich an Möbeln zum Stehen hoch.',
           'Gelbes Heft U6'),
  (12, 15, 'Erste Schritte',
           'Das Kind läuft erste unsichere Schritte mit oder ohne Festhalten.',
           'Gelbes Heft U6'),
  (15, 24, 'Sicher laufen',
           'Das Kind läuft sicher, steigt Treppen mit Festhalten und bückt sich ohne hinzufallen.',
           'Gelbes Heft U7'),
  (24, 36, 'Rennen & Springen',
           'Das Kind rennt, springt beidbeinig und tritt einen Ball gezielt.',
           'Gelbes Heft U7a'),
  (36, 48, 'Einbeinig stehen & Dreirad',
           'Das Kind steht kurz auf einem Bein, fährt Dreirad und klettert sicher.',
           'Gelbes Heft U8'),
  (36, 48, 'Stift halten & Malen',
           'Das Kind hält einen Stift mit Dreipunktgriff und malt Kreise sowie einfache Formen.',
           'Berliner Bildungsprogramm'),
  (48, 60, 'Schere & Feinmotorik',
           'Das Kind schneidet mit einer Schere, knöpft Knöpfe und zieht sich selbständig an.',
           'Gelbes Heft U8/U9'),
  (60, 72, 'Koordination & Balance',
           'Das Kind hüpft auf einem Bein, fängt einen Ball und fährt Fahrrad mit Stützrädern.',
           'Gelbes Heft U9')
) as m(min_m, max_m, title, description, source);

-- ----------------------------------------------------------------
-- Soziales & Emotionales
-- ----------------------------------------------------------------
with cat as (select id from milestone_categories where slug = 'sozial')
insert into milestone_templates (category_id, age_months_min, age_months_max, title, description, source) select
  cat.id, min_m, max_m, title, description, source
from cat, (values
  (2,  4,  'Soziales Lächeln',
           'Das Kind lächelt als Reaktion auf ein freundliches Gesicht und nimmt Blickkontakt auf.',
           'Gelbes Heft U3/U4'),
  (6,  9,  'Fremdeln',
           'Das Kind zeigt Unterschiede in der Reaktion auf vertraute und unbekannte Personen.',
           'Gelbes Heft U5/U6'),
  (9,  12, 'Nachahmung & Zeigegestik',
           'Das Kind ahmt einfache Gesten nach und zeigt auf Gegenstände, die es haben möchte.',
           'Gelbes Heft U6'),
  (12, 18, 'Parallelspiel',
           'Das Kind spielt zufrieden neben anderen Kindern, ohne direkt mit ihnen zu interagieren.',
           'Berliner Bildungsprogramm'),
  (18, 30, 'Trotzphase & Ich-Bewusstsein',
           'Das Kind entwickelt einen starken Eigenwillen, nutzt "Ich" und "Nein" aktiv.',
           'Berliner Bildungsprogramm'),
  (24, 36, 'Gemeinsames Spiel',
           'Das Kind spielt mit anderen Kindern zusammen, tauscht Spielmaterial aus und wartet kurz.',
           'Gelbes Heft U7a'),
  (36, 48, 'Gefühle benennen',
           'Das Kind kann Grundgefühle (froh, traurig, wütend, Angst) benennen und zeigt Empathie.',
           'Berliner Bildungsprogramm'),
  (48, 60, 'Regeln & Fairness',
           'Das Kind versteht und hält sich an einfache Spielregeln und spricht über Fairness.',
           'Gelbes Heft U8'),
  (60, 72, 'Freundschaften',
           'Das Kind pflegt bevorzugte Freundschaften, schlichtet kleine Konflikte und kooperiert in Gruppen.',
           'Gelbes Heft U9')
) as m(min_m, max_m, title, description, source);

-- ----------------------------------------------------------------
-- Kognition & Lernen
-- ----------------------------------------------------------------
with cat as (select id from milestone_categories where slug = 'kognition')
insert into milestone_templates (category_id, age_months_min, age_months_max, title, description, source) select
  cat.id, min_m, max_m, title, description, source
from cat, (values
  (6,  9,  'Objektpermanenz',
           'Das Kind sucht nach einem Gegenstand, der vor seinen Augen versteckt wurde.',
           'Gelbes Heft U5/U6'),
  (9,  12, 'Ursache & Wirkung',
           'Das Kind wiederholt Aktionen gezielt, weil es die Wirkung kennt (z.B. Taste drücken → Geräusch).',
           'Berliner Bildungsprogramm'),
  (12, 18, 'Symbolspiel beginnt',
           'Das Kind spielt einfache So-tun-als-ob-Szenen (z.B. Puppe füttern).',
           'Berliner Bildungsprogramm'),
  (18, 30, 'Formen & Farben',
           'Das Kind kann mindestens 3 Farben benennen und einfache Formen (Kreis, Dreieck) erkennen.',
           'Gelbes Heft U7'),
  (24, 36, 'Rollenspiel',
           'Das Kind übernimmt in Rollenspielen verschiedene Rollen und entwickelt kleine Geschichten.',
           'Berliner Bildungsprogramm'),
  (30, 42, 'Mengenbegriff bis 3',
           'Das Kind versteht und benennt Mengen bis 3 und vergleicht "mehr" und "weniger".',
           'Bayerischer BEP'),
  (36, 48, 'Konzentration & Ausdauer',
           'Das Kind beschäftigt sich 10–15 Minuten konzentriert mit einer selbst gewählten Aufgabe.',
           'Berliner Bildungsprogramm'),
  (48, 60, 'Zählen bis 10',
           'Das Kind zählt sicher bis 10 und versteht den Zusammenhang zwischen Zahlwort und Menge.',
           'Gelbes Heft U8'),
  (48, 60, 'Ursachen & Zusammenhänge erklären',
           'Das Kind erklärt einfache Ursache-Wirkungs-Zusammenhänge und stellt Warum-Fragen gezielt.',
           'Bayerischer BEP'),
  (60, 72, 'Vorschulmathematik',
           'Das Kind versteht Mengen bis 20, kennt Grundformen der Geometrie und löst einfache Denksportaufgaben.',
           'Gelbes Heft U9')
) as m(min_m, max_m, title, description, source);

-- ================================================================
-- Fertig! Milestone Templates befüllt.
-- Eltern können im UI aus diesen Vorlagen wählen oder
-- eigene freie Meilensteine anlegen (template_id = null).
-- ================================================================
