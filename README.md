# PhotoShare — Final Deliverable Working Copy

This working copy combines the supplied Deliverable 2 frontend and backend, adds a root Docker Compose setup, improves startup health checks, and updates demo data seeding. It is not a claim that every rubric item is already complete; use `FINAL_RUBRIC_CHECKLIST.md` to test the application.

## Requirements
- Docker Desktop (Docker Engine + Compose plugin)
- A MongoDB connection string (the project currently uses MongoDB Atlas)

## First-time setup
1. Copy `.env.example` to `.env` in this root folder.
2. Set `MONGODB_URI` to your own MongoDB connection string. Set `AUTH_TOKEN_SECRET` to a random secret of at least 32 characters and replace the three placeholder passwords in `ADMIN_ACCOUNTS_JSON` with unique passwords of at least 12 characters. Ensure the database user has the required access and your IP/network is allowed in Atlas.
3. Start the app:

   ```bash
   docker compose up --build
   ```

4. Open `http://localhost:5174` (host port 5174 maps to Vite port 5173 in the container).
5. Backend health endpoint: `http://localhost:5000/`.

Stop with `Ctrl+C`, or run `docker compose down` from another terminal.

## Seed demo data
With `.env` configured, run the following from the project root:

```bash
docker compose run --rm backend npm run seed
```

The seed script adds/updates its own tagged demo records and does not clear all existing collections. It provides 8 demo users, 10 posts, 5 albums and 5 comments. Required test account:

- Email: `test@test.com`
- Password: `test1234`

Administrator accounts are provisioned at backend startup from `ADMIN_ACCOUNTS_JSON` in your private root `.env` file. Public signup always creates a regular user. Configure three unique administrator credentials (each password at least 12 characters) before starting the app. Do not use the sample placeholders. The dashboard is at `/admin` after an administrator signs in.

## Directory structure
- `frontend/` — React + Vite UI, pages, components, assets and API client.
- `backend/` — Express server, MongoDB connection, API routes and demo seeder.
- `docker-compose.yml` — runs the frontend and backend services together.
- `.env.example` — environment variable template; copy it to `.env` locally.
- `FINAL_RUBRIC_CHECKLIST.md` — manual test checklist for final verification.

## Important notes
- Never commit or submit the real `.env` file or expose MongoDB credentials. Keep `.env` local; use `.env.example` as a template.
- The app uses Vite's development server inside Docker for ease of testing. Test using Docker, as required by the project spec.
- Run through the rubric checklist and demonstrate every feature in the browser. The Docker setup and seed data are improvements, not a guarantee of full rubric compliance.
- The course specification has a specific rule for the test account password. The login endpoint now supports the plaintext course test account and bcrypt hashes for normally registered accounts. This is appropriate only for the course's required demo setup, not for a production system.

## New search, album and admin additions
- Search endpoint: `GET /api/search?q=...` searches user names, post descriptions/hashtags and album names/descriptions.
- Albums page: `/albums` lists the signed-in user's albums and supports creating, editing and deleting albums.
- Admin dashboard: `/admin` provides overview, account management, post moderation and report review. Admin endpoints use a signed token and re-check the account's `role` in MongoDB.
- Admin provisioning: the backend hashes and upserts accounts from `ADMIN_ACCOUNTS_JSON` on startup. Keep credentials in `.env`, not in source control.

## Test carefully before submission
This is a working-copy update, not a certification that every official rubric criterion is satisfied. Verify search, album operations, account deletion, reporting, ownership restrictions, required seeded data, and all original pages in your local environment. The existing non-admin API routes have not all been refactored to enforce signed-token ownership checks; do not treat this working copy as production-secure.

## Album photo workflow update

- The Albums page now lets the signed-in user open one of their own albums, upload an image directly into it (images up to 5 MB), and view/remove photos from that album.
- When creating a post, the user can optionally select one of their own albums. Leaving the selector at “Keep as an individual post” creates a standalone post.
- Album API operations now use the signed-in bearer token to identify the owner. Users can only manage their own albums and add their own posts to those albums. Removing a photo from an album does not delete the post from the feed.
- Keep your `.env` private. Do not include it in the submission archive or commit it to a public repository.
