# Personal Finance

A responsive personal finance demo for exploring balances, transaction history, budgets, recurring bills, and savings goals (pots).

The app runs entirely in the browser with demo data. There is no backend, authentication, or persistence; changes last only for the current session.

## Tech stack

- **Frontend:** Vue 3, TypeScript, and Vite
- **Routing and state:** Vue Router and Pinia
- **Styling and charts:** Tailwind CSS and TanStack Charts
- **Testing:** Vitest, Vue Test Utils, and Playwright
- **Code quality:** ESLint, Oxlint, and Prettier
- **Package manager:** pnpm

## Local development

### Prerequisites

- Node.js `^22.18.0 || >=24.12.0`
- pnpm

From the project directory, install dependencies and start the development server:

```sh
pnpm install
pnpm dev
```

Open the local URL printed in the terminal (typically `http://localhost:5173`). No environment variables or backend services are required.

To run the local checks or preview a production build:

```sh
# Lint, type-check, run fast tests, and build (stops at the first failure)
pnpm check

# Build and preview the production app
pnpm build
pnpm preview
```
