<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FiscalYear extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'name', 'start_date', 'end_date', 'status', 'is_current',
        'closed_at', 'closed_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
        'is_current' => 'boolean',
        'closed_at'  => 'datetime',
    ];

    public function company()  { return $this->belongsTo(Company::class); }
    public function journals() { return $this->hasMany(Journal::class); }
    public function invoices() { return $this->hasMany(Invoice::class); }

    public function scopeCurrent($q) { return $q->where('is_current', true); }
}
