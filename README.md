# Smart Campus Maintenance and Predictive Analytics Platform

A campus maintenance and complaint management platform for Deenbandhu Chhotu Ram University of Science and Technology (DCRUST), Murthal. It includes student and administration workflows, PostgreSQL-backed records when configured, and a separate AI/ML service for maintenance analytics.

## Features

- Student and administration dashboards, authentication, and profiles
- Complaint submission, tracking, evidence review, progress updates, and notifications
- Educational and cultural permission approval workflows
- Analytics and ML-assisted complaint categorization and priority prediction
- Predictive maintenance insights, resolution-time estimates, and image inspection tools
- PostgreSQL persistence for users, complaints, permissions, notifications, and newsletter subscribers when `DATABASE_URL` is configured

## Technology stack

- **Frontend:** React 19, Vite, Tailwind CSS, React Router, Recharts, Lucide, Axios
- **Backend:** Node.js, Express, PostgreSQL (`pg`), Nodemailer, optional Twilio notifications
- **AI/ML service:** Python, FastAPI, scikit-learn, pandas, NumPy; additional model dependencies are listed in `ml-service/requirements.txt`

## Getting started

1. Install the Node dependencies with `npm install`.
2. Copy `.env.example` to `.env`. Set `DATABASE_URL` to a real PostgreSQL connection string and set `DATABASE_SSL=true` if required by the provider. Keep `.env` private and never expose the database URL in frontend settings.
3. Run the application with `npm run dev`. This starts the Vite frontend and Node API. Without `DATABASE_URL`, local development uses temporary in-memory demo data, which is lost when the backend restarts. Production startup requires `DATABASE_URL`.
4. Optionally start the Python ML service using the instructions in [ml-service/README.md](ml-service/README.md).
5. Create a production frontend build with `npm run build`.

The API automatically creates a PostgreSQL table named `campus_records`, then seeds demo records for any entity without existing rows. It stores records under `users`, `complaints`, `permissions`, `notifications`, and `subscribers` entity values. Check `/api/health` on the backend; `databaseConfigured` should be `true` when the environment includes `DATABASE_URL`.

For deployment, deploy the Node backend separately from the Vite frontend. Configure `DATABASE_URL` and (if needed) `DATABASE_SSL` on the backend host. Set `VITE_API_BASE_URL` to the deployed API base URL on the frontend host before building/deploying the frontend. The included Vercel rewrite serves the frontend SPA; it does not deploy or proxy the Express API.

SMTP and Twilio configuration is optional. Configure those variables on the backend only when email/SMS delivery is required. Without SMTP, email notifications run in dry-run mode.

## Demo credentials

- Student: `aarav@student.dcrust.in` / `student123`
- Admin: `chahalprince0481@gmail.com` / `prince@123`
- CSE Department Head: `hod.cse@dcrust.in` / `hod12345`

These are demonstration credentials only. The authentication implementation is not suitable for real personal or production data without further security work.

## Retraining ML models

From `ml-service/`, run the data pipeline and production model trainer as described in [ml-service/README.md](ml-service/README.md). The ML API may not return predictions until labelled data has been prepared and models trained.
