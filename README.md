# DACMS - Deployment-ready scaffold

This repository contains a production-ready scaffold for **DACMS** (District/Community Administration & Committee Management System) with:

- Frontend: React + Tailwind CSS (located in `/client`)
- Backend: Node.js + Express structured as Vercel-compatible serverless functions (located in `/api`)
- PostgreSQL queries via `pg` (connection via `DATABASE_URL`)
- Auth: JWT skeleton
- File uploads: Cloudinary integration placeholder
- Email: Nodemailer placeholder configuration
- Vercel-ready configuration & environment examples

## What is included
- Minimal, functional frontend with login/registration pages and an admin dashboard scaffold (responsive).
- Serverless Express app (wrapped for Vercel) exposing routes for auth, users, committees, budgets, projects.
- SQL schema (migrations.sql) to bootstrap database.
- `.env.example`, `vercel.json`, `.gitignore`, and package manifests.

## How to run locally (recommended)
1. Install dependencies for root (to use shared scripts) or separately run client and api:
   - `cd client && npm install`
   - `cd api && npm install`

2. Create a `.env` file in `/api` using `/api/.env.example` values.

3. Start client:
   - `cd client && npm run dev` (Vite)
4. Start API locally (optional):
   - `cd api && npm run dev` (uses `vercel dev` or `node`)

## How to deploy to Vercel
- Import the project to Vercel and set environment variables from `/api/.env.example`.
- Vercel will build the `/client` site and expose serverless functions from `/api`.

## Notes
This scaffold focuses on structure, routes, and examples. Replace placeholder secrets and implement production policies, validation, and additional business logic before going live.

