# CLAUDE.md

Dit bestand bevat de vaste afspraken voor dit project. Lees het aan het begin van elke sessie en houd je er altijd aan. Werk de sectie "Voortgang" bij aan het einde van elke fase.

## Project

Een persoonlijk lifestyle dashboard als PWA, uitsluitend bedoeld voor gebruik op mijn telefoon. Ik beheer hierin mijn dagelijkse routines, voeding, sport, lichaamsmetingen, werk, entertainment en persoonlijke verzorging. Er is maar één gebruiker: ik.

## Taal

* Alle tekst die ik als gebruiker zie is Nederlands: menu's, knoppen, labels, meldingen, foutmeldingen, lege staten, notificaties en voorbeelddata.
* Code, variabelen, bestandsnamen en databasekolommen zijn Engels.
* Datums en getallen altijd via Intl met locale "nl": "ma 21 sep", "82,5 kg", "1.850 kcal".
* Week begint op maandag. Eenheden zijn kg en cm.
* Gebruik een informele toon (je en jij), kort en vriendelijk.
* Zet alle teksten niet los verspreid in componenten maar houd ze consistent. Controleer na elke fase of er nergens Engelse tekst in de interface staat.

## Tech stack

* Next.js (App Router) met TypeScript in strict mode
* Tailwind CSS met shadcn/ui componenten
* Recharts voor grafieken
* Framer Motion voor animaties en gebaren
* Supabase voor database, login via e-mail en wachtwoord en opslag van foto's
* Zod voor validatie van alle formulieren en server acties
* PWA met manifest, app icoon, splash screen, snelkoppelingen en pushnotificaties
* Hosting op Vercel, code op GitHub

Voeg geen nieuwe libraries toe zonder dit eerst aan mij voor te stellen met een korte reden.

## Commando's

* Ontwikkelen: npm run dev
* Bouwen: npm run build
* Lint: npm run lint
* Draai npm run build en npm run lint voordat je een fase als klaar meldt.

## Mappenstructuur

