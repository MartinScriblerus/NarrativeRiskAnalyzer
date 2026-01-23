# Pokémon-UI
## Design Decisions Documentation

### Framework and Tooling
The pokemon-ui code implements React 18.3 with some specific implementations for rendering and maintainability. 

* Router – Currently using routes to toggle components. This supports future scaling to multi-page or multi-microservice setups.
* Context – Lightweight state management to avoid prop drilling, simpler than Redux for this MVP.
* Portals – Planned for rendering components outside the normal React tree (modals, tooltips). Implementation in the UI System.
* Suspense – Planned for lazy-loading components to improve initial render performance. Implementation TBD.

This repository will contain ** specific implementations ** for Pokémon-UI. See the UI System for generic components shared across subprojects.

### Module / Folder Structure
```
packages/pokemon-ui/
├── .eslintrc.json
├── index.html
├── project.json
├── public/
├── docs/
│   └── DESIGN_DECISIONS.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.spec.json
├── vite.config.ts
└── src/
    ├── emotion.d.ts
    ├── main.tsx
    ├── theme.ts
    ├── app/
    │   ├── app.spec.tsx
    │   ├── app.tsx
    │   ├── nx-welcome.tsx
    │   ├── providers.tsx
    │   └── router.tsx
    ├── assets/
    ├── components/
    │   ├── history-dashboard/
    │   │   └── HistoryDashboard.tsx
    │   ├── home/
    │   │   └── Home.tsx
    │   ├── profile-selection/
    │   │   └── ProfileSelection.tsx
    │   ├── team-creation/
    │   │   ├── PokemonSelector.tsx
    │   │   ├── ProfileDropdown.tsx
    │   │   ├── TeamDropdown.tsx
    │   │   └── TeamEditor.tsx
    │   └── team-selection/
    │       └── TeamSelection.tsx
    ├── contexts/
    │   └── MainContext.tsx
    ├── hooks/
    │   └── use-crud.ts
    ├── styles/
    │   └── global.css
    └── utils/
        ├── api.ts
        └── profileContext.ts
```

### Key Components:
- AppFrame – global layout wrapper
- ProfileSelection – select/create a profile
- TeamSelection – select up to 6 Pokémon for a team
- HistoryDashboard – view previously created teams

### Design Goals
- **Need-to-have:** Users must be able to create teams of up to 6 Pokémon. UI communicates clearly the current profile, team, and selected Pokémon, preventing invalid selections. Styling is minimal, focusing on functional layout and accessibility.
- **Nice-to-have:** Ease-of-use enhancements, e.g., search-enabled dropdowns for Pokémon and Profiles to quickly find options. This improves the UX without impacting core functionality.

### Usage Principles
- Feature-specific components should compose atomic primitives from the UI System rather than implementing custom base components.
- Avoid embedding business logic in low-level components; domain logic lives in contexts, hooks, or higher-level containers.
- Ensure accessibility and consistent styling through shared UI System primitives and theme.
