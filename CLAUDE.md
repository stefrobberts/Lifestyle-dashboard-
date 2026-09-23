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
* [x] Fase 2: voeding (dagboek, calorieën, recepten, barcode scannen)
* [x] Fase 3: sport (schema's, workout modus, analyses)
* [x] Fase 4: werk (takenlijst, LinkedIn ideeën, notities, Inbox)
* [x] Fase 5: metingen en progressiefoto's
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
* De FAB-tegels voor Workout starten, Gewicht invoeren, Progressiefoto maken, Werktaak toevoegen, LinkedIn idee en Titel toevoegen worden pas functioneel zodra hun module gebouwd is (fase 3–6). Maaltijd loggen is sinds fase 2 wel functioneel.
* Server-push notificaties (herinneringen bij taken) komen in fase 7, samen met service worker en offline-ondersteuning.
* De uitgebreide Instellingen-pagina (doelen, werkcategorieën, export) komt in fase 8.
* Swipe-gebaren zijn nog niet met de hand getest op een echt touchscreen (alleen de tap- en klikvarianten zijn geverifieerd) — controleer dit bij het eerste gebruik op je telefoon.
* Er is nog geen automatische testsuite; correctheid is nu geverifieerd via build/lint plus handmatige/visuele controle.

**Fase 2 (2026-09-20):**

Gebouwd:
* Migratie `0002_voeding.sql`: `products`, `recipes`, `recipe_ingredients`, `food_diary_entries` (RLS overal aan, snapshot-macro's op dagboekregels zodat latere wijzigingen aan een recept het verleden niet aanpassen) en de privé storage bucket `recipe-photos`.
* `lib/nutrition.ts`: pure, testbare macroberekeningen (per hoeveelheid, per portie, dagtotalen, weekgemiddelden). `lib/openFoodFacts.ts`: wrapper rond de publieke Open Food Facts API.
* Voedingsdagboek (`/voeding`): loggen per maaltijd (ontbijt/lunch/diner/snack), swipe-links om te verwijderen, "kopieer van gisteren", dagtotalen tegenover de doelen uit `user_settings`.
* `LogFoodSheet`: zoeken in eigen producten + Open Food Facts, barcode scannen via **@zxing/browser** (nieuwe dependency, werkt ook op iOS Safari), eigen product toevoegen, of een eigen recept kiezen.
* Recepten (`/voeding/recepten`): lijst, detail met automatisch berekende macro's per portie, aanmaken/bewerken met camera-foto (`capture="environment"`) en een ingrediëntenzoeker, favorieten, "log als maaltijd".
* Weekoverzicht (`/voeding/week`): Recharts-staafgrafiek per dag met doellijn, gemiddelden per macro.
* `NutritionCard` op Vandaag vervangt de placeholder-kaart "Voeding" met echte calorieën/eiwit van vandaag. FAB-tegel "Maaltijd loggen" is nu functioneel.
* 3 voorbeeldrecepten (havermout met fruit en noten, kipfilet met rijst en broccoli, Griekse yoghurt met granola) worden automatisch aangemaakt bij het eerste bezoek aan Voeding, met een "Voorbeeldrecepten wissen"-knop in Instellingen.
* Geverifieerd: build en lint slagen, en een volledige doorloop (recept aanmaken via voorbeelddata → loggen als maaltijd → dagboek klopt → Vandaag-kaart klopt → weekgrafiek klopt) is getest via een tijdelijk testaccount in donker en licht thema op 390×844.

Openstaand / bewust uitgesteld:
* Barcode scannen (`BarcodeScanner.tsx`) kon niet automatisch getest worden zonder een echte camera/telefoon — test dit zelf even bij het eerste gebruik.
* Eén Open Food Facts-zoekopdracht is handmatig gecontroleerd; het blijft een externe dienst die af en toe onvolledige voedingswaarden teruggeeft (dan valt de kcal-waarde weg uit de resultaten, zie `mapOffProduct`).
* Er is geen productbeheerscherm (bewerken/verwijderen van eigen producten) — dat kan eventueel later in Instellingen.

**Fase 3 (2026-09-22):**

Gebouwd:
* Migratie `0004_sport.sql`: `exercises`, `workout_schedules`, `schedule_exercises`, `workout_sessions`, `workout_sets` (RLS overal aan), plus `sample_sport_seeded`-vlag op `user_settings`.
* `lib/sport.ts`: geschat 1RM (Epley-formule), PR-detectie, trainingsvolume (totaal en per spiergroep), en de round-robin-logica voor "de workout van vandaag".
* Oefeningenbibliotheek (`/sport/oefeningen`) en schema's (`/sport/schemas`) met een herbruikbare oefeningkiezer (zoeken, sets/reps invullen).
* Workout modus (`/sport/workout/[sessionId]`): groot, één-hands bedienbaar, vorige-keer-invulling per set, swipe/tap om af te vinken, PR-melding als toast, rusttimer die op kloktijd doortelt (blijft correct na ontgrendelen) met +/- 15s en een zelf gegenereerd piepje. **Eigen routegroep `app/(workout)/`** zonder navigatiebalk/snelle actieknop, zodat de modus het hele scherm gebruikt — dat stond eerst nog binnen de gewone app-layout en overlapte daardoor met de FAB.
* Analyses (`/sport/analyses`): progressie per oefening (lijngrafiek geschat 1RM), persoonlijke records, volume per spiergroep deze week, een zelfgebouwde kalender met trainingsdagen (geen nieuwe library).
* `SportCard` op Vandaag vervangt de placeholder en toont/start de workout van vandaag. FAB-tegel "Workout starten" is nu functioneel.
* Voorbeeldschema (Push/Pull/Legs, 22 oefeningen) bij eerste bezoek, wisbaar in Instellingen.
* Geverifieerd: build en lint slagen, en een volledige doorloop (schema's bekijken → workout starten → sets loggen met PR-melding → afronden → rotatie naar het volgende schema → analyses kloppen → Vandaag-kaart klopt) is getest via een tijdelijk testaccount in donker en licht thema op 390×844, inclusief de layoutfix voor de workout modus.

Openstaand / bewust uitgesteld:
* De rusttimer geeft geen geluid/trilling terwijl het scherm op slot staat — dat vereist pushnotificaties (fase 7), zoals vooraf afgestemd.
* Geen ad-hoc workouts zonder schema (workout starten gaat altijd via een schema) — kan later toegevoegd worden als daar behoefte aan is.
* Geen aparte "sets bewerken" na het loggen, alleen verwijderen — bewerken kan altijd nog als los stukje werk.

**Fase 4 (2026-09-22):**

Gebouwd:
* Migratie `0005_werk.sql`: `work_categories`, `work_tasks` (met `parent_task_id` voor subtaken en `recurrence_type` voor herhaling), `linkedin_ideas`, `work_notes` (RLS overal aan), plus `work_categories_seeded`/`sample_work_seeded`-vlaggen op `user_settings` en de privé storage bucket `linkedin-images`. De bestaande `inbox_notes`-tabel uit fase 1 wordt hergebruikt voor de Inbox.
* `lib/work.ts`: `categorizeTaskByDeadline` (vandaag/deze week/later), `isOverdue`, `nextRecurrenceDate` (telt 1/7/30 dagen op bij het afronden van een terugkerende taak).
* Taken (`/werk`): tabs Vandaag/Deze week/Later/Afgerond, `TaskFormSheet` met titel/notitie/deadline/prioriteit/categorie/herhaling en inline subtaken, swipe rechts=afvinken (groen)/links=uitstellen naar morgen (oranje) — verwijderen gaat bewust via het bewerkformulier, niet via swipe. Een terugkerende taak afronden maakt automatisch de volgende aan met de berekende nieuwe deadline.
* LinkedIn-ideeën (`/werk/linkedin`): lijst met statuswissel (idee/concept/gepland/gepubliceerd), aanmaken/bewerken met optionele foto (`capture="environment"`, zelfde patroon als receptfoto's), kopieerknop voor hook+body, zelfgebouwde contentkalender (geen nieuwe library, zelfde stijl als de sport-kalender uit fase 3).
* Notities (`/werk/notities`): doorzoekbare lijst (herbruikbare `SearchInput`), omzetten naar taak of LinkedIn-idee (notitie zelf blijft bestaan na omzetten).
* Inbox (`/werk/inbox`): onverwerkte snelle notities (lange druk op de FAB) met 4 acties per item — omzetten naar Taak/Notitie/LinkedIn-idee of wissen — plus een rode badge met het aantal op de Werk-subnavigatie.
* `WerkCard` op Vandaag vervangt de placeholder en toont het aantal openstaande taken voor vandaag (incl. te laat) met de hoogste prioriteit. FAB-tegels "Werktaak toevoegen" en "LinkedIn idee" zijn nu functioneel (compacte bottom sheet met alleen een titel/onderwerp-veld, rest is later aan te vullen in Werk zelf).
* Werkcategorieën (Klantwerk, Eigen bedrijf, Persoonlijk) en een paar voorbeelden (taken, één LinkedIn-idee, één notitie) worden automatisch aangemaakt bij het eerste bezoek, wisbaar in Instellingen.
* **Bug gevonden en opgelost tijdens testen**: de voorbeeldtaken kwamen niet aan door `PGRST102: All object keys must match` — PostgREST accepteert alleen bulk-inserts (`.insert([...])`) waarbij elk object exact dezelfde sleutels heeft, en omdat de fout niet gelogd werd (geen destructuring van `{ error }`) bleef dit onopgemerkt tot handmatig testen. Opgelost door elk taak-object expliciet alle velden te geven (ook `null`) en door voortaan overal `{ error }` uit seed-inserts te loggen. **Let hierop bij elke toekomstige seed-functie met een bulk-insert.**
* Geverifieerd: build en lint slagen, en een volledige doorloop is getest via een tijdelijk testaccount in donker en licht thema op 390×844: taak aanmaken met deadline/prioriteit/categorie in de juiste tab, swipe rechts/links, een terugkerende taak afronden en de volgende met +7 dagen zien verschijnen in Later, subtaken, LinkedIn-idee met status, notitie, beide FAB-sneltoetsen (Werktaak/LinkedIn), de volledige Inbox-flow (snelle notitie via lang indrukken → verschijnt in Inbox met badge → omzetten naar taak → Inbox weer leeg met nette lege staat, en apart nog wissen getest), en de Vandaag-kaart.

Openstaand / bewust uitgesteld:
* Geen productie-testsuite voor de seed-functies die het PGRST102-probleem zou hebben opgevangen — correctheid blijft voorlopig afhankelijk van build/lint plus handmatige/visuele controle, zoals in eerdere fases.
* Server-push notificaties bij taakdeadlines komen zoals gepland in fase 7.

**Fase 5 (2026-09-23):**

Gebouwd:
* Migratie `0006_metingen.sql`: `body_measurements` (één rij per dag, uniek per `user_id`+`measured_at` zodat nogmaals loggen op dezelfde dag een update is i.p.v. een dubbele rij — gewicht, vetpercentage, taille/borst/heupen/bovenarm, notitie, allemaal optioneel) en `progress_photos` (datum, foto-pad, automatisch overgenomen gewicht-snapshot van diezelfde dag als die meting bestaat). RLS overal aan, plus de privé storage bucket `progress-photos` en een `sample_measurements_seeded`-vlag op `user_settings`.
* `lib/measurements.ts`: `calculateTrendLine` (lineaire regressie/kleinste-kwadraten) en `measurementDelta`.
* Overzicht (`/meer/metingen`): tegels voor het laatste gewicht (met verschil t.o.v. de vorige meting) en vetpercentage, een grafiek met metric-selector (gewicht/vetpercentage/taille/borst/heupen/bovenarm) en periodeselector (30 dagen/90 dagen/1 jaar/alles) met een gestippelde trendlijn naast de echte meetpunten, een meetformulier (bottom sheet, alle velden optioneel behalve de datum) en een geschiedenislijst met veeg-links-verwijderen.
* Foto's (`/meer/metingen/fotos`): galerij met camera-opname (zelfde patroon als receptfoto's), tik op 2 foto's om te selecteren en te vergelijken, lang indrukken om te verwijderen. De vergelijkingsweergave (`PhotoCompareView`) heeft twee modi: **Schuif** (sleep een verticale lijn om de oudere foto meer of minder te onthullen, met Framer Motion `onPan`) en **Overlay** (de oudere foto als transparante laag over de nieuwere, met een schuifregelaar voor de dekking) — beide zelfgebouwd, geen nieuwe library.
* `WeightCard` op Vandaag vervangt de placeholder-kaart "Gewichtsverloop": laatste gewicht, verschil t.o.v. de vorige meting, en een kleine sparkline (Recharts zonder assen) van de laatste 30 dagen.
* FAB-tegels "Gewicht invoeren" (compacte sheet, alleen een gewichtsveld, upsert op vandaag) en "Progressiefoto maken" (opent direct de camera via een verborgen file-input, uploadt meteen na het maken van de foto met een toast "Foto opgeslagen" — geen tussenscherm) zijn nu functioneel.
* Een paar voorbeeldmetingen verspreid over de laatste maand (aflopend gewicht zodat de trendlijn meteen iets laat zien) worden automatisch aangemaakt bij het eerste bezoek, wisbaar in Instellingen. Geen voorbeeldfoto's, zoals afgesproken.
* **Bug gevonden en opgelost tijdens testen**: de Y-as van de grafiek toonde overlappende/afgeknipte cijfers (te veel ticks in een smalle grafiek, en het eerste cijfer viel deels buiten de linkerrand). Opgelost met een vaste `tickCount`, een `tickFormatter` met de nl-NL-komma, en een minder negatieve linkermarge.
* **Bug gevonden en opgelost tijdens testen**: in de foto-vergelijkingsweergave overlapten de datum/gewicht-labels van beide foto's elkaar volledig (geen van beide had een linker/rechter positie, dus beide vielen op dezelfde plek en alleen de bovenste was zichtbaar). Opgelost door de oudste foto's label links en de nieuwste rechts te verankeren.
* Geverifieerd: build en lint slagen, en een volledige doorloop is getest via een tijdelijk testaccount in donker en licht thema op 390×844: meting invoeren met alle velden, nogmaals loggen op dezelfde dag bevestigd als update (geen dubbele rij), verwijderen (via het bewerkformulier — swipe-gebaren op de rij zelf zijn met synthetische muisevents niet betrouwbaar te simuleren, zelfde bekende beperking als in eerdere fases), metric- en periodeselector, trendlijn, foto toevoegen en de galerij, beide vergelijkingsmodi (Schuif en Overlay) met echte testfoto's, lang indrukken om een foto te verwijderen, beide FAB-sneltoetsen (inclusief het automatisch meenemen van het gewicht van vandaag in een nieuwe foto), de Vandaag-kaart met sparkline, en de wisknop voor voorbeeldmetingen in Instellingen.

Openstaand / bewust uitgesteld:
* Swipe-gebaren op de metingenrij en de fotogalerij zijn nog niet met de hand getest op een echt touchscreen (alleen de tap-/klikvarianten en de knoppen in de bewerksheet zijn geverifieerd) — controleer dit bij het eerste gebruik op je telefoon, zoals bij eerdere fases.
* Geen streefgewicht/doel in deze fase — dat hoort bij de uitgebreide Instellingen-pagina uit fase 8 en stond niet in de Fase 5-omschrijving.
* Server-push notificaties komen zoals gepland in fase 7.

## Ideeën voor later

Niet bouwen tenzij ik erom vraag. Alleen bewaren.

* Koppeling met Apple Gezondheid voor stappen en slaap
* Weekoverzicht op zondag met voortgang van de week
* Receptsuggesties via de Claude API op basis van resterende macro's en mijn eigen recepten
* Widgets op het beginscherm