* app/ bevat de routes, één map per module: vandaag, voeding, sport, werk, meer (met daaronder metingen, entertainment, verzorging, instellingen)
* components/ui/ bevat de shadcn/ui basiscomponenten
* components/ bevat per module een eigen map met herbruikbare onderdelen
* lib/ bevat de Supabase client, helpers, formattering en berekeningen (zoals 1RM en macro's)
* lib/validations/ bevat de Zod schema's
* types/ bevat gedeelde TypeScript types
* supabase/ bevat migraties en seed data

Componenten in PascalCase, helpers en hooks in camelCase. Houd bestanden klein en gefocust.

## Design system

Stijl: modern, rustig en premium, in de geest van Linear, Arc en Apple Fitness. Veel witruimte, geen drukke schermen.

Kleuren donker thema (standaard):
* Achtergrond: #0B0D12
* Kaart: #151821
* Rand: #232734
* Tekst: #F3F4F7
* Tekst gedempt: #8A90A2
* Accent: #7C5CFF (elektrisch violet)
* Succes en voltooid: #3DDC97 (mint)
* Waarschuwing: #FFB547 (warm oranje)
* Gemist of te laat: #FF6B6B (koraal)

Kleuren licht thema:
* Achtergrond: #F7F7FA
* Kaart: #FFFFFF
* Rand: #E6E7EC
* Tekst: #0B0D12
* Tekst gedempt: #6B7080
* Accentkleuren blijven gelijk

Leg alle kleuren vast als CSS variabelen en Tailwind tokens. Gebruik nooit losse hex waarden in componenten.

Typografie:
* Koppen: Plus Jakarta Sans
* Bodytekst: Inter
* Laad fonts via next/font
* Statistieken en cijfers groot en duidelijk, met tabular numbers zodat cijfers niet verspringen

Vormen en beweging:
* Kaarten met afronding van 16px, knoppen 12px
* Zachte randen in plaats van harde schaduwen
* Subtiele animaties van maximaal 250ms, respecteer de instelling voor minder beweging van het apparaat

## Mobiele regels

* Ontwerp en test altijd in een viewport van 390 x 844. Desktop hoeft alleen netjes te werken.
* Navigatiebalk onderin met 5 tabs: Vandaag, Voeding, Sport, Werk, Meer.
* Houd rekening met de safe areas van iPhone en Android via de safe area insets van CSS env().
* Klikbare elementen minimaal 44 x 44 pixels. Belangrijke acties in de onderste helft van het scherm.
* Formulieren en keuzes altijd in een bottom sheet, nooit in een pop up in het midden.
* Numeriek toetsenbord (inputMode decimal) bij gewichten, calorieën en metingen.
* Gebaren: veeg rechts om af te vinken, veeg links om te verwijderen of uit te stellen, trek omlaag om te verversen.
* Korte trilfeedback bij afvinken waar het apparaat dit ondersteunt.
* Zorg dat invoervelden niet achter het toetsenbord verdwijnen.

## Snelle actieknop

* Ronde zwevende knop (+) rechtsonder, boven de navigatiebalk, op elke pagina zichtbaar.
* Tik opent een bottom sheet met tegels: Maaltijd loggen, Workout starten, Gewicht invoeren, Progressiefoto maken, Werktaak toevoegen, LinkedIn idee, Notitie, Titel toevoegen.
* Contextbewust: de actie die past bij de huidige pagina staat bovenaan.
* Lang indrukken opent direct een snelle notitie die in de Inbox van Werk terechtkomt.
* Elke snelle actie is binnen 2 tikken klaar.

## Modules

1. Vandaag: dagelijkse checklist (supplementen, verzorging, eigen taken) met streaks, plus kaarten voor voeding, sport, werk, verzorging en gewichtsverloop. Kaarten zijn te sorteren en te verbergen.
2. Voeding: recepten, voedingsdagboek met calorieën en macro's, Open Food Facts zoeken en barcode scannen, favorieten, kopieer van gisteren, weekoverzicht.
3. Sport: schema's, oefeningenbibliotheek, workout modus voor gebruik met één hand, rusttimer, analyses (progressie, geschat 1RM, persoonlijke records, volume, kalender).
4. Werk: takenlijst (Vandaag, Deze week, Later, Afgerond, subtaken, terugkerend), LinkedIn ideeën met status en contentkalender, notities, Inbox.
5. Metingen: gewicht, vetpercentage, omtrekken, progressiefoto's met vergelijkingsweergave en overlay, grafieken met trendlijn.
6. Entertainment: series, films, boeken, podcasts met status, beoordeling en notitie, zoeken via TMDB en Open Library, deelbare lijst "Mijn tips".
7. Verzorging: terugkerende afspraken met interval (nagels 14 dagen, kapper 21 dagen, scheren instelbaar), dagteller, kleur op basis van urgentie, pushnotificatie.
8. Instellingen: doelen, dagelijkse taken, werkcategorieën, notificaties, thema, data export als JSON of CSV.

## Database en beveiliging

* Tabellen en kolommen in snake_case, in het Engels.
* Elke tabel heeft id (uuid), user_id, created_at en updated_at.
* Row Level Security staat aan op elke tabel, met policies waardoor alleen de eigenaar zijn eigen rijen kan lezen en schrijven. Controleer dit bij elke nieuwe tabel.
* Foto's staan in een privé storage bucket en worden getoond via tijdelijke signed URLs.
* Schemawijzigingen altijd via een migratie in supabase/, nooit handmatig.
* API sleutels en geheimen alleen in .env.local, nooit in de code en nooit in git.

## Codeconventies

* Gebruik server components waar het kan, client components alleen waar interactie nodig is.
* Schrijfacties via server actions, altijd gevalideerd met Zod.
* Optimistic updates bij afvinken en loggen zodat alles direct aanvoelt.
* Skeletons tijdens het laden, nooit een leeg scherm.
* Elke lijst heeft een verzorgde lege staat met uitleg en een actieknop.
* Geen any in TypeScript. Geen uitgeschreven code die niet gebruikt wordt.
* Berekeningen (macro's, 1RM, volgende verzorgingsdatum, streaks) als losse, testbare functies in lib/.

## Werkwijze

* Begin een nieuwe fase altijd in plan mode en laat het plan eerst goedkeuren.
* Bouw in kleine stappen en maak na elke werkende stap een git commit met een duidelijke Nederlandse omschrijving.
* Stel vragen als iets onduidelijk is in plaats van aannames te doen.
* Controleer na elke fase: build slaagt, lint slaagt, geen Engelse teksten in de interface, alles werkt in 390 x 844, donker en licht thema zien er goed uit.
* Werk aan het einde van een fase de sectie "Voortgang" hieronder bij met wat er gebouwd is en wat er nog openstaat.

## Voortgang

* [x] Fase 1: basis, login, design system, navigatiebalk, snelle actieknop, pagina Vandaag met dagelijkse taken
* [ ] Fase 2: voeding (dagboek, calorieën, recepten, barcode scannen)
* [ ] Fase 3: sport (schema's, workout modus, analyses)
* [ ] Fase 4: werk (takenlijst, LinkedIn ideeën, notities, Inbox)
* [ ] Fase 5: metingen en progressiefoto's
* [ ] Fase 6: entertainment en verzorging
* [ ] Fase 7: PWA afwerking, pushnotificaties, export en polish

Notities per fase:
(Claude Code vult dit aan na elke afgeronde fase)

**Fase 1 (2026-09-20):**

Gebouwd:
* Next.js 16 (App Router, Turbopack) + TypeScript strict + Tailwind v4 + shadcn/ui ("base-nova" stijl, gebouwd op Base UI in plaats van Radix — nieuwe major van shadcn/ui).
* Design system in `app/globals.css`: alle kleuren uit dit document als CSS-variabelen, donker als standaard via `next-themes` (met class-strategie), licht als optie. Fonts via `next/font`: Plus Jakarta Sans (`--font-heading`) en Inter (`--font-body`).
* Supabase login via e-mail en wachtwoord (`app/login`), sessiebeheer via `@supabase/ssr` en `proxy.ts` (Next 16's vervanger van `middleware.ts`) die onbeveiligde routes naar `/login` stuurt. **Gewijzigd van de oorspronkelijke magic-link opzet**: Supabase's gratis mailer stuurt maar 2 e-mails per uur en de redirect-URL moest telkens los worden toegestaan, wat voor een app die je alleen op je eigen telefoon gebruikt onnodige frictie gaf. Er is geen openbare registratiepagina — het ene account is via de Supabase Admin API aangemaakt.
* Migratie `supabase/migrations/0001_init.sql`: `daily_task_definitions`, `daily_task_logs`, `dashboard_card_prefs`, `user_settings`, `inbox_notes` — RLS overal aan, eigenaar-only policies, `set_updated_at`-trigger. Toegepast op het gehoste project.
* Navigatiebalk (5 tabs) en contextbewuste snelle actieknop met bottom sheet (8 tegels; alleen "Notitie" is nu functioneel en schrijft naar `inbox_notes`, de rest toont "binnenkort"). Lang indrukken opent direct de notitie. PWA-manifest-snelkoppeling "Taak toevoegen" opent de Vandaag-pagina met het taakformulier meteen open.
* Pagina Vandaag: volledig functionele dagelijkse checklist (supplementen/verzorging/eigen taken) met alle drie frequentietypes, streaks, voortgangsring, swipe rechts=afvinken/links=verwijderen (met bevestiging), trilfeedback, en een taakformulier (bottom sheet) voor toevoegen/bewerken. Standaardchecklist (Vitamine D, Creatine, Eiwitpoeder, Dagcrème, Serum) wordt automatisch aangemaakt bij de eerste keer inloggen.
* Kaarten voor Voeding/Sport/Werk/Verzorging/Gewichtsverloop op Vandaag als nette lege staten (met uitleg welke fase ze vult), sorteerbaar en te verbergen via een "Kaarten aanpassen" bottom sheet (sleep om te herordenen).
* Pagina's Voeding, Sport, Werk en de Meer-submodules bestaan als placeholder met duidelijke "binnenkort"-uitleg. Instellingen heeft nu al een werkende thema-wisselaar en uitlogknop.
* PWA-basis: `app/manifest.ts`, gegenereerde app-iconen (192/512/maskable/apple-touch-icon), thema-kleur, viewport-fit=cover, safe-area utilities.
* Geverifieerd: `npm run build` en `npm run lint` slagen zonder fouten of waarschuwingen. Visueel getest op 390×844 in Chrome headless (donker én licht) voor login, Vandaag (met echte data via een tijdelijk testaccount) en de kaartensectie — geen Engelse tekst, geen horizontale overflow, correcte kleuren en typografie.

Openstaand / bewust uitgesteld:
* De FAB-tegels voor Maaltijd loggen, Workout starten, Gewicht invoeren, Progressiefoto maken, Werktaak toevoegen, LinkedIn idee en Titel toevoegen worden pas functioneel zodra hun module gebouwd is (fase 2–6).
* Server-push notificaties (herinneringen bij taken) komen in fase 7, samen met service worker en offline-ondersteuning.
* De uitgebreide Instellingen-pagina (doelen, werkcategorieën, export) komt in fase 8.
* Swipe-gebaren zijn nog niet met de hand getest op een echt touchscreen (alleen de tap- en klikvarianten zijn geverifieerd) — controleer dit bij het eerste gebruik op je telefoon.
* Er is nog geen automatische testsuite; correctheid is nu geverifieerd via build/lint plus handmatige/visuele controle.

## Ideeën voor later

Niet bouwen tenzij ik erom vraag. Alleen bewaren.

* Koppeling met Apple Gezondheid voor stappen en slaap
* Weekoverzicht op zondag met voortgang van de week
* Receptsuggesties via de Claude API op basis van resterende macro's en mijn eigen recepten
* Widgets op het beginscherm
