# Kita Connect — Compliance & Rechtliche Rahmenbedingungen

Stand: Mai 2026 | Berlin | Zielgruppe: Kitas in Deutschland

---

## 1. DSGVO / Datenschutz-Grundverordnung (EU 2016/679)

### Grundprinzipien (Art. 5 DSGVO)

| Prinzip | Anforderung | Umsetzung in Kita Connect |
|---|---|---|
| Zweckbindung | Daten nur für definierten Zweck nutzen | Eltern-Kind-Erzieher-Kommunikation; keine Weitergabe an Dritte |
| Datensparsamkeit | Nur notwendige Daten erheben | Minimale Pflichtfelder im Schema (name, email, birth_date). Kita Connect verarbeitet personenbezogene Daten — das ist Kernfunktion der App und über Art. 6 Abs. 1b gedeckt. Einzige Ausnahme: Claude-API erhält **nie** echte Namen (Pseudonymisierung). |
| Speicherbegrenzung | Keine unbegrenzte Datenspeicherung | Löschfristen definiert (siehe Abschnitt 6a) |
| Integrität & Vertraulichkeit | Technische Schutzmaßnahmen | RLS auf allen Tabellen, EU-Hosting, verschlüsselte Credentials |
| Rechenschaftspflicht | Nachweisbarkeit der Compliance | Dieses Dokument + Datenschutzerklärung (Phase 4) |

### Betroffenenrechte (Art. 15–22 DSGVO)

| Recht | Inhalt | Status |
|---|---|---|
| Auskunftsrecht (Art. 15) | Eltern können alle gespeicherten Daten einsehen | TODO: Export-Funktion im UI |
| Berichtigungsrecht (Art. 16) | Falsche Daten korrigieren lassen | Teilweise: Eltern können eigenes Profil bearbeiten |
| Löschrecht / Recht auf Vergessenwerden (Art. 17) | Alle Daten auf Anfrage löschen | TODO: Admin-Funktion für vollständige Konto-Löschung |
| Datenübertragbarkeit (Art. 20) | Daten in maschinenlesbarem Format exportieren | TODO: JSON/PDF-Export |
| Widerspruchsrecht (Art. 21) | Verarbeitung widersprechen | TODO: Einwilligungsverwaltung im UI |

### Einwilligungen (Art. 6 & 7 DSGVO)

- **Pflicht:** Explizite Einwilligung vor Datenerhebung (Registrierung)
- **Foto/Video von Kindern:** Separate Einwilligung pro Kind erforderlich — **nicht** durch allgemeine AGB abgedeckt
- **Besondere Kategorien (Art. 9):** Gesundheitsdaten (z.B. Allergien, Behinderungen) erfordern ausdrückliche Einwilligung
- **Widerrufbarkeit:** Einwilligung muss jederzeit widerrufbar sein, ohne Nachteile

### Auftragsverarbeitung (Art. 28 DSGVO)

| Dienstleister | Zweck | AV-Vertrag | Status |
|---|---|---|---|
| Supabase (EU Ireland) | Datenbank, Auth | Supabase DPA verfügbar | TODO: abschließen |
| Vercel (Frankfurt) | Hosting Frontend | Vercel DPA verfügbar | TODO: abschließen |
| n8n (deutsches Unternehmen) | Workflow-Automatisierung | n8n DPA verfügbar | TODO: abschließen |
| seven.io | SMS-Versand | DPA prüfen | TODO |
| Anthropic / Claude | KI-Textgenerierung (Lerngeschichten) | US-Unternehmen — SCCs prüfen | **Kritisch: vor Produktion klären** |

### Pflichtdokumente

- [ ] Datenschutzerklärung (DSGVO-konform, Deutsch + optional Englisch/Russisch)
- [ ] Impressum (§ 5 TMG)
- [ ] Cookie-Hinweis (minimal, da keine Tracker — nur technisch notwendige Cookies)
- [ ] Einwilligungsformular Foto/Video
- [ ] Verarbeitungsverzeichnis (Art. 30 DSGVO) — intern, nicht öffentlich
- [ ] Auftragsverarbeitungsverträge mit allen Dienstleistern

---

## 2. KiTa-spezifische Rechtsgrundlagen (Deutschland)

### SGB VIII — Kinder- und Jugendhilfe

