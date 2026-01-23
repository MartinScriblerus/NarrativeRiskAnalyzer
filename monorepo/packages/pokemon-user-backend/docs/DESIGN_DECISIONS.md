# Pokémon User Backend
## Design Decisions Documentation

### Module / Folder Structure
```
packages/pokemon-user-backend/
├── .env
├── data/
│   └── pokemon.gen1.json
├── docs/
│   └── DESIGN_DECISIONS.md
├── project.json
├── scripts/
│   └── fetch-pokemon.gen1.js
└── src/
    ├── main.spec.ts
    ├── main.ts
    └── modules/
        ├── app/
        │   ├── app.module.ts
        │   ├── pokemon/
        │   │   ├── pokemon.controller.spec.ts
        │   │   ├── pokemon.controller.ts
        │   │   ├── pokemon.module.ts
        │   │   ├── pokemon.service.spec.ts
        │   │   └── pokemon.service.ts
        │   ├── profiles/
        │   │   ├── profiles.controller.spec.ts
        │   │   ├── profiles.controller.ts
        │   │   ├── profiles.module.ts
        │   │   ├── profiles.service.spec.ts
        │   │   └── profiles.service.ts
        │   ├── team-pokemons/
        │   │   ├── team-pokemons.controller.ts
        │   │   ├── team-pokemons.module.ts
        │   │   └── team-pokemons.service.ts
        │   └── teams/
        │       ├── dto/
        │       │   ├── create-team.dto.ts
        │       │   └── update-team.dto.ts
        │       ├── team.controller.spec.ts
        │       ├── teams.controller.ts
        │       ├── teams.module.ts
        │       ├── teams.service.spec.ts
        │       └── teams.service.ts
        ├── cache/
        │   ├── cache.module.ts
        │   ├── cache.service.spec.ts
        │   ├── cache.service.ts
        │   └── index.ts
        └── database/
            ├── data-source.ts
            ├── db-config.service.ts
            ├── db.ts
            ├── seed-pokemon.ts
            ├── entities/
            │   ├── pokemon.entity.ts
            │   ├── profile.entity.ts
            │   ├── team-pokemon.entity.ts
            │   └── team.entity.ts
            └── migrations/
                ├── 1768003635229-AddTeamsAndTeamPokemon.ts
                └── 1768080422974-AddPopularityAndTimestamps.ts
```

## API OVERVIEW
- Profiles: ephemeral user identifiers, own Teams, support CRUD.
- Teams: encapsulate Pokémon groupings, enforce selection constraints.
- Pokémon: immutable reference data; selection handled via join table.
- Selection endpoints (/select) separate state mutation from user intent.
- Cache module maintains ephemeral Teams and Profiles using TTL (2h) and LFU for top-N public entries.
- Cache ensures rapid retrieval of popular data and enforces automatic cleanup of expired Teams.

Profiles
├─ GET    /api/profiles
├─ POST   /api/profiles
├─ DELETE /api/profiles/{profileId}
├─ GET    /api/profiles/{profileId}/teams
└─ POST   /api/profiles/{profileId}/select

Teams
├─ GET    /api/teams
├─ POST   /api/teams
├─ GET    /api/teams/{teamId}
├─ PATCH  /api/teams/{teamId}
├─ DELETE /api/teams/{teamId}
├─ GET    /api/teams/{teamId}/pokemon-names
└─ POST   /api/teams/{teamId}/select

Pokémon
├─ GET    /api/pokemon
└─ POST   /api/pokemon/{pokemonId}/select

## DATABASE DESIGN DECISIONS (updated)

- Profiles create Teams (1-to-many). Each Team belongs to exactly one Profile.

- Teams group Pokémon. Pokémon can appear on multiple Teams. This is modeled with an explicit join table team_pokemon.

- Pokémon entities remain passive reference data; they do not know about Teams or Profiles. The join table is the source of truth for membership.

- Ownership is enforced at the Team level. Even without login/auth, we track “session ownership” so only the creating visitor can modify their teams.

- Default Profiles (Ash, Misty, Professor Rowan) are seeded in the migration and marked persistent = true.

