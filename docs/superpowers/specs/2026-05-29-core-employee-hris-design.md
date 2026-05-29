# Core Employee HRIS Design

Date: 2026-05-29
Project: AI-FMS
Area: Payroll & HR

## Goal

Upgrade the current HR module from basic employee CRUD into a practical HRIS foundation that supports day-to-day HR operations and becomes the reference point for later attendance, leave, payroll, performance, and compliance work.

The first implementation slice focuses on employee master data and lifecycle records. It should make `/payroll/employees` useful for HR managers, company owners, and auditors without requiring a complete rewrite of payroll or attendance.

## Current State

The system already has:

- Employee CRUD with departments, salary structures, basic salary, bank details, and status.
- Departments.
- Attendance monthly grid, daily bulk marking, and attendance report.
- Leave types, leave requests, allocations, and balance pages.
- Payroll runs, payslips, salary structures, and reports.
- Sidebar links for HR dashboard, employees, attendance, leave, and payroll pages.

Main gaps:

- Employee profile is shallow and does not act as a full HR dossier.
- Important HR records are missing: emergency contacts, identity/KYC documents, education, previous employment, dependents, assets issued, onboarding tasks, offboarding tasks, and internal notes.
- Employee list lacks HR completeness, lifecycle visibility, and operational quick filters.
- Employee-related data is not yet organized as reusable domain tables.
- Payroll still does not use dynamic salary structure components.
- Attendance and leave rules are basic and do not yet model policies, shifts, holidays, regularization, or comp off.

## Scope

This design covers the first HRIS foundation slice:

- Rich employee profile data model.
- Employee list improvements.
- Employee profile tabs.
- CRUD flows for employee sub-records.
- Basic onboarding/offboarding checklist management.
- Documentation updates for future developers.

This design does not implement advanced attendance, leave policy engines, performance management, recruitment, or full statutory payroll. Those are later slices built on this foundation.

## Data Model

Add new company-scoped tables linked to employees:

- `employee_emergency_contacts`
  - employee, company, name, relationship, phone, alternate_phone, email, address, is_primary.
- `employee_documents`
  - employee, company, document_type, document_number, issue_date, expiry_date, file_path, status, notes.
  - Types include aadhaar, pan, passport, driving_license, offer_letter, contract, resume, certificate, other.
- `employee_educations`
  - employee, company, qualification, institution, field_of_study, start_year, end_year, grade, notes.
- `employee_experiences`
  - employee, company, employer_name, job_title, start_date, end_date, location, responsibilities, last_salary, reason_for_leaving.
- `employee_dependents`
  - employee, company, name, relationship, date_of_birth, phone, is_nominee, notes.
- `employee_assets`
  - employee, company, asset_name, asset_code, category, issued_on, return_due_on, returned_on, condition_issued, condition_returned, status, notes.
- `employee_lifecycle_tasks`
  - employee, company, type (`onboarding` or `offboarding`), title, description, due_date, completed_at, completed_by, status, sort_order.
- `employee_notes`
  - employee, company, note_type, body, visibility, created_by.

Extend `employees` with optional HR fields:

- personal: gender, marital_status, blood_group, personal_email, current_address, permanent_address.
- job: reporting_manager_id, work_location, probation_end_date, confirmation_date, notice_period_days.
- exit: exit_date, exit_reason, rehire_eligible, exit_notes.

All records must be scoped by `company_id`. Controllers should reject access to records outside the authenticated user's company.

## Backend Design

Add models:

- `EmployeeEmergencyContact`
- `EmployeeDocument`
- `EmployeeEducation`
- `EmployeeExperience`
- `EmployeeDependent`
- `EmployeeAsset`
- `EmployeeLifecycleTask`
- `EmployeeNote`

Update `Employee` relationships:

- `emergencyContacts()`
- `documents()`
- `educations()`
- `experiences()`
- `dependents()`
- `assignedAssets()`
- `lifecycleTasks()`
- `notes()`
- `reportingManager()`

Controller approach:

- Keep `EmployeeController` responsible for employee master data and profile payloads.
- Add a focused `EmployeeHrController` for sub-record store, update, and delete actions.
- Use route names under `payroll.employees.*` so all HRIS actions stay discoverable near employees.