| Paragraph | Inhalt | Relevanz für Kita Connect |
|---|---|---|
| § 8a SGB VIII | Schutzauftrag bei Kindeswohlgefährdung | Plattform darf keine Informationen zurückhalten, die Kindeswohl betreffen |
| § 45 SGB VIII | Erlaubnis zum Betrieb einer Einrichtung | Kita muss zugelassen sein — keine direkte App-Relevanz, aber Kontext |
| § 61–65 SGB VIII | Sozialdatenschutz | Daten im Rahmen der Jugendhilfe unterliegen besonderem Schutz |

### Berliner KiTa-Gesetz (KitaFöG Berlin)

| Regelung | Inhalt | Relevanz |
|---|---|---|
| § 3 KitaFöG | Erziehungspartnerschaft | Eltern-Erzieher-Kommunikation ist gesetzlich verankert — App unterstützt dies |
| § 5 KitaFöG | Dokumentationspflichten | Beobachtungen und Entwicklungsberichte müssen dokumentiert werden |
| § 10 KitaFöG | Datenschutz in Kitas | Kinderdaten unterliegen besonderem Schutz |

> **Hinweis:** Jedes Bundesland hat ein eigenes KiTa-Gesetz. Kita Connect startet in Berlin — bei Expansion Landesrecht der Zielregion prüfen.

### Weitere Bundesländer (bei Skalierung relevant)

| Bundesland | Gesetz |
|---|---|
| Bayern | BayKiBiG (Bayerisches Kinderbildungs- und -betreuungsgesetz) |
| NRW | KiBiz (Kinderbildungsgesetz NRW) |
| Baden-Württemberg | KiTaG BW |
| Hamburg | HmbKibeG |

---

## 3. Bildungsstandards & Assessments

### Deutsche Bildungspläne (nach Bundesland)

| Dokument | Herausgeber | Kategorien | Nutzung in Kita Connect |
|---|---|---|---|
| Berliner Bildungsprogramm | Senatsverwaltung Berlin | Sprache, Bewegung, Soziales, Kunst, Natur, Mathematik | Basis für `observations.category` und `milestone_categories` |
| Bayerischer BEP | Staatsinstitut Bayern | 6 Bildungsbereiche | Quelle für `milestone_templates.source` |
| Orientierungsplan BW | Kultusministerium BW | 6 Entwicklungsfelder | Referenz bei Expansion |

### Standardisierte Beobachtungsinstrumente

| Instrument | Vollname | Zielgruppe | Status in App |
|---|---|---|---|
| SISMIK | Sprachverhalten und Interesse an Sprache bei Migrantenkindern im Kindergarten | Kinder mit Migrationshintergrund, 3,5–6 J. | Schema vorhanden (`standardized_assessments`) |
| SELDAK | Sprachentwicklung und Literacy bei deutschsprachig aufwachsenden Kindern | Deutschsprachige Kinder, 4–6 J. | Schema vorhanden |
| PERIK | Positive Entwicklung und Resilienz im Kindergartenalltag | 4–6 J. | Schema vorhanden |
| Sprachlerntagebuch | Berlin-spezifisches Sprachbeobachtungsinstrument | 2–6 J. | Schema vorhanden |

> **Urheberrecht:** SISMIK, SELDAK, PERIK sind lizenzierte Instrumente (Don Bosco Verlag / DJI). Die Bögen dürfen nicht ohne Lizenz digital reproduziert werden. Kita Connect kann Struktur/Kategorien nutzen, aber keine Original-Fragen abbilden ohne Lizenzvertrag.

### Gelbes Heft (U-Untersuchungen)

- Herausgeber: Gemeinsamer Bundesausschuss (G-BA)
- Altersgruppen: U1 (Geburt) bis U9 (5 Jahre) + J1 (12–14 J.)
- Kategorien: Motorik, Sprache, Sozialverhalten, Kognition
- **Nutzung:** Als Referenz für `milestone_templates` geeignet — keine Lizenzproblematik bei inhaltlicher Anlehnung (keine 1:1-Reproduktion)

---

## 4. KI & Automatisierung (Claude / n8n)

### KI-generierte Inhalte (Lerngeschichten)

| Anforderung | Grundlage | Maßnahme |
|---|---|---|
| Transparenzpflicht | Art. 22 DSGVO, EU AI Act | Eltern/Erzieher müssen wissen, dass Texte KI-generiert sind |
| Keine automatisierten Entscheidungen | Art. 22 DSGVO | KI-Texte sind Entwürfe — finaler Text immer durch Erzieher freigegeben |
| Datenweitergabe an Anthropic | Art. 28 DSGVO | Keine echten Kinderdaten im Prompt — Pseudonymisierung via `ai_pseudonym_map` |
| EU AI Act (ab 2026) | Hochrisikokategorie prüfen | KI in Bildung/Kinderbetreuung kann reguliert sein — rechtliche Einschätzung einholen |

