<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AccountGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'name', 'code', 'type', 'nature', 'parent_id',
        'depth', 'path', 'is_system', 'sort_order',
    ];

    protected $casts = ['is_system' => 'boolean'];

    public function company()  { return $this->belongsTo(Company::class); }
    public function parent()   { return $this->belongsTo(AccountGroup::class, 'parent_id'); }
    public function children() { return $this->hasMany(AccountGroup::class, 'parent_id'); }
    public function accounts() { return $this->hasMany(Account::class); }
}
