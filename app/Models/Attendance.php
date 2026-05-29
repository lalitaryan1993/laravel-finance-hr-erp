<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'company_id', 'employee_id', 'date', 'check_in', 'check_out',
        'status', 'working_hours', 'overtime_hours', 'shift', 'notes', 'marked_by',
    ];

    protected $casts = [
        'date'          => 'date',
        'working_hours' => 'decimal:2',
        'overtime_hours'=> 'decimal:2',
    ];

    public function employee()  { return $this->belongsTo(Employee::class); }
    public function company()   { return $this->belongsTo(Company::class); }
    public function markedBy()  { return $this->belongsTo(User::class, 'marked_by'); }

    public function scopeForCompany($q, $id) { return $q->where('company_id', $id); }
    public function scopeForDate($q, $date)  { return $q->where('date', $date); }
    public function scopeForMonth($q, $ym)   { return $q->where('date', 'like', "$ym-%"); }

    public static function statusLabel(string $status): string
    {
        return match ($status) {
            'present'  => 'Present',
            'absent'   => 'Absent',
            'half_day' => 'Half Day',
            'wfh'      => 'Work From Home',
            'holiday'  => 'Holiday',
            'leave'    => 'On Leave',
            'late'     => 'Late',
            'on_duty'  => 'On Duty',
            default    => ucfirst($status),
        };
    }
}