### Pseudonymisierungskonzept (technisch umgesetzt)

**Prinzip:** Jedes Kind erhält beim Anlegen automatisch ein stabiles, lesbares Pseudonym (z.B. `Kind-A1B2`). Dieses wird in der Tabelle `ai_pseudonym_map` gespeichert. Nur das Pseudonym verlässt die EU-Datenbank in Richtung Claude-API — niemals Name, Geburtsdatum oder andere identifizierende Merkmale.

**Ablauf in n8n:**
```
1. Erzieher schreibt Beobachtungstext (mit echtem Namen intern)
2. n8n ruft get_child_pseudonym(child_id) auf → erhält z.B. "Kind-A1B2"
3. Prompt an Claude: "Kind-A1B2 (4 Jahre) hat heute beim Malen..."
4. Claude generiert Lerngeschichte mit Pseudonym
5. Erzieher ersetzt im UI das Pseudonym durch den echten Namen vor dem Speichern
```

**Technische Verankerung:**
- Tabelle `ai_pseudonym_map` — RLS: kein direkter Client-Zugriff, nur `service_role` (n8n/Backend)
- Trigger `child_pseudonym_trigger` — Pseudonym wird automatisch bei jedem neuen Kind generiert
- Funktion `get_child_pseudonym(child_id)` — einziger erlaubter Zugangspunkt für n8n

**Regel:** n8n-Workflows dürfen `children.name` oder `profiles.full_name` niemals direkt in Claude-Prompts einsetzen. Immer über `get_child_pseudonym()` gehen.

### AV-Verträge mit Dienstleistern

Werden abgeschlossen sobald das System produktionsreif ist. Während der Bauphase nicht erforderlich.

| Anbieter | DPA-Status |
|---|---|
| Supabase | TODO vor Launch |
| Vercel | TODO vor Launch |
| n8n | TODO vor Launch |
| seven.io | TODO vor Launch |
| Anthropic | TODO vor Launch + Pseudonymisierung als Hauptschutz |

### SISMIK / SELDAK / PERIK

Keine Lizenz von Don Bosco Verlag / DJI. Kita Connect entwickelt eigene Beobachtungsbögen auf Basis derselben wissenschaftlichen Grundlagen (Kategorien und Konzepte sind nicht urheberrechtlich geschützt, nur konkrete Frageformulierungen). Kitas können Bögen aus der App drucken oder digital nutzen. Bezeichnung in der App: eigene Namen, keine Markennamen der Originalinstrumente.

### n8n-Automatisierungen

- Keine automatisierten Entscheidungen mit Rechtswirkung
- Logs enthalten personenbezogene Daten → Aufbewahrungsfrist und Löschkonzept erforderlich
- Webhook-Endpoints müssen authentifiziert sein (keine offenen Endpoints in Produktion)

---

## 5. Foto- & Mediendaten

| Anforderung | Rechtsgrundlage | Maßnahme |
|---|---|---|
| Einwilligung vor Aufnahme | § 22 KUG, Art. 6 DSGVO | Einwilligungsformular pro Kind, widerrufbar |
| Einwilligung der Erziehungsberechtigten | BGB § 1626 | Beide Erziehungsberechtigte müssen zustimmen (außer bei Alleinsorge) |
| Speicherung nur auf EU-Servern | DSGVO | Supabase Storage (EU Ireland) — kein CDN außerhalb EU |
| Löschpflicht bei Widerruf | Art. 17 DSGVO | Sofortige Löschung aller Medien des Kindes bei Widerruf |
| Nutzung für KI-Training verboten | Vertragliche Pflicht | Fotos dürfen nicht an KI-Dienste weitergegeben werden |

---

## 6. Technische & Organisatorische Maßnahmen (TOMs, Art. 32 DSGVO)

| Maßnahme | Umsetzung | Status |
|---|---|---|
| Verschlüsselung in Übertragung | HTTPS (TLS 1.2+) | ✅ Vercel/Supabase standard |
| Verschlüsselung im Speicher | Supabase encryption at rest | ✅ |
| Zugriffskontrolle | RLS auf allen Tabellen | ✅ |
| Rollenkonzept | parent / teacher / admin | ✅ |
| Authentifizierung | Supabase Auth (JWT) | ✅ |
| Audit-Logging | Tabelle audit_log, Trigger auf children & profiles, write_audit_log() Funktion | ✅ |
| Datensicherung | Supabase Backups | ✅ automatisch |
| Incident-Response-Plan | Bei Datenpanne: 72h Meldepflicht (Art. 33) | TODO: Prozess definieren |
| Löschkonzept | Fristen definiert (siehe Abschnitt 6a) | ✅ |

