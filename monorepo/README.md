# Pokémon Team Builder — Chorus Interview 

## Overview
This repository contains a simple Pokémon Team Builder that allows a user to create a profile and select up to six Pokémon for the profile from the first 150 Pokémon.

The focus of this assignment is correctness, clarity, and functionality rather than visual design.

## Functional Requirements
User Interface for managing Pokémon
- View a list of the first 150 Pokémon.
- Select Pokémon from the list.
- Name and Create a team
- See other Profiles and Teams
- Select an existing Profile
- A Profile may have no more than six Pokémon at any time.
- Editing existing Teams is out of scope
- User management is out of scope

## Database Structure
A Profile may create one or more Teams. Pokémon selections are associated with a Team, not directly with a Profile. Pokémon, Profiles, and Teams are modeled as independent domain entities. This design enables a clear separation of concerns and easier future expansion (e.g., multiple teams per profile, shared teams, team history). The backend includes the following data model:
1. Profile Table
- Each Profile is a potential owner (scope is limited for now) and creator of one or more Pokémon teams.
- Profiles represent temporary user contexts and do not directly reference Pokémon.
2. Pokémon Table
- Stores Pokémon data
- Includes only the first 150 Pokémon (from PokéAPI)
- Pokémon are immutable reference data and do not know about Profiles or Teams. 
3. Teams Table
- Includes teams created by Profiles
- Teams act as the boundary between user intent and Pokémon selection.
4. Join Table
- Defines the relationship between Profiles and Pokémon
- A Profile can be associated with multiple Pokémon (up to six).
- A Pokémon may be associated with multiple Profiles.
5. Folders for initial seeding (packages/pokemon-user-backend/scripts/fetch-pokemon.gen1.js >> /Users/matthewreilly/Documents/engineering-interview/packages/pokemon-user-backend/data/pokemon.gen1.json) and migrations (packages/pokemon-user-backend/src/modules/database/migrations)
6. Initial Cache setup (TTL 2 hours) and LFU (topN non-private profiles and teams) -- see packages/pokemon-user-backend/src/modules/cache

## API Overview
The API is organized around three core resources: Profiles, Teams, and Pokémon, with a clear separation between resource lifecycle management and selection-based interactions. Profiles represent temporary user contexts and can create and manage Teams, while Teams act as containers for Pokémon selections. Standard RESTful endpoints support CRUD operations on Profiles and Teams, alongside targeted sub-routes for domain-specific actions such as selecting Pokémon for a team or retrieving a team’s Pokémon names. Selection endpoints are modeled explicitly to reflect user intent without overloading update semantics, enabling clear, predictable interactions between users, teams, and Pokémon.

### Quick API example

POST `/api/teams`
Request (JSON):
```json
{
  "name": "Gym Squad",
  "profileId": "c6b1a8d2-...",
  "pokemonIds": ["25","1","4"]
}
```
Success (201 Created):
```json
{
  "id": "a1b2c3d4-...",
  "name": "Gym Squad",
  "profileId": "c6b1a8d2-...",
  "pokemonIds": ["25","1","4"],
  "createdAt": "2026-01-01T12:00:00Z"
}
```
Initial Error Handling:
```json
{ "message": "Team name already exists for this profile" }
```
Validation Error (400 Example):
```json
{ "message": "Team must contain between 1 and 6 pokemonIds" }
```

### API docs (Swagger)

When the backend is running locally, view the OpenAPI/Swagger UI at:

`http://localhost:<backend-port>/api/docs`

Replace `<backend-port>` with the backend `PORT` (default from env, e.g. `3000` or the value printed by the backend dev server).

## UI Architecture
The frontend is built on a standalone, reusable UI system designed to be shared across the NX monorepo. The UI layer is composed of small, atomic components (e.g. buttons, layout primitives, form elements, modals) and a limited set of non-visual utilities. These primitives are intentionally decoupled from feature-specific logic and are composed by higher-level application code (such as the Pokémon UI) rather than embedding domain concerns directly into the components themselves.

This approach enforces consistent styling, accessibility, and layout conventions across the application while keeping feature development flexible and isolated from the underlying UI foundations.

## Design Intent
- UI components are atomic and composable, favoring simple primitives over complex, opinionated widgets.
- Feature-specific behavior lives outside the UI system, keeping components reusable and predictable.
- The system establishes shared baselines for layout, theming, and accessibility across projects in the monorepo.

## Out of Scope
- Authentication, Password & User Management (private profiles)
- Editing Pokémon teams
- Style Polish (e.g. Pokémon images)
- Data Complexity (evolutions, moves, regions, et. al.)
- Realtime, multiuser functionality

## AI Usage Disclosure
I used AI-assisted tools as a productivity aid:
- GPT-5 (LM Studio) for architecture, framework guidance, and documentation refinement
- Github Copilot to generate a few generic frontend UI primitives (non-domain-specific)

All application logic, integration, and decisions were written and validated by me. AI outputs were treated as suggestions and verified through implementation and testing.

## Tech Stack
- React UI
- Emotion CSS
- Typescript
- Node/NestJS Backend
- TypeORM (for seeding, migrations, DB Management) 
- Swagger (for observability)
- NX Monorepo
- Github Actions CI
- PostgreSQL Database
- Docker / Docker Desktop

## Prerequisites

Package Manager: pnpm 8.15.8

Node: 20.14.0 (LTS)

Docker

## Quickstart — Local development

Follow these steps to run the services locally (developer-friendly). If you'd prefer minimal changes, use the `dev` scripts in the package folders individually.

- Install dependencies
```bash
    pnpm install
```

Start everything (Docker + PM2)
```bash
    pnpm dev
```

Or start manually:
```bash
    # Start Docker services first
    pnpm docker:up
    
    # Then start PM2
    pm2 start ecosystem.config.js
```

Restart Server
```bash
    pm2 restart server
```

Stop frontend and backend
```bash
    pm2 stop all
```

To see active logging
```bash
    pm2 logs
```

Start backend individually
```bash
    pnpm run pokemon-user-backend dev
```

Start frontend individually

```bash
    pnpm run pokemon-ui dev
```

Environment variables

Add a .env file or export these env vars before running services:
- POSTGRES_HOST=localhost
- POSTGRES_PORT=5432
- POSTGRES_USER=some_local_user # example only
- POSTGRES_PASSWORD=some_local_pass # example only
- POSTGRES_DB=pokemon
- NODE_ENV=development
