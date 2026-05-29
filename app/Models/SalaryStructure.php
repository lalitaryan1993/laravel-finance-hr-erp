<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalaryStructure extends Model
{
    protected $fillable = ['company_id', 'name', 'description', 'pay_frequency', 'components', 'is_active'];
    protected $casts = ['components' => 'array', 'is_active' => 'boolean'];

    public function company()   { return $this->belongsTo(Company::class); }
    public function employees() { return $this->hasMany(Employee::class); }
}
