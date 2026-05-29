<div align="center">

# 🧾 AI-FMS
### AI-Powered Financial & HR Management System

[![Laravel](https://img.shields.io/badge/Laravel-13.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-v2-9553E9?style=for-the-badge)](https://inertiajs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-8.3+-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://php.net)

A full-featured, open-source ERP for small & medium businesses.  
Manage **Accounting · Payroll · HRIS · Invoicing · Assets · Budgets · Tax** — all in one place, with an AI assistant powered by OpenAI.

[Live Demo](#demo-credentials) · [Installation](#installation) · [Features](#modules) · [Tech Stack](#tech-stack)

</div>

---

## ✨ What's Inside

| Module | Features |
|--------|----------|
| 📒 **Accounting** | Double-entry journals, Chart of accounts, Ledger, Trial balance |
| 🧾 **Invoicing** | Sales, Purchase, Proforma, Credit notes, GST/TDS, PDF, Payments |
| 💸 **Expenses** | Claims, Policies, Submit → Approve → Reject workflow |
| 🏦 **Banking** | Multi-account, Transactions, Reconciliation, Fund transfers |
| 👥 **Payroll & HR** | Salary structures, Payslip PDF, Payroll runs, HR dashboard |
| 🏢 **HRIS** | 9-tab employee dossier — Docs, Education, Experience, Assets, Leave, Tasks, Notes |
| 📅 **Attendance** | Monthly grid, Bulk marking, Per-employee report |
| 🌴 **Leave** | Types, Allocations, Apply/Approve, Balance with donut charts |
| 🖥️ **Assets** | Categories, Depreciation, Maintenance scheduling |
| 📦 **Purchase Orders** | Full PO lifecycle, GRN, vendor linking |
| 📊 **Budgets** | Line items, Cost centers, Variance analysis, AI forecasting |
| 📈 **Reports** | P&L, Balance Sheet, Cash Flow, Excel export |
| 🤖 **AI Assistant** | Chat, Financial analysis, Forecasting via OpenAI |
| ⚙️ **Settings** | RBAC (170+ permissions), 15 integrations, Audit log, Backups |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 13, PHP 8.3 |
| Frontend | React 18, Inertia.js v2 |
| UI | Tailwind CSS v3, ShadCN UI, Radix UI |
| Charts | Recharts |
| Auth | Laravel Sanctum + Spatie Permissions |
| AI | OpenAI PHP SDK |
| PDF | barryvdh/laravel-dompdf |
| Excel | Maatwebsite Excel |
| Activity Log | Spatie Activitylog |
| Backup | Spatie Laravel Backup |
| Queue | Redis (Predis) |
| JS Routes | Ziggy |

---

## ⚙️ Requirements

- PHP >= 8.3
- MySQL >= 8.0
- Node.js >= 20
- Composer >= 2.x
- OpenAI API key *(optional — for AI features)*

---

## 🚀 Installation

### 1. Clone the repo

```bash
git clone https://github.com/lalitaryan1993/laravel-finance-hr-erp.git
cd laravel-finance-hr-erp
```

### 2. Install dependencies

```bash
composer install
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
php artisan key:generate
```

Update `.env` with your database and optional API keys:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ai_fms
DB_USERNAME=root
DB_PASSWORD=

# Optional — AI features
OPENAI_API_KEY=sk-...
```

### 4. Migrate and seed

```bash
php artisan migrate
php artisan db:seed
```

### 5. Storage symlink

```bash
php artisan storage:link
```

### 6. Build and run

```bash
# Build frontend
npm run build

# Start (server + queue + vite hot reload — all in one)
composer dev
```

Visit **http://127.0.0.1:8000**

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | super@aifms.com | Admin@123 |
| Company Owner | owner@aifms.com | Admin@123 |
| Finance Manager | finance@aifms.com | Admin@123 |
| Accountant | accountant@aifms.com | Admin@123 |
| Auditor | auditor@aifms.com | Admin@123 |
| HR Manager | hr@aifms.com | Admin@123 |
| Employee | employee@aifms.com | Admin@123 |
| Analyst | analyst@aifms.com | Admin@123 |

---

## 📁 Project Structure

```
laravel-finance-hr-erp/
├── app/
│   ├── Http/Controllers/       # 25 controllers
│   └── Models/                 # 52 Eloquent models
├── database/
│   ├── migrations/             # 23 migrations (dated 2026_MM_DD)
│   └── seeders/                # Demo company, users & transactions
├── resources/js/
│   ├── components/ui/          # 19 reusable ShadCN components
│   ├── components/layout/      # Sidebar, Navbar, AppLayout
│   └── Pages/                  # 95+ Inertia page components
│       ├── Accounting/
│       ├── Invoicing/
│       ├── Payroll/
│       │   ├── Employees/      # HRIS dossier (9-tab profile)
│       │   ├── Attendance/     # Grid · Mark · Report
│       │   └── Leave/          # Types · Allocations · Balance
│       ├── Assets/
│       ├── Budget/
│       ├── Reports/
│       ├── Settings/
│       └── AI/
├── routes/
│   ├── web.php                 # All web routes
│   └── api.php                 # Sanctum REST API (v1)
└── PROGRESS.md                 # Detailed build progress tracker
```

---

## 🌟 Key Highlights

- **Multi-company** — company-scoped data isolation out of the box
- **RBAC** — 12 roles, 170+ granular permissions via Spatie
- **Dark Mode** — full light/dark theme via CSS variables
- **File Uploads** — employee documents stored on disk (PDF, JPG, PNG)
- **AI Assistant** — chat, financial analysis & forecasting via OpenAI
- **PDF Generation** — payslips & invoices via DomPDF
- **Excel Export** — all reports exportable
- **Audit Trail** — every action logged via Spatie Activitylog
- **Toast Notifications** — server flash messages as real-time toasts
- **REST API** — full Sanctum-protected API for mobile/integrations
- **Installer Wizard** — guided first-time setup flow

---

## 📄 License

MIT License — free for personal and commercial use.

---

<div align="center">
  Built with ❤️ using Laravel + React + Inertia.js
</div>
