<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $role
 * @property int|null $institution_id
 * @property int|null $created_by
 * @property int|null $hei_id
 * @property int|null $faculty_id
 * @property int|null $ched_id
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens, SoftDeletes;

    public const ROLE_PENDING = 'pending';
    public const ROLE_SUPER_ADMIN = 'super_admin';
    public const ROLE_CHED = 'ched';
    public const ROLE_HEI = 'hei';
    public const ROLE_FACULTY = 'faculty';
    public const ROLE_STUDENT = 'student';

    public const ROLES = [
        self::ROLE_PENDING,
        self::ROLE_SUPER_ADMIN,
        self::ROLE_CHED,
        self::ROLE_HEI,
        self::ROLE_FACULTY,
        self::ROLE_STUDENT,
    ];

    public const INSTITUTION_REQUIRED_ROLES = [
        self::ROLE_HEI,
        self::ROLE_FACULTY,
        self::ROLE_STUDENT,
    ];

    public const HIERARCHY_CREATOR_ROLES = [
        self::ROLE_CHED,
        self::ROLE_HEI,
        self::ROLE_FACULTY,
    ];

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'institution_id',
        'created_by',
        'hei_id',
        'faculty_id',
        'ched_id',
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

    public function creator()
    {
        return $this->belongsTo(self::class, 'created_by');
    }

    public function createdUsers()
    {
        return $this->hasMany(self::class, 'created_by');
    }

    public function hei()
    {
        return $this->belongsTo(self::class, 'hei_id');
    }

    public function ched()
    {
        return $this->belongsTo(self::class, 'ched_id');
    }

    public function faculty()
    {
        return $this->belongsTo(self::class, 'faculty_id');
    }

    public function facultyMembers()
    {
        return $this->hasMany(self::class, 'hei_id')
            ->where('role', self::ROLE_FACULTY);
    }

    public function heis()
    {
        return $this->hasMany(self::class, 'ched_id')
            ->where('role', self::ROLE_HEI);
    }

    public function students()
    {
        return $this->hasMany(self::class, 'faculty_id')
            ->where('role', self::ROLE_STUDENT);
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
        return in_array($this->role, self::INSTITUTION_REQUIRED_ROLES, true);
    }

    public function isFaculty(): bool
    {
        return $this->role === self::ROLE_FACULTY;
    }

    public function isStudent(): bool
    {
        return $this->role === self::ROLE_STUDENT;
    }

    public function isPending(): bool
    {
        return $this->role === self::ROLE_PENDING;
    }

    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles, true);
    }

    public static function requiresInstitutionForRole(string $role): bool
    {
        return in_array($role, self::INSTITUTION_REQUIRED_ROLES, true);
    }

    public function creatableRole(): ?string
    {
        return match ($this->role) {
            self::ROLE_CHED => self::ROLE_HEI,
            self::ROLE_HEI => self::ROLE_FACULTY,
            self::ROLE_FACULTY => self::ROLE_STUDENT,
            default => null,
        };
    }
}