- This approach allows for flexible team composition, simplifies queries for “all Pokémon in a team” or “all teams a Pokémon belongs to,” and supports future eventing/permissions extensions without premature coupling.

---

(Default) Profiles
------------------------
Ash (persistent)
└── Team A
│   ├── Pikachu
│   ├── Bulbasaur
│   └── Charmander
└── Team B
    ├── Squirtle
    └── Pikachu

Misty (persistent)
└── Team C
    ├── Squirtle
    └── Bulbasaur

Professor Rowan (persistent)
└── Team D
    ├── Charmander
    └── Pikachu

- team_pokemon table ensures (teamId, pokemonId) is unique via a unique composite key constraint.

- A Pokémon can appear in multiple Teams, but cannot be duplicated within the same Team.

- Teams are owned by the Profile that created them.

## Example Queries
### Get all Pokémon in a specific Team
```ts
    const team = await teamRepo.findOne({
    where: { name: 'Team A' },
    relations: ['teamPokemons', 'teamPokemons.pokemon'],
    });

    const pokemonInTeam = team.teamPokemons.map(tp => tp.pokemon.name);
    console.log(pokemonInTeam); // e.g., ['Pikachu', 'Bulbasaur', 'Charmander']
```

### Get all Teams a specific Pokémon belongs to
```ts
    const pokemon = await pokemonRepo.findOne({
    where: { name: 'Pikachu' },
    relations: ['teamPokemons', 'teamPokemons.team'],
    });

    const teamsWithPokemon = pokemon.teamPokemons.map(tp => tp.team.name);
    console.log(teamsWithPokemon); // e.g., ['Team A', 'Team B', 'Team D']
```

### Assumptions

- **Profiles:**  
    - A 'profile' represents a visitor, not necessarily a registered user.  
    - Multiple visitors can create Profiles with the same display name; uniqueness is ensured internally by `id` + `createdAt`.  
    - Ownership of Teams is enforced via `profileId` and optionally a session token, so only the creating visitor can modify their Teams.  
    - Visitors may either create a new Profile or select an existing Profile for interaction.  

- **Teams:**  
    - Each Profile can create multiple Teams (e.g., “Breakfast Club,” “Gym Squad”).  
    - Teams are public by default; any visitor can view teams, but only the creating visitor can modify them.  
    - Teams are ephemeral by default: inactive Teams older than 2 hours are pruned unless they are in the top 50 by score (LRU-style eviction).  
    - Persistent Teams may optionally be marked `persistent = true` (future feature), which prevents pruning.  

- **Pokémon:**  
    - Pokémon are immutable reference objects with only `name` and `pokedexNumber`.  
    - Pokémon do not track Profiles or Teams; the join table `team_pokemon` is the source of truth.  

---

### Feature Requirements Assumptions

- Visitors can select a Profile and then either select an existing Team or create a new Team.  
- Each Team can include up to 6 Pokémon.  
- Ephemeral Teams have a 2-hour TTL; after that, they are removed unless in the top 50 leaderboard.  
- Default Profiles (`Ash`, `Misty`, `Professor Rowan`) exist for visitors to select, optionally seeded with default Teams.  
- Leaderboards are ranked at the Team level, independent of Profile display names.  

---

### Design Goals

- Support ephemeral multi-user interactions without requiring full authentication.  
- Allow multiple visitors to use the same display name while preserving ownership internally.  
- TTL + LRU enforcement prevents database overload or accidental DDoS.  
- Schema must support future persistence, user accounts, and NFT-like team ownership scenarios.  
---

### Data Sources, DB Seeding, TypeORM, & Migrations

- Database is seeded from JSON fetched from PokéAPI.  
- This provides canonical data, indexing strategy, and version control.  

#### Seeding Steps

```bash
pnpm run json:fetch
pnpm run db:seed
```

JSON is stored at /data/pokemon.gen1.json.

## Swagger API & Endpoints
- Swagger is available at /api/docs.
- Designed to assist development, testing, and observability.

## Status Messages
- CRUD endpoints should return meaningful success/error messages.
- Async operations (e.g., adding Pokémon to teams) should be auditable with clear logs.
- Full details TBD in the API implementation phase.
