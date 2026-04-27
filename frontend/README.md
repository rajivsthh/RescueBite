# RescueBite Frontend

RescueBite is a role-based food-rescue simulation app for Kathmandu. It helps restaurants and event organizers report surplus food, matches donations to nearby NGOs, and coordinates volunteer pickups with route guidance and impact analytics.

This frontend is built with React + TypeScript + Vite and uses a local in-memory store to simulate end-to-end rescue workflows.

## What the project demonstrates

- Fast NGO matching for perishable surplus food
- Priority handling for urgent (near-expiry) donations
- Event surplus prediction and scheduled pickups
- NGO accept/reject flow and pickup progress tracking
- Volunteer multi-stop delivery routing
- City-level impact dashboard and analytics visualizations
- Simulated notification/chat experiences for demo storytelling

## Core workflows

### 1) Restaurant donation flow

- Donor enters source, location, food type, quantity, and expiry window
- App computes an optimized split across NGOs based on urgency, distance, and capacity
- Optional food quality photo check provides an advisory safety verdict
- NGO requests are created and can trigger urgent simulated notifications
- Completed deliveries can generate donation certificate data

### 2) Event rescue planning flow

- Event organizer enters event type, guest count, meal type, and end time
- App predicts likely surplus in kg and meals
- Suggested pickup time and nearest NGO guidance are shown
- Organizer can pre-notify NGOs and create scheduled request batches

### 3) NGO dispatch flow

- NGOs review instant and upcoming pickup requests
- NGO can accept/reject each request
- Accepted requests create volunteer delivery tasks
- Live tracker stages progress from matched to delivered

### 4) Volunteer delivery flow

- Volunteers see available/in-transit/delivered deliveries
- Compatible pickups are batched into multi-stop routes for same NGO destination
- Route panel shows stop order, leg distances, ETA, and total distance
- Leaderboard highlights top contributors by delivered meals

### 5) Impact + analytics flow

- Impact page aggregates meals saved, deliveries, scheduled pickups, and event contribution
- CO2 savings are estimated from rescued food mass
- Analytics page visualizes weekly surplus trends, rescued vs wasted trends, type share, and area-time hotspots

## Matching and routing logic (simulation)

### Matching heuristic

The NGO allocator uses a greedy ranking strategy:

- Rank NGOs by score (lower is better)
- Score combines distance, urgency boost, and small capacity tie-breaker
- Allocate meals in rank order up to NGO capacity
- Mark as urgent when expiry is within 2 hours

This keeps logic transparent and easy to tune for demos/hackathons.

### Volunteer route optimization

- Pickup stops are batched for a volunteer
- Route is optimized using nearest-neighbor style ordering
- Drop-off is finalized at NGO destination

## Pages and routes

- `/` Home + rescue map
- `/restaurant` Restaurant donor workflow
- `/event` Event prediction + pre-notification workflow
- `/ngo` NGO request triage and tracker
- `/volunteer` Volunteer routing and leaderboard
- `/analytics` Charts and hotspot analytics
- `/impact` Live impact summary and rankings

## Tech stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS + shadcn/ui + Radix UI
- React Router
- TanStack Query
- Recharts (analytics)
- Leaflet + React Leaflet (map visualizations)
- Vitest + Testing Library

## Local development

### Prerequisites

- Node.js 18+
- npm (or compatible package manager)

### Install and run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

## Available scripts

- `npm run dev` Start development server
- `npm run build` Production build
- `npm run build:dev` Development-mode build
- `npm run preview` Preview built app
- `npm run lint` Run ESLint
- `npm run test` Run test suite once
- `npm run test:watch` Run tests in watch mode

## Project structure (high level)

- `src/pages` Route-level flows (restaurant, event, NGO, volunteer, analytics, impact)
- `src/components` Shared UI and feature widgets (maps, tracker, notifications, quality checker)
- `src/lib` Domain logic (matching, route optimization, predictions, priorities, notifications)
- `src/store` App-level in-memory state and workflow mutations
- `src/test` Test setup and sample tests

## Notes and limitations

- Current data is simulation/mock data for prototype use
- Persistence/auth/backend APIs are not wired yet
- AI/notification features are demonstrative and event-driven in-browser

## Why this project matters

RescueBite demonstrates how role-specific interfaces, lightweight optimization, and transparent metrics can reduce avoidable food waste and improve last-mile food redistribution coordination.
