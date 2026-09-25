# KerygmaAI

A React Native (Expo) app that turns any theme you type into a structured, AI-generated Bible devotional, in English or Portuguese.

<a href="https://apps.apple.com/br/app/kerygmaai/id6742852987?l=en-GB">
  <img src="https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg" alt="Download on the App Store" height="50">
</a>

<p align="center">
  <img src="assets/screenshots/tela-inicial.png" width="250" alt="Home screen with the verse of the day" />
  <img src="assets/screenshots/devocional.png" width="250" alt="Generated devotional" />
  <img src="assets/screenshots/historico.png" width="250" alt="Devotional history" />
</p>

> *Kerygma* (κήρυγμα) is Greek for "proclamation". The name pairs it with AI: technology used to make reflection on the Gospel more personal.

## Features

- **AI devotionals from a theme**: the user types a theme ("anxiety", "forgiveness", ...) and gets a devotional with a title, introduction, one or two Bible verses, a reflection, a practical application and a closing prayer.
- **Verse of the day**: picked from a bundled set of 100 verses in English and Portuguese, stable for the whole day.
- **History**: the 20 most recent devotionals are saved on the device, can be reopened or cleared.
- **Sharing**: devotionals and the verse of the day go out through the native share sheet.
- **Bilingual UI**: English and Portuguese, detected from the device locale and switchable in the app; the devotional is generated in the active language.
- **Light and dark themes** following the system setting, and an in-app prompt when a new version is available.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Expo SDK 54, React Native 0.81 (New Architecture enabled), React 19.1 |
| Language | TypeScript |
| Navigation | Expo Router 6 (file-based, typed routes) with bottom tabs |
| Server state | TanStack Query 5 |
| Forms | React Hook Form + Zod |
| i18n | i18next / react-i18next + expo-localization |
| Storage | AsyncStorage |
| AI | OpenAI Chat Completions API (`gpt-3.5-turbo`) |
| Animation / UI | Reanimated 4, expo-blur, expo-linear-gradient, SF Symbols via expo-symbols |
| Tooling | Biome (lint/format), Jest + jest-expo + React Native Testing Library |
| Delivery | EAS Build, EAS Workflows, EAS Update (expo-updates) |

## Architecture highlights

- **Service layer separate from screens.** AI generation (`aiService`), history persistence (`devotionalService`) and sharing (`shareService`) are plain async functions under `src/services`, so screens stay focused on UI and the logic is unit-testable without rendering.
- **Structured prompting per language.** The system prompt fixes the devotional's sections and length (about 500 to 800 words) and is written in the target language, so the output matches the UI language instead of being translated afterwards.
- **Offline-friendly verse of the day.** Instead of depending on a remote API, the verse comes from bundled JSON datasets, selected with a date-based seed and cached by TanStack Query with a 24-hour `staleTime` keyed by date and language.
- **Validated input.** The theme form uses React Hook Form with a Zod schema, so empty submissions never reach the API.
- **Automated delivery.** EAS Workflows run a TypeScript check (`tsc --noEmit`) on every pull request and trigger production iOS and Android builds on every push to `main`. `expo-updates` checks for new versions at launch and prompts the user to update.

Note: the OpenAI request is made directly from the client with an `EXPO_PUBLIC_` key, which ends up in the app bundle. For a production-grade setup the call should move behind a backend or serverless proxy.

## Getting started

Prerequisites: Node.js, npm, and Xcode or Android Studio for native builds (the project uses `expo-dev-client`).

```bash
git clone https://github.com/GersonRocha9/KerygmaAI.git
cd KerygmaAI
npm install
cp .env.example .env   # then set EXPO_PUBLIC_OPENAI_API_KEY
```

| Variable | Description |
| --- | --- |
| `EXPO_PUBLIC_OPENAI_API_KEY` | OpenAI API key used to generate devotionals |

```bash
npm start          # start Metro
npm run ios        # build and run on iOS
npm run android    # build and run on Android
npm run lint       # Biome check
```

## Tests

Unit and component tests live in `src/__tests__`, covering services (AI, history, sharing, verses), hooks (language, theme, verse of the day), i18n, formatters, components and the four main screens.

```bash
npm test
npm run test:coverage
```

## Project structure

```
app/                 Expo Router routes
  (tabs)/            Home and "new devotional" tabs
  devotional-result.tsx
  history.tsx
src/
  components/        Shared UI (themed primitives, cards, list items)
  hooks/             Language, theme, update check, TanStack Query hooks
  services/          AI, history, sharing
  i18n/              Locales (en, pt) and verse datasets
  __tests__/         Jest test suite
.eas/workflows/      CI (type check) and CD (production builds)
```

## Author

**Gerson Rocha**, mobile engineer (React Native / Expo): [github.com/GersonRocha9](https://github.com/GersonRocha9)
