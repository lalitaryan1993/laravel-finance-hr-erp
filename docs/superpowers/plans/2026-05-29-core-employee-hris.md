# Core Employee HRIS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first HRIS foundation slice: richer employee master records, employee sub-records, employee profile tabs, and developer reference docs.

**Architecture:** Add company-scoped HRIS tables linked to `employees`, expose nested employee HR routes through a focused controller, and render the employee profile as a tabbed HR dossier. Keep existing payroll, attendance, and leave behavior intact while adding richer employee context.

**Tech Stack:** Laravel 13, Inertia.js, React 18, Tailwind CSS, ShadCN-style local UI components, PHPUnit feature tests.

---

## File Structure

- Create `database/migrations/2026_05_29_000001_add_core_hris_to_employees.php`
  - Adds employee HR fields and new HRIS sub-record tables.
- Create models under `app/Models/`
  - `EmployeeEmergencyContact.php`
  - `EmployeeDocument.php`
  - `EmployeeEducation.php`
  - `EmployeeExperience.php`
  - `EmployeeDependent.php`
  - `EmployeeAsset.php`
  - `EmployeeLifecycleTask.php`
  - `EmployeeNote.php`
- Modify `app/Models/Employee.php`
  - Add fillable fields and relationships.
- Create `app/Http/Controllers/Payroll/EmployeeHrController.php`
  - Handles nested HRIS sub-record writes.
- Modify `app/Http/Controllers/Payroll/EmployeeController.php`
  - Adds index stats, filters, richer show payload, and HR field updates.
- Modify `routes/web.php`
  - Adds nested employee HRIS routes.
- Create `tests/Feature/Payroll/CoreEmployeeHrisTest.php`
  - Covers company scoping, sub-record writes, profile payloads, and lifecycle task completion.
- Modify frontend:
  - `resources/js/Pages/Payroll/Employees/Index.jsx`
  - `resources/js/Pages/Payroll/Employees/Show.jsx`
  - `resources/js/Pages/Payroll/Employees/Edit.jsx`
- Create docs:
  - `docs/hris-reference.md`
- Modify `PROGRESS.md`
  - Record completed HRIS foundation features.

No git commits are included because `C:\xampp\htdocs\AI-FMS` is not currently a git repository.

---

### Task 1: Database, Models, And Relationships

**Files:**
- Create: `database/migrations/2026_05_29_000001_add_core_hris_to_employees.php`
- Create: `app/Models/EmployeeEmergencyContact.php`
- Create: `app/Models/EmployeeDocument.php`
- Create: `app/Models/EmployeeEducation.php`
- Create: `app/Models/EmployeeExperience.php`
- Create: `app/Models/EmployeeDependent.php`
- Create: `app/Models/EmployeeAsset.php`
- Create: `app/Models/EmployeeLifecycleTask.php`
- Create: `app/Models/EmployeeNote.php`
- Modify: `app/Models/Employee.php`
- Test: `tests/Feature/Payroll/CoreEmployeeHrisTest.php`

- [ ] **Step 1: Write failing model relationship test**

Create `tests/Feature/Payroll/CoreEmployeeHrisTest.php` with a test that creates a company, user, employee, emergency contact, document, asset, and lifecycle task, then asserts the employee relationships load those records.

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/Payroll/CoreEmployeeHrisTest.php --filter=employee_loads_core_hris_relationships`

Expected: FAIL because the models and relationships do not exist.

- [ ] **Step 3: Add migration**

Add employee HR fields:

- `gender`
- `marital_status`
- `blood_group`
- `personal_email`
- `current_address`
- `permanent_address`
- `reporting_manager_id`
- `work_location`
- `probation_end_date`
- `confirmation_date`
- `notice_period_days`
- `exit_date`
- `exit_reason`
- `rehire_eligible`
- `exit_notes`

Add the eight HRIS sub-record tables defined in `docs/superpowers/specs/2026-05-29-core-employee-hris-design.md`.

- [ ] **Step 4: Add models and relationships**

Each model must include:

- `HasFactory`
- guarded or fillable fields
- casts for dates, booleans, and decimals
- `employee()` relationship
- `company()` relationship
- `scopeForCompany($query, $companyId)`

Update `Employee` with fillable fields, casts, and relationships.

- [ ] **Step 5: Run migration and relationship test**

Run:

```bash
php artisan migrate
php artisan test tests/Feature/Payroll/CoreEmployeeHrisTest.php --filter=employee_loads_core_hris_relationships
```

Expected: PASS.

---

### Task 2: Nested HRIS Controller And Routes

**Files:**
- Create: `app/Http/Controllers/Payroll/EmployeeHrController.php`
- Modify: `routes/web.php`
- Test: `tests/Feature/Payroll/CoreEmployeeHrisTest.php`

- [ ] **Step 1: Write failing company scoping and CRUD tests**

Add tests for:

- User can add an emergency contact to an employee in their company.
- User cannot add a document to another company's employee.
- Setting a primary emergency contact makes previous primary contacts non-primary.
- Completing a lifecycle task sets `completed_at` and `completed_by`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `php artisan test tests/Feature/Payroll/CoreEmployeeHrisTest.php`

Expected: FAIL because routes and controller actions do not exist.

- [ ] **Step 3: Implement `EmployeeHrController`**

Controller methods:

- `updateHr(Request $request, Employee $employee)`
- `storeEmergencyContact(Request $request, Employee $employee)`
- `updateEmergencyContact(Request $request, Employee $employee, EmployeeEmergencyContact $contact)`
- `destroyEmergencyContact(Request $request, Employee $employee, EmployeeEmergencyContact $contact)`
- Equivalent `store`, `update`, `destroy` methods for documents, education, experience, dependents, assets, lifecycle tasks, and notes.
- `completeLifecycleTask(Request $request, Employee $employee, EmployeeLifecycleTask $task)`

Every action must:

- Assert `$employee->company_id === $request->user()->company_id`.
- Assert nested record belongs to the same employee and company before update/delete.
- Redirect back with success flash.

- [ ] **Step 4: Register routes**

Add nested routes under the existing authenticated `payroll` group, after `Route::resource('employees', EmployeeController::class);`.

- [ ] **Step 5: Run controller tests**

Run: `php artisan test tests/Feature/Payroll/CoreEmployeeHrisTest.php`

Expected: PASS.

---

### Task 3: Employee Index Stats And Filters

**Files:**
- Modify: `app/Http/Controllers/Payroll/EmployeeController.php`
- Modify: `resources/js/Pages/Payroll/Employees/Index.jsx`
- Test: `tests/Feature/Payroll/CoreEmployeeHrisTest.php`

- [ ] **Step 1: Write failing index payload test**

Test that `/payroll/employees` returns Inertia props:

- `stats.active`
- `stats.onboarding`
- `stats.probation`
- `stats.incomplete_profiles`
- `stats.documents_expiring`

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/Payroll/CoreEmployeeHrisTest.php --filter=employee_index_includes_hris_stats`

