<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResearchProposal extends Model
{
    use HasFactory;

    public const STATUS_DRAFT        = 'draft';
    public const STATUS_SUBMITTED    = 'submitted';
    public const STATUS_UNDER_REVIEW = 'under_review';
    public const STATUS_APPROVED     = 'approved';
    public const STATUS_REJECTED     = 'rejected';

    protected $fillable = [
        'title',
        'authors',
        'co_authors',
        'year',
        'school',
        'abstract',
        'researchers',
        'institution_id',
        'category',
        'keywords',
        'status',
        'file_path',
        'submitted_by',
        'reviewed_by',
        'reviewed_at',
        'comments',
    ];

    protected $casts = [
        'year'        => 'integer',
        'reviewed_at' => 'datetime',
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

    public function isPending(): bool
    {
        return in_array($this->status, [self::STATUS_DRAFT, self::STATUS_SUBMITTED], true);
    }

    public function isEditable(): bool
    {
        return in_array($this->status, [self::STATUS_DRAFT], true);
    }
}