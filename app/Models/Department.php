<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = ['company_id', 'name', 'code', 'description', 'head_id', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];

    public function company()   { return $this->belongsTo(Company::class); }
    public function head()      { return $this->belongsTo(User::class, 'head_id'); }
    public function employees() { return $this->hasMany(Employee::class); }
}
