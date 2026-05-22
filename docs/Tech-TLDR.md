# Kita Connect — Teacher Q&A

*Für Präsentationen und technische Fragen. Kein Fachjargon, direkte Antworten.*

---

## Was ist Kita Connect?

Eine fertige Web-App für Kitas — drei verschiedene Portale in einer Anwendung: für Eltern, Erzieher und die Kita-Leitung. Live unter [app.kita-connect.cloud](https://app.kita-connect.cloud).

---

## Warum dieses Projekt?

Kitas kommunizieren heute per Zettel, WhatsApp-Gruppen und Telefonanrufen. Das ist nicht DSGVO-konform, nicht strukturiert, und kostet Zeit. Kita Connect löst das mit einem geschlossenen, sicheren System — ohne monatliche Lizenzkosten.

---

## Tech Stack — Was wurde womit gebaut?

### Next.js 14 (React)
Das ist die eigentliche Web-App — alles was der Nutzer im Browser sieht. Next.js rendert Seiten teils auf dem Server (schneller, sicherer), teils im Browser (interaktiv). Konkret in diesem Projekt: die drei Portale (Eltern, Erzieher, Admin), alle Formulare, die Navigation.

### Supabase (PostgreSQL)
Die Datenbank — speichert alles: Kindprofile, Beobachtungen, Lerngeschichten, Benachrichtigungen, Einladungen. Supabase gibt außerdem Auth (Login/Logout), Datei-Speicher (Kinderfotos) und Sicherheitsregeln (wer darf was lesen) out of the box. Kein eigener Auth-Server nötig.

### Vercel
Hosting für die Next.js-App. Jedes Mal wenn Code auf GitHub gepusht wird, baut Vercel automatisch eine neue Version und schaltet sie live — in ~60 Sekunden. Keine manuelle Serverkonfiguration.

### n8n (eigener VPS)
Automatisierungs-Tool — vergleichbar mit Zapier, aber selbst gehostet. Konkret: wenn ein Elternteil eingeladen wird, schickt n8n die E-Mail. Wenn ein Ticket erstellt wird, benachrichtigt n8n die Erzieher. Wenn eine Nachricht toxisch ist, blockiert n8n sie. Läuft auf einem eigenen Server in Frankfurt.

### Redpanda (Kafka-kompatibel)
Ein Event-Bus — die App schreibt "Events" (z.B. "Ticket wurde erstellt") in Redpanda, und n8n hört zu und reagiert. Das entkoppelt die App von den Automatisierungen: ein n8n-Fehler bricht nicht den Speicher-Vorgang ab. Standard-Architektur bei größeren Systemen (Kafka), hier in Mini-Version.

### Claude API (Anthropic)
Die KI-Schicht. Drei konkrete Einsätze:
- **FAQ-Bot**: beantwortet Eltern-Fragen auf Basis von Kita-Dokumenten
- **Lerngeschichten**: unterstützt Erzieher beim Schreiben von Entwicklungsberichten
- **Content-Moderation**: prüft Eltern-Nachrichten auf toxische Inhalte bevor sie gespeichert werden

Claude Haiku (kleinstes Modell) wird bevorzugt — kostet ~100x weniger als GPT-4.

### Hostinger VPS (Frankfurt)
Ein eigener Linux-Server (5 €/Monat) auf dem n8n und Redpanda laufen. Wichtig für DSGVO: Daten bleiben in Deutschland. Traefik läuft als Reverse Proxy davor (HTTPS, Routing).

---

## Wie funktioniert die Architektur? (einfach erklärt)

```
Browser (Eltern/Erzieher/Admin)
        ↓
    Next.js App (Vercel)
        ↓
    Supabase (Datenbank + Auth)
        ↓
    Redpanda (Event-Bus)
        ↓
    n8n (Automatisierungen: E-Mails, SMS, Benachrichtigungen)
```

Die App schreibt nicht direkt E-Mails oder SMS — sie schickt ein "Event" (z.B. "Ticket erstellt"), und n8n reagiert darauf. Das ist robuster weil ein Fehler in der Automatisierung die App nicht kaputt macht.

---

## Was kann die App? (Rolle für Rolle)

### Eltern-Portal
- Kindprofil anlegen (Foto, Geburtsdatum, Lieblingsessen etc.)
- Benachrichtigungen lesen (Ausflüge, Krankmeldungen, etc.)
- Speiseplan der Woche einsehen (mit DGE-Ampel für Nährwerte)
- Support-Tickets öffnen ("Kann mein Kind morgen früher abgeholt werden?")
- FAQ-Bot (KI beantwortet häufige Fragen)
- Sprache wechseln: Deutsch, Englisch, Türkisch, Russisch

### Erzieher-Portal
- Alle Kinder der Gruppe sehen
- Beobachtungen dokumentieren (nach Kategorien: Sprache, Motorik, Sozial, Kreativität, Mathe, Selbständigkeit)
- Lerngeschichten schreiben (KI-unterstützt via Claude)
- Nachrichten an Elterngruppen senden (Broadcast)
- Speiseplan verwalten

### Admin-Portal
- Einladungen verschicken (Eltern + Erzieher bekommen einen Link per E-Mail)
- Eltern-Registrierungen genehmigen
- Kitas und Träger verwalten
- Nachrichten an alle senden

---

## Wie kommen Nutzer rein?

Kein offenes "Registrieren"-Formular. Nur wer eine Einladung bekommt, kann sich anmelden. Das verhindert dass Fremde sich einfach als "Elternteil" registrieren.

Ablauf:
1. Admin schickt Einladung (E-Mail-Adresse eingeben, Rolle wählen)
2. n8n schickt automatisch eine E-Mail mit Registrierungslink
3. Empfänger klickt Link, setzt Passwort, ist drin

---

## Was ist mit DSGVO?

- Alle Daten liegen in der EU (Supabase Frankfurt, eigener VPS Frankfurt)
- Kein Google Analytics, kein Facebook-Pixel
- Audit-Log: jede sensible Aktion wird protokolliert (wer hat wann was geändert)
- Account-Löschung: Eltern können ihr Konto selbst löschen, Daten werden nach 90 Tagen bereinigt
- KI-Richtlinie: Claude darf Kinder weder bewerten noch vergleichen (in den System-Prompts erzwungen)
- Content-Moderation: Eltern-Nachrichten werden automatisch geprüft, toxische Inhalte werden blockiert

---

## Was kostet das?

| Dienst | Kosten |
|--------|--------|
| Vercel (Hosting) | ~0 € (Free Tier) |
| Supabase (DB) | ~0 € (Free Tier) |
| n8n + Redpanda (VPS) | ~5–7 €/Monat |
| Claude API (KI) | ~0–2 €/Monat (Haiku ist sehr günstig) |
| **Gesamt** | **~5–9 €/Monat** |

Zum Vergleich: kommerzielle Kita-Software kostet 200–500 €/Monat.

---

## Wo läuft der Code?

- **GitHub:** [eugnmueller-87/kita-connect](https://github.com/eugnmueller-87/kita-connect)
- **Live:** [app.kita-connect.cloud](https://app.kita-connect.cloud)
- Jeder `git push` → Vercel baut automatisch neu und deployt

---

## Was war technisch die größte Herausforderung?

**Row Level Security (RLS) in Supabase.**

Die Datenbank hat eingebaute Sicherheitsregeln: jede Anfrage wird geprüft ob der eingeloggte User das überhaupt lesen/schreiben darf. Das schützt Daten, macht aber Debugging schwierig weil manche Operationen stillschweigend blockiert werden statt einen klaren Fehler zu zeigen.

Lösung: API-Routen mit einem Admin-Key der RLS umgeht — aber nur serverseitig, nie im Browser.

---

## Was würde ich bei einem echten Produkt anders machen?

1. **Schemadesign früher festlegen** — Spalten nachträglich hinzufügen kostet Zeit
2. **Testing** — momentan kein automatisiertes Testing, das wäre Pflicht in Production
3. **Mobile App** — momentan nur Web (responsive), aber eine native App wäre für Eltern besser
4. **Multi-Tenancy von Anfang an** — Träger-Modell kam später, das hätte früher rein gemusst

---

## Test-Accounts für die Demo

| Rolle | E-Mail | Passwort |
|-------|--------|----------|
| Elternteil | parenttest@kita-connect.cloud | abc123 |
| Erzieherin | teachertest@kita-connect.cloud | abc123 |
| Admin | admintest@kita-connect.cloud | abc123 |
