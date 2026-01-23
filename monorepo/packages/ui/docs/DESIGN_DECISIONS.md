# Standalone UI System
## Design Decisions Documentation

### (Selected) Module / Folder Structure 

```
packages/ui/
├── docs/
│   └── DESIGN_DECISIONS.md
└── src/
    ├── index.ts
    ├── lib/                # Atomic components (each subfolder contains component + test)
    │   ├── button/
    │   ├── canvas/
    │   ├── container/
    │   ├── dropdown/
    │   ├── footer/
    │   ├── form/
    │   ├── grid/
    │   ├── header/
    │   ├── icon/
    │   ├── image/
    │   ├── input/
    │   ├── main/
    │   ├── modal/
    │   ├── panel/
    │   ├── portal/
    │   ├── section/
    │   ├── spacer/
    │   ├── stack/
    │   ├── typography/
    │   └── viewport/
    └── utils/              # Shared helpers (non-visual)
        └── portal.ts
```

### UI Library
The UI System is a standalone, reusable design system built for the NX monorepo. It provides:
- **Atomic components** (buttons, inputs, dropdowns, containers, modals, etc.)
- **Utility functions** (portal, classNames, etc.)
- **Composable building blocks** for feature-specific implementations like Pokémon-UI.
- Consistency in styling, accessibility, and theming across all subprojects.
- Atomic components are unopinionated, reusable building blocks.
- Feature-specific components (e.g., Pokémon-UI) compose atomic primitives rather than modifying them directly.

### Design Goals
- **Need-to-have:** Accessible — available across nx monorepo, enforces norms (of usage, theming, clarity, and baselines) across a set of default components.
- **Nice-to-have:** Atomic — offers primitive forms that are composable into more complex structures. Keeps foundational components and principles independent from feature-specific implementations. 

### Usage Principles
- Compose atomic components to build feature-specific UI.
- Avoid embedding business logic into primitives.
- Use utility helpers (portal, classNames) for non-visual needs.
- Follow theming and accessibility standards enforced by the library.

### Extensibility
- Support additional primitives (tables, charts, avatars) as needed.
- Enable context-based theming overrides for subprojects.
- Integrate advanced patterns like portals, Suspense, and error boundaries without modifying core primitives.
