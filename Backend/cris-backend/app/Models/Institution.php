<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property string|null $code
 * @property string|null $address
 * @property string|null $contact_email
 * @property string|null $contact_phone
 */
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