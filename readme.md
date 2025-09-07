# Todo app
## Prosjektoversikt
Dette prosjektet er en gjøremålsapp, som lar brukeren lage nye, redigere eksisterende, slette og sjekke av gjøremål. Med andre ord støtter appen CRUD (opprett, les, oppdater og slett). Appen lar også brukeren sortere gjøremålene etter ulike kriterier.

Jeg valgte å utvikle en fullstack-løsning, med en front-end i React/TypeScript og back-end i ASP.NET Core Backend med en SQL databse for persistence.

## Kjøring av prosjektet
Prosjektet krever en database. Jeg har valgt å bruker Docker, og kjører en SQL server.

Lag en kopi av kodebasen:
```sh
git clone https://github.com/hallvardlh/unimicro-todo.git
cd todo-crud-app
```

Backend setup
```sh
cd backend
dotnet restore
dotnet ef database update
dotnet run
```

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

## API-endepunkter

Metode | Endepunkt | Beskrivelse | Info 
--- | --- | --- | --- 
GET | /api/todo | Hent alle gjøremål | Støtter `searchTerm`, `completed`, `overdue`, paginering og sortering 
GET | /api/todo/{id} | Hent ett gjøremål basert på ID | Returnerer 404 hvis oppgaven ikke finnes 
POST | /api/todo | Opprett et nytt gjøremål | `Title` er påkrevd, maks 140 tegn. Kan inkludere `DueDate` og `Tags` 
PUT | /api/todo/{id} | Oppdater et gjøremål basert på ID | Returnerer 404 hvis oppgaven ikke finnes 
DELETE | /api/todo/{id} | Slett et gjøremål basert på ID | Returnerer 404 hvis oppgaven ikke finnes

## Testing

Prosjektet inkluderer enkle enhetstester for `TaskService`, som kjører mot en **in-memory database** (via `Microsoft.EntityFrameworkCore.InMemory`). Dette sikrer at testene kan kjøres uten behov for en faktisk SQL-server.  

Testene er implementert med:
- **xUnit** som testrammeverk  
- **FluentAssertions** for mer lesbare assertions  

### Hvordan kjøre testene
```sh
cd backend/tests
dotnet test
```


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


## Hjelpemidler
De fleste UI-komponentene er hentet fra ShadCN, flere er redigert for å passe prosjektets egen stil. 

Lovable ble brukt for å generere generell inspirasjon for utseende til applikasjonen, men den genererte koden ble ikke brukt.

Backend følger standard for ASP.NET Core + EF Core.
* Dokumentasjon for ASP.NET fra: https://learn.microsoft.com/en-us/aspnet/core/?view=aspnetcore-9.0
* Dokumentasjon for EF Core: https://learn.microsoft.com/en-us/ef/core/

ChatGPT ble brukt for "rubber duck debugging" og som en sparringspartner. KI-en fungerte som en god supplementering til offisiell dokumentasjon for C# og .NET. 


## MCP-touch
En MCP er i bunn og grunn en måte å gi en KI-agent en strukturert måte å spørre etter data, eller utføre handlinger, uten å måtte gjette hvordan API-en fungerer.

Jeg har skissert et lite eksempel på hvordan en slik MCP-handler ville sett ut:

```csharp
// MCP handler for å eksponere tasks
public class McpHandler
{
    private readonly ITaskService _taskService;

    public McpHandler(ITaskService taskService)
    {
        _taskService = taskService;
    }

    // Eksempel: ett minimalt endepunkt som returnerer tasks som JSON som en MPC kan forstå
    public async Task<object> HandleRequestAsync(string method, Dictionary<string, object>? parameters)
    {
        switch (method)
        {
            case "listTasks":
                var tasks = await _taskService.GetAllTasksAsync();
                return new
                {
                    type = "tasks",
                    items = tasks.Tasks.Select(t => new
                    {
                        id = t.Id,
                        title = t.Title,
                        completed = t.Completed,
                        dueDate = t.DueDate
                    })
                };

            case "getTask":
                if (parameters == null || !parameters.ContainsKey("id"))
                    throw new ArgumentException("Missing id parameter");

                var task = await _taskService.GetTaskAsync(parameters["id"].ToString()!);
                return new
                {
                    type = "task",
                    item = task == null ? null : new
                    {
                        id = task.Id,
                        title = task.Title,
                        completed = task.Completed,
                        dueDate = task.DueDate
                    }
                };

            default:
                throw new NotImplementedException($"Method {method} not implemented");
        }
    }
}
```

Her eksponeres oppgaver som en resurs, en KI kan be om `{method: "listTasks"}` og få en liste over oppgaver i JSON fra MCP-en. Det er også mulig å hente en enkelt oppgave.

Videre kunne en ha gjort det mulig for en KI å opprette, endre eller slette gjøremål. 

Ved å integrere en MCP i applikasjonen, ville det vert mulig å ha forskjellige KI-funksjoner, for eksempel:
* Generering av gjøremål fra kontekst: om en AI har tilgang til for eksempel e-post, vil den kunne automatisk opprette gjøremål basert på en e-mails innhold.
* Chat-grensesnitt: selv om det ikke er særlig relevant i en todo-app, vil en MCP gjøre det mulig å skrive en prompt til en KI, som lager gjøremål for deg. Kanskje den kan lage gjøremål fra en større PDF, slik at du slipper å lese hele.

## Deploy til Azure (skisse)

En mulig måte å kjøre løsningen i produksjon på ville vært:

- Backend kjørt som en container i Azure App Service eller Azure Container Apps.  
- Database hostet i Azure SQL Database for persiste lagring av oppgaver.  
- Frontend kunne bygges og leveres via Azure Static Web Apps eller som en del av App Service.  

### Kost og risiko
- Kostnader: Til og med små apper i Azure kan koste noen hundre kroner i måneden (App Service-plan + SQL Database).  
- Risiko: Det vile vært viktig å sikre databasen (for eksempel med brannmurregler, private endpoints, og kryptering). Autentisering bør settes opp med for eksempel Azure AD for å hindre uautorisert tilgang.  
- Skalerbarhet: Container Apps eller App Service kan automatisk skalere ved behov, men dette kan øke kostnadene raskt om trafikken vokser.
