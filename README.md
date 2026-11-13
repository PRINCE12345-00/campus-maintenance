# Smart Campus Management System

A responsive frontend demo for the final-year B.Tech CSE project titled Smart Campus Management System for Deenbandhu Chhotu Ram University of Science and Technology (DCRUST), Murthal.

## Features

- Landing page with university branding
- Student and admin demo authentication flows
- Complaint submission and tracking dashboard
- Educational and cultural permission workflow
- Admin review and status update controls
- Analytics and demo ML prediction section
- Notifications and profile management
- LocalStorage-backed mock data for demonstration

## Tech stack

- React + Vite
- JavaScript
- Tailwind CSS
- React Router DOM
- Context API
- Recharts
- Lucide React
- Axios-ready service layer

## Getting started

1. Install dependencies:
   npm install

2. Copy `.env.example` to `.env`. SMTP is configured to send from the admin Gmail address `chahalprince0481@gmail.com`; set `SMTP_PASS` to an App Password generated for that account. For Gmail, 2-Step Verification must be enabled to create an App Password. Use the App Password, not the regular Gmail password. The example uses Gmail SMTP on port 465. Student notifications are addressed to the email on the submitting student's account.

   Keep `.env` private; it is excluded from Git. Do not paste SMTP credentials into chat or commit them.

   To run without email for now, leave the SMTP values unset; email notifications will be logged as dry runs and will not be delivered.

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


## Data Science implementation (added)

- Admin Analytics now requests `/api/analytics` and renders descriptive statistics calculated from the live in-memory complaint collection.
- The Node API exposes category, location, month, priority and status summaries plus average resolution time where dates are available.
- `ml-service/` contains a separate FastAPI + scikit-learn training and prediction service for complaint category and priority classification.
- The ML API intentionally does not return predictions until it has been trained on labelled data. See `ml-service/README.md`.

### Important current limitation

The existing Node backend stores users, complaints, permissions and notifications in process memory. Records reset when the server restarts. This change preserves that architecture and does not silently migrate or replace the database. For persistent analytics and reliable forecasting, a database and sufficient historical complaint records are future requirements.
