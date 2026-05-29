# AI-FMS — AI-Powered Financial Management System

A full-featured, enterprise-grade Financial & HR Management System built with **Laravel 13**, **Inertia.js v2**, **React 18**, **Tailwind CSS v3**, and **ShadCN UI (Radix UI)**. Designed for small-to-medium businesses managing accounting, payroll, HR, assets, budgets, and more — with an AI assistant powered by OpenAI.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 13, PHP 8.3 |
| Frontend | React 18, Inertia.js v2 |
| Styling | Tailwind CSS v3, ShadCN UI, Radix UI |
| Charts | Recharts |
| Auth | Laravel Sanctum + Spatie Permissions (RBAC) |
| AI | OpenAI PHP SDK |
| PDF | barryvdh/laravel-dompdf |
| Excel | Maatwebsite Excel |
| Activity Log | Spatie Laravel Activitylog |
| Media | Spatie Laravel Medialibrary |
| Backup | Spatie Laravel Backup |
| Queue | Redis (Predis) |
| Routing | Ziggy (Laravel → JS routes) |

---

## Modules

### Accounting
- Chart of accounts with account groups
- Journal entries — create, post, void, reverse
- General ledger with opening balance
- Trial balance
- Bank reconciliation

### Invoicing
- Sales invoices, purchase invoices, proforma, credit notes, recurring invoices
- GST / TDS tax rates
- Payment recording and allocation
- PDF invoice generation and email sending
- Invoice templates

### Expenses
- Expense claims with categories and policies
- Submit → Approve → Reject workflow
- Receipt attachments

### Banking
- Multiple bank accounts
- Transaction import and categorization
- Bank reconciliation
- Fund transfers between accounts

### Payroll & HR
- **Departments** — create/manage, headcount tracking
- **Salary Structures** — dynamic earnings + deductions component builder
- **Employee HRIS Dossier** — 9-tab profile:
  - Overview, Personal details, Job & reporting
  - Emergency contacts, Dependents
  - Documents (with file upload — PDF/JPG/PNG)
  - Education & work experience history
  - Company asset tracking
  - Onboarding / offboarding lifecycle tasks
  - HR notes (general, performance, disciplinary, warning, commendation)
- **Attendance** — monthly grid view, bulk daily marking, per-employee report
- **Leave Management** — types, allocations, apply, approve/reject/cancel, balance view with donut charts
- Payroll runs and payslip PDF generation
- Payroll reports

### Tax
- GST returns and reports
- TDS deductions and reports
- Tax settings

### Assets
- Asset categories and registration
- Depreciation (straight-line), manual depreciation runs
- Maintenance scheduling and history

### Vendors & Customers
- Full vendor/customer profiles
- Customer statements and outstanding reports
- Vendor payment tracking

### Budgets
- Budget creation with line items and cost centers
- Approval workflow
- Variance analysis
- AI-powered forecasting

### Reports
- Profit & Loss
- Balance Sheet
- Cash Flow Statement
- Custom financial reports
- Excel export

### AI Assistant
- Chat-based financial assistant
- Transaction analysis
- Revenue / expense forecasting
- Powered by OpenAI GPT

### Settings
- Company profile and logo
- Role-based access control (12 roles, 170+ permissions)
- Email notifications
- 15 third-party integrations (Razorpay, Stripe, AWS S3, SMTP, Tally, Slack, WhatsApp, etc.)
- Audit logs
- Automated backups

---

## Requirements

- PHP >= 8.3
- MySQL >= 8.0
- Node.js >= 20
- Composer >= 2.x
- XAMPP / Laragon / any local server (or production server)
- OpenAI API key (optional — for AI features)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/AI-FMS.git
cd AI-FMS
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Install Node dependencies

```bash
npm install
```

### 4. Configure environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` and set your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ai_fms
DB_USERNAME=root
DB_PASSWORD=

# Optional — for AI features
OPENAI_API_KEY=sk-...

# Optional — for file storage on S3
FILESYSTEM_DISK=local
```

### 5. Run migrations and seed demo data

```bash
php artisan migrate
php artisan db:seed
```

### 6. Create storage symlink

```bash
php artisan storage:link
```

### 7. Build frontend assets

```bash
npm run build
```

### 8. Start the development server

```bash
# All-in-one (server + queue + logs + vite hot reload)
composer dev

# Or start individually:
php artisan serve
npm run dev
```

Visit `http://127.0.0.1:8000`

---

## Demo Credentials

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

## Project Structure

```
AI-FMS/
├── app/
│   ├── Http/Controllers/
│   │   ├── Auth/                    # Login, register, 2FA, password reset
│   │   ├── Accounting/              # Accounts, journals, ledger
│   │   ├── Payroll/                 # Employees, attendance, leave, HR, departments
│   │   └── ...                      # Invoicing, banking, assets, budgets, etc.
│   └── Models/                      # 52 Eloquent models
├── database/
│   ├── migrations/                  # 23 migration files (dated 2026_MM_DD)
│   └── seeders/                     # Demo data (company, 8 users, full transactions)
├── resources/
│   └── js/
│       ├── components/
│       │   ├── ui/                  # 19 reusable UI components (ShadCN-based)
│       │   └── layout/              # Sidebar, Navbar, AppLayout
│       └── Pages/                   # 95+ Inertia page components
│           ├── Accounting/
│           ├── Invoicing/
│           ├── Payroll/
│           │   ├── Employees/       # HRIS dossier (Show, Edit, Index, Create)
│           │   ├── Attendance/      # Grid, Mark, Report
│           │   └── Leave/           # Types, Allocations, Apply, Balance, Index
│           ├── Assets/
│           ├── Budget/
│           ├── Reports/
│           ├── Settings/
│           └── AI/
├── routes/
│   ├── web.php                      # All web routes
│   └── api.php                      # Sanctum-protected REST API (v1)
└── PROGRESS.md                      # Detailed build progress tracker
```

---

## Key Features

- **Multi-company** architecture with company-scoped data isolation
- **Role-based access control** — 12 roles, 170+ granular permissions via Spatie
- **Dark mode** — full light/dark theme support via CSS variables
- **File uploads** — employee documents (PDF, JPG, PNG) stored on disk with storage link
- **AI-powered** — chat assistant, financial analysis, and forecasting via OpenAI
- **PDF generation** — payslips and invoices via DomPDF
- **Excel export** — reports exportable via Maatwebsite Excel
- **Audit trail** — every action logged via Spatie Activitylog
- **Toast notifications** — all server flash messages shown as real-time toasts
- **Installer wizard** — guided setup flow for first-time deployment
- **REST API** — full Sanctum-protected API for mobile and third-party integrations

---

## License

MIT — free for personal and commercial use.
