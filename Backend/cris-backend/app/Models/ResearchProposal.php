<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResearchProposal extends Model
{
    use HasFactory;

    public const STATUS_PENDING  = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'title',
        'authors',
        'co_authors',
        'year',
        'school',
        'abstract',
        'institution_id',
        'category',
        'keywords',
        'status',
        'file_path',
        'submitted_by',
        'reviewed_by',
        'reviewed_at',
        'approved_by',
        'approved_at',
        'comments',
    ];

    protected $casts = [
        'year'        => 'integer',
        'reviewed_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    public function submitter()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isEditable(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }
}