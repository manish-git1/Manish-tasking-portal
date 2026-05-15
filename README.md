# Manish Tasking Portal — Crew Operations Hub

A distinctive team operations platform built with Next.js. WorkSpan helps crews assign work lanes, track momentum, handle extension requests, and stay aligned — with separate views for leads and contributors.

## 🚀 Features

### Admin Capabilities
- **Overview Dashboard**: Beautiful analytics and charts built with Recharts.
- **Task Control Panel**: Full CRUD control over tasks, assignments, and priorities.
- **User Management**: Create team members, assign departments, and toggle active status.
- **Request Management**: Approve or deny reschedule requests from members.

### Member Capabilities
- **My Tasks**: View personal tasks with filterable list and Kanban views.
- **Task Details**: Add comments, track progress, and update status.
- **Reschedule Requests**: Form to request deadline extensions if a task is overdue.
- **Notifications**: Real-time alerts for task updates and assignments.

### Security & Tech Stack
- **Frontend**: Next.js 14 App Router, React, Tailwind CSS, ShadCN UI, Zustand, Framer Motion.
- **Backend**: Next.js API Routes, MongoDB + Mongoose, JWT HTTP-only cookies, bcrypt.
- **Design**: Fully responsive, Dark/Light mode, beautiful glassmorphism gradients.

## 🛠️ Setup & Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env.local` file in the root directory (or update the provided one):
   ```env
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/taskflow?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   ```

3. **Seed the database** (creates default admin):
   ```bash
   npm run seed
   ```
   **Default Credentials**: `admin@taskflow.com` / `Admin@123`

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment (Railway)

This project is configured for seamless deployment on Railway.

1. Connect your GitHub repository to Railway.
2. Add a **MongoDB** database plugin in Railway.
3. Link the frontend service and set the following environment variables:
   - `MONGODB_URI` (from your MongoDB service)
   - `JWT_SECRET` (generate a random string)
   - `NODE_ENV=production`
4. Railway will automatically build and deploy using the `railway.toml` config (`npm run build && npm start`).
