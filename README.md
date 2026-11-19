# Smart Campus Management System

A responsive frontend demo for the final-year B.Tech CSE project titled Smart Campus Management System for Deenbandhu Chhotu Ram University of Science and Technology (DCRUST), Murthal.

## Features

- Landing page with university branding
- Student and admin demo authentication flows
- Complaint submission and tracking dashboard
- Educational and cultural permission workflow
- Admin review and status update controls
- Analytics and ML-assisted complaint categorization
- Notifications and profile management
- PostgreSQL-backed complaints, permissions, notifications, and registered users when `DATABASE_URL` is configured

## Tech stack

- React + Vite
- JavaScript
- Tailwind CSS
- React Router DOM
- Context API
- Recharts
- Lucide React
- Axios API service layer
- PostgreSQL persistence through the Node.js backend

## Getting started

1. Install dependencies:
   npm install

2. Copy `.env.example` to `.env`. Set `DATABASE_URL` to a PostgreSQL connection string from your provider. Use the provider's pooled connection string if offered. Set `DATABASE_SSL=true` if required by the provider. On deployment, set these as backend environment variables instead of putting them in frontend settings. SMTP is optional: configure it only if email notifications are needed.

   Keep `.env` private; it is excluded from Git. Do not paste SMTP credentials into chat or commit them.

   To run locally without a database, leave `DATABASE_URL` unset; the backend will use temporary demo memory. In production, the backend refuses to start without `DATABASE_URL`. To run without email, leave SMTP variables unset; email notifications will be logged as dry runs.

3. Run the app locally:
   npm run dev

4. Build for production:
   npm run build

After changing SMTP settings, restart the backend so it reloads the environment variables. Complaint emails are sent to the submitting student's email address.

## Demo credentials

Student:
- Email: aarav@student.dcrust.in
- Password: student123

Admin:
- Email: chahalprince0481@gmail.com
- Password: prince@123

> This frontend is a demo-only interface designed for project presentation. Demo credentials are stored in client-side code and are not secure. Do not reuse this password or use this authentication for a real system; production authentication must be implemented on a backend.

# campus-maintenance


## Database setup

The API automatically creates a `campus_records` PostgreSQL table and seeds it with the existing demo records only when each entity has no database records yet. Complaints, permission workflows, notifications, and registered users are written to PostgreSQL and loaded at backend startup. Existing in-memory deployment records are not automatically recoverable; only records already in a running process or the browser's local storage can be exported before switching.

After creating a PostgreSQL database with a provider such as Supabase or Neon:

1. Copy its connection string into local `.env` as `DATABASE_URL` and configure `DATABASE_SSL` as required.
2. Run `npm install` and `npm run dev`. The backend creates its table automatically.
3. For deployment, add `DATABASE_URL` and (if required) `DATABASE_SSL` to the backend host's environment variables. Add `VITE_API_BASE_URL` pointing to the deployed backend API to the frontend host, then redeploy the frontend.
4. Check the backend `/api/health` response; `databaseConfigured` should be `true`.

Never expose the database URL in frontend variables or commit it to Git. The current demo authentication is not production-secure and should not be used for real personal data.

## Data Science implementation

- Admin Analytics now requests `/api/analytics` and renders descriptive statistics calculated from persisted complaints when PostgreSQL is configured.
- The Node API exposes category, location, month, priority and status summaries plus average resolution time where dates are available.
- `ml-service/` contains a separate FastAPI + scikit-learn training and prediction service for complaint category and priority classification.
- The ML API intentionally does not return predictions until it has been trained on labelled data. See `ml-service/README.md`.

When no database is configured for local development, the API falls back to in-memory demo data, which resets when the server restarts.
