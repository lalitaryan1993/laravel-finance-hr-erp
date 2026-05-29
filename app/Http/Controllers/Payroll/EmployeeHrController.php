<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeAsset;
use App\Models\EmployeeDependent;
use App\Models\EmployeeDocument;
use App\Models\EmployeeEducation;
use App\Models\EmployeeEmergencyContact;
use App\Models\EmployeeExperience;
use App\Models\EmployeeLifecycleTask;
use App\Models\EmployeeNote;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class EmployeeHrController extends Controller
{
    public function updateHr(Request $request, Employee $employee)
    {
        $this->authorizeEmployee($request, $employee);

        $data = $request->validate($this->employeeHrRules($employee));
        $employee->update($data);

        return back()->with('success', 'Employee HR details updated.');
    }

    public function storeEmergencyContact(Request $request, Employee $employee)
    {
        $this->authorizeEmployee($request, $employee);
        $data = $request->validate($this->emergencyContactRules());

        if ($data['is_primary'] ?? false) {
            $employee->emergencyContacts()->update(['is_primary' => false]);
        }

        $employee->emergencyContacts()->create($this->withCompany($request, $data));

        return back()->with('success', 'Emergency contact added.');
    }

    public function updateEmergencyContact(Request $request, Employee $employee, EmployeeEmergencyContact $contact)
    {
        $this->authorizeRecord($request, $employee, $contact);
        $data = $request->validate($this->emergencyContactRules());

        if ($data['is_primary'] ?? false) {
            $employee->emergencyContacts()->whereKeyNot($contact->id)->update(['is_primary' => false]);
        }

        $contact->update($data);

        return back()->with('success', 'Emergency contact updated.');
    }

    public function destroyEmergencyContact(Request $request, Employee $employee, EmployeeEmergencyContact $contact)
    {
        return $this->destroyRecord($request, $employee, $contact, 'Emergency contact removed.');
    }

    public function storeDocument(Request $request, Employee $employee)
    {
        $this->authorizeEmployee($request, $employee);
        $employee->documents()->create($this->withCompany($request, $request->validate($this->documentRules())));

        return back()->with('success', 'Employee document added.');
    }

    public function updateDocument(Request $request, Employee $employee, EmployeeDocument $document)
    {
        $this->authorizeRecord($request, $employee, $document);
        $document->update($request->validate($this->documentRules()));

        return back()->with('success', 'Employee document updated.');
    }

    public function destroyDocument(Request $request, Employee $employee, EmployeeDocument $document)
    {
        return $this->destroyRecord($request, $employee, $document, 'Employee document removed.');
    }

    public function storeEducation(Request $request, Employee $employee)
    {
        $this->authorizeEmployee($request, $employee);
        $employee->educations()->create($this->withCompany($request, $request->validate($this->educationRules())));

        return back()->with('success', 'Education record added.');
    }

    public function updateEducation(Request $request, Employee $employee, EmployeeEducation $education)
    {
        $this->authorizeRecord($request, $employee, $education);
        $education->update($request->validate($this->educationRules()));

        return back()->with('success', 'Education record updated.');
    }

    public function destroyEducation(Request $request, Employee $employee, EmployeeEducation $education)
    {
        return $this->destroyRecord($request, $employee, $education, 'Education record removed.');
    }

    public function storeExperience(Request $request, Employee $employee)
    {
        $this->authorizeEmployee($request, $employee);
        $employee->experiences()->create($this->withCompany($request, $request->validate($this->experienceRules())));

        return back()->with('success', 'Experience record added.');
    }

    public function updateExperience(Request $request, Employee $employee, EmployeeExperience $experience)
    {
        $this->authorizeRecord($request, $employee, $experience);
        $experience->update($request->validate($this->experienceRules()));

        return back()->with('success', 'Experience record updated.');
    }

    public function destroyExperience(Request $request, Employee $employee, EmployeeExperience $experience)
    {
        return $this->destroyRecord($request, $employee, $experience, 'Experience record removed.');
    }

    public function storeDependent(Request $request, Employee $employee)
    {
        $this->authorizeEmployee($request, $employee);
        $employee->dependents()->create($this->withCompany($request, $request->validate($this->dependentRules())));

        return back()->with('success', 'Dependent added.');
    }

    public function updateDependent(Request $request, Employee $employee, EmployeeDependent $dependent)
    {
        $this->authorizeRecord($request, $employee, $dependent);
        $dependent->update($request->validate($this->dependentRules()));

        return back()->with('success', 'Dependent updated.');
    }

    public function destroyDependent(Request $request, Employee $employee, EmployeeDependent $dependent)
    {
        return $this->destroyRecord($request, $employee, $dependent, 'Dependent removed.');
    }

    public function storeAsset(Request $request, Employee $employee)
    {
        $this->authorizeEmployee($request, $employee);
        $employee->assignedAssets()->create($this->withCompany($request, $request->validate($this->assetRules())));

        return back()->with('success', 'Asset issued.');
    }

    public function updateAsset(Request $request, Employee $employee, EmployeeAsset $asset)
    {
        $this->authorizeRecord($request, $employee, $asset);
        $asset->update($request->validate($this->assetRules()));

        return back()->with('success', 'Asset record updated.');
    }

    public function destroyAsset(Request $request, Employee $employee, EmployeeAsset $asset)
    {
        return $this->destroyRecord($request, $employee, $asset, 'Asset record removed.');
    }

    public function storeLifecycleTask(Request $request, Employee $employee)
    {
        $this->authorizeEmployee($request, $employee);
        $employee->lifecycleTasks()->create($this->withCompany($request, $request->validate($this->lifecycleTaskRules())));

        return back()->with('success', 'Lifecycle task added.');
    }

    public function updateLifecycleTask(Request $request, Employee $employee, EmployeeLifecycleTask $task)
    {
        $this->authorizeRecord($request, $employee, $task);
        $task->update($request->validate($this->lifecycleTaskRules()));

        return back()->with('success', 'Lifecycle task updated.');
    }

    public function completeLifecycleTask(Request $request, Employee $employee, EmployeeLifecycleTask $task)
    {
        $this->authorizeRecord($request, $employee, $task);

        $task->update([
            'status' => 'completed',
            'completed_at' => now(),
            'completed_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Lifecycle task completed.');
    }

    public function destroyLifecycleTask(Request $request, Employee $employee, EmployeeLifecycleTask $task)
    {
        return $this->destroyRecord($request, $employee, $task, 'Lifecycle task removed.');
    }

    public function storeNote(Request $request, Employee $employee)
    {
        $this->authorizeEmployee($request, $employee);
        $employee->notes()->create($this->withCompany($request, array_merge(
            $request->validate($this->noteRules()),
            ['created_by' => $request->user()->id]
        )));

        return back()->with('success', 'HR note added.');
    }

    public function updateNote(Request $request, Employee $employee, EmployeeNote $note)
    {
        $this->authorizeRecord($request, $employee, $note);
        $note->update($request->validate($this->noteRules()));

        return back()->with('success', 'HR note updated.');
    }

    public function destroyNote(Request $request, Employee $employee, EmployeeNote $note)
    {
        return $this->destroyRecord($request, $employee, $note, 'HR note removed.');
    }

    private function authorizeEmployee(Request $request, Employee $employee): void
    {
        abort_unless($employee->company_id === $request->user()->company_id, 403);
    }

    private function authorizeRecord(Request $request, Employee $employee, Model $record): void
    {
        $this->authorizeEmployee($request, $employee);
        abort_unless(
            $record->company_id === $employee->company_id && $record->employee_id === $employee->id,
            403
        );
    }

    private function destroyRecord(Request $request, Employee $employee, Model $record, string $message)
    {
        $this->authorizeRecord($request, $employee, $record);
        $record->delete();

        return back()->with('success', $message);
    }

    private function withCompany(Request $request, array $data): array
    {
        return array_merge($data, ['company_id' => $request->user()->company_id]);
    }

    private function employeeHrRules(Employee $employee): array
    {
        return [
            'gender' => 'nullable|string|max:30',
            'marital_status' => 'nullable|string|max:30',
            'blood_group' => 'nullable|string|max:10',
            'personal_email' => 'nullable|email|max:255',
            'current_address' => 'nullable|string|max:1000',
            'permanent_address' => 'nullable|string|max:1000',
            'reporting_manager_id' => 'nullable|exists:employees,id',
            'work_location' => 'nullable|string|max:100',
            'probation_end_date' => 'nullable|date',
            'confirmation_date' => 'nullable|date',
            'notice_period_days' => 'nullable|integer|min:0|max:365',
            'exit_date' => 'nullable|date',
            'exit_reason' => 'nullable|string|max:100',
            'rehire_eligible' => 'boolean',
            'exit_notes' => 'nullable|string|max:1000',
        ];
    }

    private function emergencyContactRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'relationship' => 'required|string|max:100',
            'phone' => 'required|string|max:30',
            'alternate_phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:1000',
            'is_primary' => 'boolean',
        ];
    }

    private function documentRules(): array
    {
        return [
            'document_type' => 'required|string|max:50',
            'document_number' => 'nullable|string|max:100',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after_or_equal:issue_date',
            'file_path' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:pending,verified,rejected,expired',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    private function educationRules(): array
    {
        return [
            'qualification' => 'required|string|max:150',
            'institution' => 'nullable|string|max:255',
            'field_of_study' => 'nullable|string|max:150',
            'start_year' => 'nullable|integer|min:1900|max:2100',
            'end_year' => 'nullable|integer|min:1900|max:2100',
            'grade' => 'nullable|string|max:50',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    private function experienceRules(): array
    {
        return [
            'employer_name' => 'required|string|max:255',
            'job_title' => 'nullable|string|max:150',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'location' => 'nullable|string|max:150',
            'responsibilities' => 'nullable|string|max:1500',
            'last_salary' => 'nullable|numeric|min:0',
            'reason_for_leaving' => 'nullable|string|max:1000',
        ];
    }

    private function dependentRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'relationship' => 'required|string|max:100',
            'date_of_birth' => 'nullable|date',
            'phone' => 'nullable|string|max:30',
            'is_nominee' => 'boolean',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    private function assetRules(): array
    {
        return [
            'asset_name' => 'required|string|max:255',
            'asset_code' => 'nullable|string|max:100',
            'category' => 'nullable|string|max:100',
            'issued_on' => 'nullable|date',
            'return_due_on' => 'nullable|date|after_or_equal:issued_on',
            'returned_on' => 'nullable|date',
            'condition_issued' => 'nullable|string|max:100',
            'condition_returned' => 'nullable|string|max:100',
            'status' => 'nullable|string|in:issued,returned,lost,damaged',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    private function lifecycleTaskRules(): array
    {
        return [
            'type' => 'required|string|in:onboarding,offboarding',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'due_date' => 'nullable|date',
            'status' => 'nullable|string|in:pending,in_progress,completed,skipped',
            'sort_order' => 'nullable|integer|min:0|max:1000',
        ];
    }

    private function noteRules(): array
    {
        return [
            'note_type' => 'nullable|string|max:50',
            'body' => 'required|string|max:3000',
            'visibility' => 'nullable|string|in:internal,manager,employee',
        ];
    }
}