Expected: FAIL because `stats` is missing.

- [ ] **Step 3: Update controller**

Add:

- employment type filter
- profile completeness filter
- stats counts
- eager loading for department and reporting manager

Profile completeness is complete when an employee has:

- first name
- email or phone
- department
- designation
- date of joining
- at least one emergency contact
- at least one document

- [ ] **Step 4: Update React index**

Add:

- stat cards
- employment type filter
- completeness filter
- reporting manager column
- completeness badge/bar
- quick action buttons

- [ ] **Step 5: Verify**

Run:

```bash
php artisan test tests/Feature/Payroll/CoreEmployeeHrisTest.php --filter=employee_index_includes_hris_stats
npm run build
```

Expected: PASS.

---

### Task 4: Employee Profile HR Dossier

**Files:**
- Modify: `app/Http/Controllers/Payroll/EmployeeController.php`
- Modify: `resources/js/Pages/Payroll/Employees/Show.jsx`
- Test: `tests/Feature/Payroll/CoreEmployeeHrisTest.php`

- [ ] **Step 1: Write failing profile payload test**

Test that `/payroll/employees/{employee}` returns employee relationships:

- `emergency_contacts`
- `documents`
- `educations`
- `experiences`
- `dependents`
- `assigned_assets`
- `lifecycle_tasks`
- `notes`
- `reporting_manager`

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/Payroll/CoreEmployeeHrisTest.php --filter=employee_profile_includes_hris_relationships`

Expected: FAIL because the show payload does not load the new relationships.

- [ ] **Step 3: Update show controller**

Load all relationships and send option data needed for forms:

- employees for reporting manager choices
- HR document type options
- lifecycle task type options
- asset status options

- [ ] **Step 4: Rebuild `Show.jsx`**

Use tabs:

- Overview
- Personal
- Job
- Documents
- Education & Experience
- Assets
- Lifecycle
- Payroll
- Notes

Each tab must render a meaningful empty state and at least one add/edit dialog for its sub-record type.

- [ ] **Step 5: Verify**

Run:

```bash
php artisan test tests/Feature/Payroll/CoreEmployeeHrisTest.php --filter=employee_profile_includes_hris_relationships
npm run build
```

Expected: PASS.

---

### Task 5: Employee Edit HR Fields

**Files:**
- Modify: `app/Http/Controllers/Payroll/EmployeeController.php`
- Modify: `resources/js/Pages/Payroll/Employees/Edit.jsx`
- Test: `tests/Feature/Payroll/CoreEmployeeHrisTest.php`

- [ ] **Step 1: Write failing HR field update test**

Test that updating an employee can save:

- personal email
- current address
- work location
- probation end date
- reporting manager
- notice period

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/Payroll/CoreEmployeeHrisTest.php --filter=employee_hr_fields_can_be_updated`

Expected: FAIL because validation and fillable fields are missing or incomplete.

- [ ] **Step 3: Update validation and edit props**

Add validation for all new employee HR fields and pass manager choices to the edit page.

- [ ] **Step 4: Update edit UI**

Add compact sections:

- Personal HR Details
- Job & Reporting
- Exit Details

- [ ] **Step 5: Verify**

Run:

```bash
php artisan test tests/Feature/Payroll/CoreEmployeeHrisTest.php --filter=employee_hr_fields_can_be_updated
npm run build
```

Expected: PASS.

---

### Task 6: Reference Docs And Progress

**Files:**
- Create: `docs/hris-reference.md`
- Modify: `PROGRESS.md`

- [ ] **Step 1: Create HRIS reference**

Document:

- New tables.
- New models and relationships.
- New routes.
- Employee profile tab responsibilities.
- Future HRIS slices.

- [ ] **Step 2: Update progress**

Add a dated section noting:

- Core HRIS employee dossier.
- HR sub-record tables.
- Employee list HR stats.
- Employee profile tabs.
- Remaining future HR slices.

- [ ] **Step 3: Final verification**

Run:

```bash
php artisan test tests/Feature/Payroll/CoreEmployeeHrisTest.php
npm run build
```

Expected: all tests pass and frontend builds successfully.

