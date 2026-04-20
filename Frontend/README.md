# Calabarzon Research Information System (CRIS) - Frontend

## Overview

This is the React + Vite frontend for the Calabarzon Research Information System (CRIS). It provides a role-based dashboard interface for Super Admin, CHED, and HEI users.

## Requirements

- Node.js 18+
- npm

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Open Browser

Go to **http://localhost:5173**

## Login Credentials

| Role        | Email                    | Password   |
| ----------- | ------------------------ | ---------- |
| Super Admin | `superadmin@cris.gov.ph` | `password` |
| CHED        | `ched@cris.gov.ph`       | `password` |
| HEI         | `hei@edu.ph`             | `password` |

## Role Features

### Super Admin

- View all institutions and proposals
- Manage institutions (CRUD)
- Review all proposals
- System overview dashboard

### CHED Officer

- View all research proposals
- Review and approve/reject proposals
- Filter by status, institution, category

### HEI (Higher Education Institution)

- Submit new research proposals
- View own proposals
- Edit draft proposals

## Project Structure

```
Frontend/
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Sidebar navigation
│   ├── context/
│   │   └── AuthContext.jsx     # Authentication state
│   ├── pages/
│   │   ├── Login.jsx           # Login page
│   │   └── superadmin/
│   │       └── Dashboard.jsx   # Super Admin dashboard
│   │   └── ched/
│   │       └── Dashboard.jsx   # CHED dashboard
│   │   └── hei/
│   │       └── Dashboard.jsx   # HEI dashboard
│   ├── services/
│   │   └── api.js              # Axios API client
│   ├── App.jsx                 # Main app with routing
│   └── main.jsx                # Entry point
├── tailwind.config.js
└── vite.config.js
```

## API Configuration

The frontend connects to the Laravel backend at:

```
http://localhost:8000/api
```

API base URL can be changed in `src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});
```

## Technology Stack

- React 18
- Vite
- Tailwind CSS 3
- React Router DOM
- Axios
- Laravel Sanctum (Backend API)
