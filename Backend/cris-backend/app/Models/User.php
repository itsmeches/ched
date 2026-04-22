<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    public const ROLE_PENDING = 'pending';
    public const ROLE_SUPER_ADMIN = 'super_admin';
    public const ROLE_CHED = 'ched';
    public const ROLE_HEI = 'hei';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'institution_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    public function isSuperAdmin()
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function isCHED()
    {
        return $this->role === self::ROLE_CHED;
    }

    public function isHEI()
    {
        return $this->role === self::ROLE_HEI;
    }

    public function isPending(): bool
    {
        return $this->role === self::ROLE_PENDING;
    }

    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles, true);
    }
}
