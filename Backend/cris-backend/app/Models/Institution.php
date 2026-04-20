<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Institution extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'address',
        'contact_email',
        'contact_phone',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function proposals()
    {
        return $this->hasMany(ResearchProposal::class);
    }
}