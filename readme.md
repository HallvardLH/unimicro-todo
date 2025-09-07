# Todo app
## Prosjektoversikt
Dette prosjektet er en gjøremålsapp, som lar brukeren lage nye, redigere eksisterende, slette og sjekke av gjøremål. Med andre ord støtter appen CRUD (opprett, les, oppdater og slett). Appen lar også brukeren sortere gjøremålene etter ulike kriterier.

Jeg valgte å utvikle en fullstack-løsning, med en front-end i React/TypeScript og back-end i ASP.NET Core Backend med en SQL databse for persistence.

## Kjøring av prosjektet


## Stack
* Front-end: React, TypeScript, Tailwind CSS, ShadCN UI, Tanstack Query
* Back-end: ASP.NET Core, C#, Entity Framework Core
* Database: SQL server som kjøres i Docker

### Hvorfor denne stacken?
Jeg valgte denne stacken fordi det er en moderne stack som passer godt til fullstack-utvikling. React er et rammeverk jeg har mye erfaring med, og tilrettelegger for rask utvikling med en fin og rask UI.

ASP.NET Core er et bra rammeverk for å raskt sette opp en fungerende API. Selv om jeg ikke hadde særlig erfaring med C# fra før av, var oppgavens begrensede omfang en perfekt måte å sette seg inn i C# og .NET.


## Funksjoner
### CRUD-funksjonalitet
* Lag nye gjøremål med valgfrie tags og tidsfrist
* Hent liste over gjøremål og filrer
* Oppdater eksisterende gjøremål, både ved complete/incomplete og tittel, tidsfrist og tags
* Slett ett gjøremål

### Søk og filtrer
* Søk etter tittel og tags
* Filtrer ferdige, uferdige, og forsinkede oppgaver

### Sortering
* Sorter gjøremål etter opprettingsdato, tidsfrist eller tittel (alfabetisk)
* Stigende eller synkende rekkefølge

### Persistens
* Backend-API beholder data i en SQL database via EF Core

### Brukervennlig og estetisk UX
* Bruker hovedsaklig standard stil fra ShadCN, i tillegg til farger fra Unimicros egen styleguide

### Andre funksjoner
* Logging av API via ASP.NET Core ILogger
* Håndtering av feil (error) og validering av inputs

## Currently missing
* Sorting
* Testing
* Overdue sort does not work

## API-endepunkter

Metode | Endepunkt | Beskrivelse | Info 
--- | --- | --- | --- 
GET | /api/todo | Hent alle gjøremål | Støtter `searchTerm`, `completed`, `overdue`, paginering og sortering 
GET | /api/todo/{id} | Hent ett gjøremål basert på ID | Returnerer 404 hvis oppgaven ikke finnes 
POST | /api/todo | Opprett et nytt gjøremål | `Title` er påkrevd, maks 140 tegn. Kan inkludere `DueDate` og `Tags` 
PUT | /api/todo/{id} | Oppdater et gjøremål basert på ID | Returnerer 404 hvis oppgaven ikke finnes 
DELETE | /api/todo/{id} | Slett et gjøremål basert på ID | Returnerer 404 hvis oppgaven ikke finnes 

## Begrensninger og veien videre
Siden dette er en oppgave med et avgrenset scope, mangler prosjektet visse viktige funksjoner som ville vært nødvendige å implementere før prosjektet kunne settes ut i produksjon. For eksempel:

### Autentisering og autorisasjon
Akkurat nå har prosjektet ingen form for autentisering. Alle brukere vil se den samme listen, dersom de kobles til den samme databasen (i demoen brukes en lokal database, så dette ville ikke skjedd i praksis).  

I et reelt prosjekt burde hver bruker ha sin egen oppgaveliste. Dette kunne løses med OAuth 2.0 eller OpenID Connect, der brukere logger inn med f.eks. Microsoft, Google eller en egen konto.  

#### Hvordan databasen burde vært lagt opp:
* En ny tabell `Users` med felt som `UserId`, `Email`, `Name` osv.
* `TodoTask`-tabellen får en fremmednøkkel `UserId` som peker til brukeren som eier oppgaven.
* Alle spørringer (GET, POST, PUT, DELETE) filtreres på den innloggede brukerens `UserId` slik at brukere bare kan se og endre sine egne data.  

#### Dette ville også åpne opp for videre funksjonalitet som:
* Deling av lister mellom brukere (mange-til-mange-relasjon mellom `Users` og `TodoTask`).
* Rettighetsstyring (f.eks. eier kan redigere, andre kan bare lese).
* Personlig tagging og sortering uavhengig av andres data.



