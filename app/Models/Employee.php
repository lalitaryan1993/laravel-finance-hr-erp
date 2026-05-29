<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid', 'company_id', 'branch_id', 'department_id', 'user_id',
        'employee_code', 'first_name', 'last_name', 'email', 'phone',
        'gender', 'marital_status', 'blood_group', 'personal_email',
        'designation', 'date_of_joining', 'date_of_leaving', 'employment_type',
        'current_address', 'permanent_address', 'reporting_manager_id',
        'work_location', 'probation_end_date', 'confirmation_date',
        'notice_period_days', 'exit_date', 'exit_reason', 'rehire_eligible',
        'exit_notes',
        'status', 'pan_number', 'uan_number', 'esi_number', 'aadhar_number',
        'bank_details', 'salary_structure_id', 'basic_salary', 'hra',
        'gross_salary', 'net_salary', 'pf_applicable', 'esi_applicable',
        'tax_regime', 'tax_declarations', 'documents',
    ];

    protected $casts = [
        'date_of_joining'  => 'date',
        'date_of_leaving'  => 'date',
        'probation_end_date' => 'date',
        'confirmation_date' => 'date',
        'exit_date'        => 'date',
        'rehire_eligible'  => 'boolean',
        'basic_salary'     => 'decimal:4',
        'hra'              => 'decimal:4',
        'gross_salary'     => 'decimal:4',
        'net_salary'       => 'decimal:4',
        'pf_applicable'    => 'boolean',
        'esi_applicable'   => 'boolean',
        'bank_details'     => 'array',
        'tax_declarations' => 'array',
        'documents'        => 'array',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn ($m) => $m->uuid = $m->uuid ?? (string) Str::uuid());
    }

    public function company()         { return $this->belongsTo(Company::class); }
    public function branch()          { return $this->belongsTo(Branch::class); }
    public function department()      { return $this->belongsTo(Department::class); }
    public function user()            { return $this->belongsTo(User::class); }
    public function reportingManager(){ return $this->belongsTo(Employee::class, 'reporting_manager_id'); }
    public function salaryStructure() { return $this->belongsTo(SalaryStructure::class); }
    public function payslips()        { return $this->hasMany(Payslip::class); }
    public function emergencyContacts(){ return $this->hasMany(EmployeeEmergencyContact::class); }
    public function documents()       { return $this->hasMany(EmployeeDocument::class); }
    public function educations()      { return $this->hasMany(EmployeeEducation::class); }
    public function experiences()     { return $this->hasMany(EmployeeExperience::class); }
    public function dependents()      { return $this->hasMany(EmployeeDependent::class); }
    public function assignedAssets()  { return $this->hasMany(EmployeeAsset::class); }
    public function lifecycleTasks()  { return $this->hasMany(EmployeeLifecycleTask::class)->orderBy('sort_order')->orderBy('id'); }
    public function notes()           { return $this->hasMany(EmployeeNote::class)->latest(); }

    protected $appends = ['full_name', 'bank_account_number', 'bank_ifsc'];

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function getBankAccountNumberAttribute(): ?string
    {
        $d = $this->bank_details;
        return is_array($d) ? ($d['account_number'] ?? null) : null;
    }

    public function getBankIfscAttribute(): ?string
    {
        $d = $this->bank_details;
        return is_array($d) ? ($d['ifsc'] ?? null) : null;
    }

    public function scopeActive($q)  { return $q->where('status', 'active'); }
    public function scopeForCompany($q, $id) { return $q->where('company_id', $id); }
}