---

## 6a. Löschkonzept (Art. 5 Abs. 1e & Art. 17 DSGVO)

| Datenkategorie | Tabelle(n) | Löschfrist | Auslöser | Verantwortlich |
|---|---|---|---|---|
| Eltern-Profil & Auth | profiles, auth.users | Sofort auf Anfrage / 30 Tage nach Kita-Austritt | Eltern-Anfrage oder Admin | Admin |
| Kinddaten | children, child_milestones, ai_pseudonym_map | Mit Eltern-Profil (CASCADE) | Konto-Löschung | Automatisch (DB CASCADE) |
| Nachrichten | messages | 2 Jahre nach Erstellung | Cron-Job oder manuell | Admin |
| Tickets | tickets | 2 Jahre nach Schließung | Cron-Job | Admin |
| Beobachtungen | observations | 2 Jahre nach Erstellung | Cron-Job | Admin |
| Lerngeschichten | learning_stories | 2 Jahre nach Erstellung | Cron-Job | Admin |
| Assessments | standardized_assessments | 2 Jahre nach Erstellung | Cron-Job | Admin |
| Notifications | notifications | 90 Tage nach Erstellung | Cron-Job | Admin |
| FAQ Cache | faq_cache | Kein personenbezogener Inhalt — keine Frist | — | — |
| n8n Logs | n8n intern | 30 Tage (n8n Einstellung) | Automatisch in n8n | Admin |
| Pseudonym-Map | ai_pseudonym_map | Mit Kind-Löschung (CASCADE) | Konto-Löschung | Automatisch |

**Technische Umsetzung:**
- DB-CASCADE deckt Kinddaten automatisch ab (bereits im Schema verankert)
- Zeitbasierte Löschung: Supabase Edge Function oder n8n Cron-Workflow (monatlich)
- Konto-Löschung auf Anfrage: Admin-Funktion im Backend (Phase 3)
- Audit-Trail: Löschvorgänge werden im Audit-Log erfasst (siehe B5)

---

## 7. Offene Punkte (Priorität vor Launch)

### Kritisch (Blocker vor Produktion)
- [ ] AV-Verträge mit Supabase, Vercel, n8n, seven.io abschließen
- [ ] Anthropic/Claude: DPA abschließen (Pseudonymisierung als Hauptschutz bereits umgesetzt)
- [ ] Datenschutzerklärung erstellen und im UI einbinden
- [ ] Impressum erstellen
- [ ] Einwilligungsformular Foto/Video erstellen

### Wichtig (vor erstem Piloten)
- [ ] Daten-Export-Funktion für Eltern (Auskunftsrecht Art. 15)
- [ ] Admin-Funktion für vollständige Konto-Löschung
- [ ] Lösch-Cron implementieren (monatlich, zeitbasierte Fristen)
- [ ] EU AI Act Einschätzung: fällt Kita Connect unter Hochrisiko-KI?
- [ ] Verarbeitungsverzeichnis (Art. 30) intern erstellen

### Nice-to-have (spätere Phase)
- [ ] Mehrsprachige Datenschutzerklärung (DE/EN/RU)
- [ ] Zertifizierung prüfen (z.B. BSI IT-Grundschutz, ISO 27001)
- [ ] Datenschutzbeauftragter benennen (ab 20 Mitarbeiter mit Datenzugriff Pflicht)

---

## 8. Quellen & Referenzen

- DSGVO Volltext: https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679
- SGB VIII: https://www.sozialgesetzbuch-sgb.de/sgbviii/1.html
- Berliner KitaFöG: https://gesetze.berlin.de/bsbe/document/jlr-KitaFöGBE2005rahmen
- Berliner Bildungsprogramm: https://www.berlin.de/sen/bjf/service/publikationen/
- SISMIK/SELDAK/PERIK: https://www.dji.de/themen/familie/beobachtungsinstrumente.html
- G-BA Gelbes Heft: https://www.g-ba.de/themen/methodenbewertung/frueherkennung-vorsorge/kinder/
- EU AI Act: https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32024R1689
