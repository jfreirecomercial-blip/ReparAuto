# ReparAuto

Static SPA marketplace for used cars / parts in Portugal. All code is in a single file.

## Structure

- `public/index.html` — the entire app (HTML + inline CSS + all JS, ~3100 lines). **There is only one real file.**
- `projeto pagina de carro low cost.html` — older prototype with fake auth. Do not edit unless told.
- `docs/` — roadmap, design system, security, legal docs. Prose only, not executable.
- `images/` — sample car listing images.

## Tech

- **No build system, no package.json, no lockfile.** Tailwind v3 + Font Awesome 6.5.1 + Inter font loaded via CDN.
- **No backend.** All data lives in `localStorage` under keys `carros_reparauto`, `pecas_reparauto`. Cache version in `reparauto_db_version` (currently `'2.2'`). Clearing storage resets to seed data.
- **Firebase Auth v10.14.1** (compat SDK) — email/password + Google OAuth. Config is hardcoded in the HTML. No Firestore, no Storage, no Functions.
- **Portuguese only** — code comments, variable names, UI text, commit messages.

## Commands

```sh
firebase deploy --only hosting --project reparauto-site
```

That's the only command. There are no test, lint, format, or typecheck tools.

## Dev workflow

1. Edit `public/index.html`.
2. Open `public/index.html` directly in a browser (or serve with any static server).
3. Deploy with the command above.

## Conventions

- `camelCase` for JS identifiers, `snake_case` for a few vehicle fields (`anoFabricacao`, `estadoVeiculo`).
- Pages are `<div>` elements shown/hidden via CSS `display` toggle: `page-home`, `page-detalhes`, `page-anunciar`, `page-pecas`, `page-perfil`.
- Firebase API keys are public (expected for Firebase Web SDKs).