Routes:

- `GET /payroll/employees`
- `GET /payroll/employees/{employee}`
- `PUT /payroll/employees/{employee}/hr`
- `POST /payroll/employees/{employee}/emergency-contacts`
- `PUT /payroll/employees/{employee}/emergency-contacts/{contact}`
- `DELETE /payroll/employees/{employee}/emergency-contacts/{contact}`
- Equivalent nested routes for documents, education, experience, dependents, assets, lifecycle tasks, and notes.

## Frontend Design

Employee list:

- Keep the current table pattern.
- Add top summary cards: active, onboarding, probation, incomplete profiles, documents expiring.
- Add filters: department, status, employment type, profile completeness.
- Add columns: reporting manager, employment type, joining date, HR completeness.
- Add quick actions: view profile, edit, add document, start onboarding.

Employee profile:

- Convert `Payroll/Employees/Show.jsx` into a tabbed HR dossier.
- Tabs:
  - Overview: identity, job, salary, manager, department, key dates, completeness.
  - Personal: contact, addresses, emergency contacts, dependents.
  - Job: department, designation, manager, employment type, probation, work location.
  - Documents: KYC and HR files, expiry/status indicators.
  - Education & Experience: qualifications and previous employment.
  - Assets: issued company assets and return status.
  - Lifecycle: onboarding/offboarding checklist.
  - Payroll: salary structure, basic salary, recent payslips.
  - Notes: internal HR notes.

Forms:

- Use existing dialog/card UI patterns.
- Keep forms compact and operational, not marketing-style.
- Allow adding sub-records from the relevant tab.
- Use clear empty states with action buttons.

## Data Flow

1. Employee index requests summary stats, paginated employees, departments, and filters.
2. Employee show loads employee plus all HR relationships needed for tabs.
3. Sub-record actions post to nested routes.
4. Controller validates company ownership and saves records.
5. User returns to the same employee profile tab via Inertia preserve-state behavior where practical.

## Validation And Rules

- Employee document expiry date may be null, but if present it must be after issue date.
- Only one emergency contact can be primary per employee.
- Lifecycle task status values: pending, in_progress, completed, skipped.
- Asset status values: issued, returned, lost, damaged.
- Onboarding/offboarding task type is required.
- Notes default to internal visibility.
- Deleting an employee should not physically delete HR history because employees already soft delete.

## Testing

Backend feature tests:

- Employee profile page returns HR relationship payloads for the user's company.
- A user cannot create or modify HR records for another company's employee.
- Emergency primary contact uniqueness is enforced per employee.
- Document date validation works.
- Lifecycle task completion records `completed_at` and `completed_by`.
- Employee index summary counts are correct.

Frontend verification:

- `npm run build` must pass.
- Employee list renders with existing data.
- Employee profile tabs render with empty states.
- Add/edit/delete dialogs work for at least emergency contacts, documents, assets, and lifecycle tasks.

## Rollout Plan

Phase 1:

- Database migration and models.
- Relationships on `Employee`.
- `EmployeeHrController` and nested routes.
- Feature tests for company scoping and core sub-record writes.

Phase 2:

- Employee index stats and filters.
- Employee show tabbed HR dossier.
- Dialog CRUD for contacts, documents, education, experience, dependents, assets, lifecycle tasks, and notes.
- Build verification.

Phase 3:

- Improve create/edit employee forms with additional HR fields.
- Update `PROGRESS.md`.
- Add a developer reference doc summarizing HR routes, tables, and future modules.

## Future HRIS Slices

Attendance + Leave Pro:

- Shifts, holidays, weekly offs, late rules, overtime, attendance regularization, comp off, and leave calendar.

Payroll Pro:

- Salary structure component calculations, LOP from attendance and unpaid leave, bonuses, reimbursements, statutory deductions, payroll approval, and journal integration.

Performance:

- Goals, review cycles, ratings, feedback, increments, promotion history, and appraisal letters.

Recruitment:

- Job openings, candidates, interview stages, offers, and conversion to employee.

Compliance:

- Document expiry alerts, statutory IDs, audit-ready HR reports, and configurable HR policies.

