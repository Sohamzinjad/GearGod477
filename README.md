# GearGuard: Maintenance & Equipment Manager

**GearGuard** is a robust, role-based maintenance management system designed to streamline equipment tracking, maintenance requests, and workflow approvals. Built with a modern tech stack, it emulates the clean, functional aesthetic of Odoo while providing strict control over assignments and approvals.

---

## Key Features

### Maintenance Management

- **Role-Based Workflow**: Strict separation of duties between Admin, Manager, Technician, and Employee.
- **No Auto-Assignment**: All requests require explicit Admin/Manager approval to ensure accountability.
- **Request Lifecycle**: `Created` → `Pending Approval` → `Accepted` → `Assigned` → `In Progress` → `Completed`.
- **Kanban Board**: Drag-and-drop interface for managing maintenance stages (Odoo-style).
- **PDF Worksheets**: Generate and download printable worksheets for maintenance tasks.

### Equipment & Work Centers

- **Equipment Tracking**: Manage details, serial numbers, warranties, and categories.
- **Smart Maintenance History**: View all maintenance requests linked to specific equipment directly from the detail page.
- **Work Centers**: Organize equipment by location and responsible teams.

### Smart Dashboards

- **Admin**: Complete overview of all requests, approvals, and team workloads.
- **Manager**: Focus on team assignments and active requests.
- **Technician/Employee**: "My Requests" and "Assign to Me" capabilities.
- **Skeleton Loading**: Polished UI with smooth loading states.

---

##  Tech Stack

### Backend (`/app`)

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: SQLite with [SQLAlchemy](https://www.sqlalchemy.org/) ORM
- **Authentication**: OAuth2 with JWT Tokens
- **PDF Generation**: ReportLab

### Frontend (`/web`)

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: Lucide React
- **HTTP Client**: Axios

---

##  Project Structure

```bash
/project-root
├── app/                  # Backend Application
│   ├── routers/          # API Endpoints (auth, requests, equipment, etc.)
│   ├── models.py         # Database Models
│   ├── schemas.py        # Pydantic Schemas
│   ├── database.py       # DB Connection & Session
│   └── app.py            # Main Entry Point
├── web/                  # Frontend Application
│   ├── src/
│   │   ├── pages/        # Views (Dashboard, Kanban, Details)
│   │   ├── components/   # Reusable UI (Layout, Skeleton, Modal)
│   │   ├── api.ts        # Axios setup
│   │   └── context/      # Auth & Global State
│   └── index.html
└── README.md
```

---

## Setup & Installation

### Prerequisites

- Python 3.9+
- Node.js 16+ & npm

### 1. Backend Setup

Navigate to the `app` directory (or root, depending on where you run it from).

```bash
# Install dependencies
pip install -r app/requirements.txt

# Run the server
uvicorn app.app:app --reload
```

*The backend API will run at `http://127.0.0.1:8000`*
*Swagger Docs available at `http://127.0.0.1:8000/docs`*

### 2. Frontend Setup

Navigate to the `web` directory.

```bash
cd web

# Install dependencies
npm install

# Run the development server
npm run dev
```

*The frontend will run at `http://localhost:5173` (or similar)*

---

## UI/UX Philosophy

This project adheres to a **"Clean & Functional"** design system inspired by ERPs like Odoo.

- **Primary Color**: Odoo Purple (`#714B67`) & Teal (`#00A09D`)
- **Layout**: consistent headers, breadcrumbs, and action bars.
- **Feedback**: Skeleton loaders for perceived performance.
