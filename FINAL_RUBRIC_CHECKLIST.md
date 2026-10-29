# Final Deliverable Rubric Tracker

Use this file as a live test sheet. Do not mark an item complete until you have demonstrated it in the browser using the Docker-run application.

## Environment / submission
- [ ] `docker compose up --build` starts both services.
- [ ] `http://localhost:5173` loads without browser console errors.
- [ ] `http://localhost:5000/` returns the backend health JSON.
- [ ] `.env` contains a valid `MONGODB_URI` and is not included in the ZIP/public GitHub repository.
- [ ] Export MongoDB data and include the export in the final submission.
- [ ] `readme.txt`/README lists all commands and explains directory structure.
- [ ] ZIP has the required `Position_Surname` root folder and excludes `node_modules`.

## Required data
- [ ] At least 8 users.
- [ ] At least 10 posts with descriptions.
- [ ] At least 5 albums.
- [ ] `test@test.com` / `test1234` logs in successfully.
- [ ] The test account has at least one post, one album and two friends.

## User-facing features
- [ ] Logged-out users see only the splash page.
- [ ] Register, auto-login after registration, login and logout work.
- [ ] Local and global feeds work and sort newest first.
- [ ] Profile displays public info and supports profile editing/image changes.
- [ ] Friendship requests can be sent, accepted, declined and removed.
- [ ] Other-user profile visibility changes according to friendship status.
- [ ] Create posts with images, descriptions and clickable hashtags.
- [ ] Edit/delete own posts; deleting a post removes its comments.
- [ ] Comment on posts and view comments on post detail pages.
- [ ] Create/edit/delete albums and add/remove posts.
- [ ] Search users, posts, albums and hashtags; results are clickable.
- [ ] Posts reported more than twice are hidden behind a reveal option.
- [ ] Admin can manage users, posts, albums and reports and add report reasons.

## Quality / rubric bonuses
- [ ] Responsive layout verified at mobile, tablet and desktop widths.
- [ ] Consistent navigation, labels, errors and website identity.
- [ ] No debugging alerts, empty pages or browser-console errors.
- [ ] Light/dark mode (bonus).
- [ ] Fuzzy search / autocomplete (bonus).
- [ ] GitHub branch merged into main (bonus).

## Current known caveat
This ZIP updates demo seeding and Docker startup checks. It does **not** prove that every item above is implemented. In particular, the admin UI/authorization, full session/cookie handling, hidden-reported-post behaviour, search completeness, database export and all feature flows must still be tested and completed where missing.

## Patch notes for 29 October 2026 (review this version)
- Post creation/edit/deletion now checks the signed bearer token; only the owner (or an administrator) can edit/delete a post.
- Deleting a post also deletes its comments and removes its post ID from album membership.
- Report creation now requires authentication, prevents reporting one's own post, and blocks duplicate active reports by the same user.
- Viewing/updating the legacy reports endpoint now requires administrator access. The dedicated `/api/admin/reports` endpoint remains the dashboard path.
- The post feed API adds report counts and a `hiddenByReports` flag; the Home feed displays a warning and a “View post anyway” action for posts with more than two non-dismissed reports.
- Administrator post deletion also deletes associated comments.

## Still incomplete or not verified — do not tick these without testing
- The rubric text supplied in chat was only the point weights (106 core + 34 bonus = 140); it did not include the Yes/No criterion labels. Compare this tracker against the actual marking PDF.
- Predefined report reasons managed by admins are not implemented as a complete workflow; the post page currently allows free-text reasons.
- Local-vs-global feed separation and friend-only local feed filtering need browser verification; do not assume they are complete.
- Friendship request acceptance/decline/removal and privacy rules need end-to-end testing.
- Album recommendation hashtags, auto-delete empty album bonus, report-abuse detection, and notifications for deleted posts are not verified/implemented as complete workflows.
- Search currently uses case-insensitive partial matching; fuzzy search for misspellings is not implemented.
- MongoDB export is not included in this ZIP. Export the actual project database and add it to the submission separately if required by the rubric.
- Sample seeding describes 8 users; the rubric PDF appears to request at least 10 registered users, so add/test at least 10 if required by your current rubric.
- Session/cookie management is not implemented as a full cookie-based session; the app uses bearer tokens in localStorage. Verify how the marker interprets this criterion.
- This patch has had JavaScript syntax checks on the changed backend files, but no full Docker/browser end-to-end test. Build and test before submission.

## 2026-10-29 rapid final pass (not a full end-to-end verification)

### Changes made in this pass
- Added authenticated friendship endpoints: public profiles auto-connect; private profiles create a pending request; request recipients can accept/decline; users can remove a friendship.
- Added profile privacy toggle (public by default for newly registered accounts) and incoming friend-request controls on the profile page.
- Removed frontend-side direct overwrites of both users' `friends` arrays from the profile friendship handler.
- Protected profile edits so a signed-in user can edit only their own profile; direct friend-list edits are no longer accepted by this endpoint.
- Refreshed Home page styling to a photo-first single-column feed, responsive navigation, and desktop sidebar.
- Added short-lived client-side caching for users and posts to reduce repeated fetches while navigating.

### Checks performed
- `node --check backend/routes/userRoutes.js` passed.
- `node --check backend/server.js` passed.
- `node --check backend/routes/postRoutes.js` passed.
- Frontend production build was **not run successfully** because `npm ci` timed out in the available environment; dependencies are not bundled in the ZIP. Run `npm ci` and `npm run build` locally before submission.
- Docker/browser end-to-end checks are still required. Test two accounts in separate browser profiles: public auto-friend; private request; accept; decline; remove friendship; profile privacy persistence; post create/edit/delete; comments; albums; reports/admin; search; mobile layout.
