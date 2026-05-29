# HRIS Reference

Date: 2026-05-29

## Overview

The HRIS foundation extends Payroll & HR beyond basic employee CRUD. The employee profile is now the central HR dossier for identity, job details, documents, emergency contacts, education, experience, dependents, issued assets, lifecycle tasks, payroll history, and internal HR notes.

## Tables

- `employees`
  - Added HR fields: gender, marital status, blood group, personal email, addresses, reporting manager, work location, probation, confirmation, notice period, and exit details.
- `employee_emergency_contacts`
- `employee_documents`
- `employee_educations`
- `employee_experiences`
- `employee_dependents`
- `employee_assets`
- `employee_lifecycle_tasks`
- `employee_notes`

All HRIS child tables include `company_id` and `employee_id`.

## Models

- `EmployeeEmergencyContact`
- `EmployeeDocument`
- `EmployeeEducation`
- `EmployeeExperience`
- `EmployeeDependent`
- `EmployeeAsset`
- `EmployeeLifecycleTask`
- `EmployeeNote`

`Employee` relationships:

- `reportingManager()`
- `emergencyContacts()`
- `documents()`
- `educations()`
- `experiences()`
- `dependents()`
- `assignedAssets()`
- `lifecycleTasks()`
- `notes()`

Note: `employees.documents` existed as a JSON column before this HRIS upgrade. The `documents()` relation is explicitly loaded into the Inertia employee payload so the frontend receives HR documents at `employee.documents`.

## Routes

Nested under `/payroll/employees/{employee}`:

- `PUT /hr`
- `POST|PUT|DELETE /emergency-contacts`
- `POST|PUT|DELETE /documents`
- `POST|PUT|DELETE /educations`
- `POST|PUT|DELETE /experiences`
- `POST|PUT|DELETE /dependents`
- `POST|PUT|DELETE /assets`
- `POST|PUT|DELETE /lifecycle-tasks`
- `POST /lifecycle-tasks/{task}/complete`
- `POST|PUT|DELETE /notes`

All write actions are handled by `App\Http\Controllers\Payroll\EmployeeHrController`.

## UI

- `Payroll/Employees/Index.jsx`
  - HR stats: active, onboarding, probation, incomplete profiles, expiring documents.
  - Filters: department, status, employment type, profile completeness.
  - Table additions: reporting manager, employment type, profile completeness.
- `Payroll/Employees/Show.jsx`
  - Tabbed HR dossier: overview, personal, job, documents, education and experience, assets, lifecycle, payroll, notes.
  - Add-record dialogs for every HRIS child record type.
- `Payroll/Employees/Edit.jsx`
  - HR fields for personal details, reporting, work location, probation, confirmation, notice period, and exit.

## Verification

Focused tests live in:

- `tests/Feature/Payroll/CoreEmployeeHrisTest.php`

This local PHP runtime does not have the SQLite PDO driver, so the HRIS feature test class normalizes itself to the local MySQL `ai_fms` connection and cleans up the companies it creates.

Run:

```bash
php artisan test tests/Feature/Payroll/CoreEmployeeHrisTest.php
npm run build
```

## Future Slices

- Attendance + Leave Pro: shifts, holidays, weekly offs, late rules, overtime, attendance regularization, comp off, and leave calendar.
- Payroll Pro: salary-structure component calculation, LOP from attendance and unpaid leave, bonuses, reimbursements, statutory deductions, approvals, and journal integration.
- Performance: goals, review cycles, ratings, increments, promotions, and appraisal letters.
- Recruitment: openings, candidates, interviews, offers, and employee conversion.
- Compliance: document expiry alerts, HR policy configuration, audit reports, and statutory reporting.

