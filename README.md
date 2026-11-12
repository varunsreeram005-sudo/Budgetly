# Budgetly

A minimal daily planner and expense tracker built with React, TypeScript, and Vite. Budgetly stores tasks, expenses, and spending limits locally in the browser and works as an installable Progressive Web App.

## Features

- Daily tasks and weekly planner
- Expense tracking in Indian rupees (INR)
- Monthly and yearly spending limits
- Spending insights and CSV export
- Local-first storage; no account required
- Light and dark themes
- Installable PWA with offline app-shell caching

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Data and privacy

Budgetly stores app data in browser `localStorage` on the device. Clearing browser site data will remove locally stored tasks, expenses, and budget settings. No login or cloud sync is configured.

## Tech stack

- React 19 + TypeScript
- Vite
- Lucide icons
- Tailwind CSS / PostCSS

## Live app

https://budgetly-w6m5w5.v2.appdeploy.ai/
