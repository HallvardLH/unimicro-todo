### Databasenormalisering
Selv om dette prosjektet ikke kommer til å bli brukt på et stort skala, har jeg hatt som mål å gjøre det skalerbart. Når man lager en database, er det sentralt å unngå duplisering av den dataen man lagrer, og dette kan en oppnå ved bruk av normalisering.
Den gitte REST-kontrakten fungerer bra for bruk i front-end, der lister (array) ikke er noe problem. 
```json
{
  "type": "object",
  "required": ["id", "title", "completed", "createdAt"],
  "properties": {
    "id": { "type": "string", "description": "UUID or unique string" },
    "title": { "type": "string", "minLength": 1, "maxLength": 140 },
    "completed": { "type": "boolean", "default": false },
    "dueDate": { "type": "string", "format": "date-time", "nullable": true },
    "tags": { 
      "type": "array", <-- Bryter med 1NF
      "items": { "type": "string" }
    },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time", "nullable": true }
  }
}
```