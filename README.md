# Corporate Health Insurance Enrollment Simulator

A full-stack web application simulating a real-world corporate health insurance enrollment workflow. This project demonstrates core full-stack development skills including RESTful API design, database state management, and business rules validation.

## 🚀 Features

- **Employee Portal**: Employees can seamlessly submit their health insurance enrollment applications.
- **Business Rules Engine (Backend)**: 
  - **Identity Verification**: Validates employee existence against a mock HR company whitelist.
  - **Age Restriction**: Enforces eligibility (must be 18 or older to enroll).
  - **Anti-Duplication**: Prevents duplicate enrollment submissions.
- **Admin Dashboard**: HR/Admins can view all pending applications and instantly `Approve` or `Reject` them via state transitions.
- **Full-Stack Integration**: Reliable communication between the React frontend and PostgreSQL database.

## 🛠️ Tech Stack

- **Frontend**: React (Vite)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (with `pg` driver)

## 📦 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL installed and running locally

### 1. Database Setup
1. Open pgAdmin or your psql terminal.
2. Create a new database named `insurance_simulator`:
   ```sql
   CREATE DATABASE insurance_simulator;
   ```
3. Navigate to the `backend` folder and run the initialization script to create tables and insert mock data:
   ```bash
   cd backend
   node init_db.js
   ```

### 2. Environment Variables
In the `backend` directory, create a `.env` file with your PostgreSQL credentials:
```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=insurance_simulator
PORT=3000
```

### 3. Start the Backend Server
```bash
cd backend
npm install
npm run dev
```
The API will run on `http://localhost:3000`.

### 4. Start the Frontend Client
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The web application will open at `http://localhost:5173`.

## 💡 Usage Example

1. **Test Success**: Go to the **Employee Portal** and enroll with `alice@company.com` (if not already enrolled).
2. **Test Age Validation**: Try enrolling with `bob@company.com` (Minor, throws a 403 error).
3. **Test Unknown User**: Try enrolling with a random email (throws a 404 error).
4. **Admin Approval**: Switch to the **Admin Dashboard** via the top navigation bar to approve or reject pending requests.
