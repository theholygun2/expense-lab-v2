# ExpenseLab v2

Personal expense tracker with income/expense logging, 50/30/20 budget breakdown, and monthly spending charts.

## Tech Stack

**Frontend** — React, Vite, TypeScript, shadcn/ui, TanStack Query, TanStack Router

**Backend** — Hono, Bun, DrizzleORM, PostgreSQL (Neon), Better Auth

## Project Structure

expense-lab-v2/
├── frontend/   # React + Vite
└── server/     # Hono + Bun

## Getting Started

# server
cd server
bun install
bun run dev

# frontend
cd frontend
bun install
bun run dev

## Environment Variables

See `server/.env.example` and `frontend/.env.example`