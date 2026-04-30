<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

/**
 * @property int $id
 * @property string $title
 * @property string $authors
 * @property string|null $author_email
 * @property string|null $author_phone
 * @property string|null $co_authors
 * @property string|null $co_author_emails
 * @property string|null $co_author_phones
 * @property int|null $year
 * @property string|null $school
 * @property string $abstract
 * @property int|null $institution_id
 * @property string|null $category
 * @property string|null $research_category
 * @property string|null $category_type
 * @property string|null $discipline_code
 * @property string|null $keywords
 * @property string $status
 * @property string|null $file_path
 * @property int $submitted_by
 * @property \Illuminate\Support\Carbon|null $submitted_at
 * @property int|null $viewed_by
 * @property \Illuminate\Support\Carbon|null $viewed_at
 * @property int|null $reviewed_by
 * @property \Illuminate\Support\Carbon|null $reviewed_at
 * @property int|null $approved_by
 * @property \Illuminate\Support\Carbon|null $approved_at
 * @property \Illuminate\Support\Carbon|null $approved_by_faculty_at
 * @property \Illuminate\Support\Carbon|null $approved_by_hei_at
 * @property \Illuminate\Support\Carbon|null $approved_by_ched_at
 * @property \Illuminate\Support\Carbon|null $rejected_at
 * @property int|null $rejected_by
 * @property string|null $remarks
 * @property string|null $comments
 */
class ResearchProposal extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_SUBMITTED = 'submitted';
    public const STATUS_UNDER_REVIEW_FACULTY = 'under_review_faculty';
    public const STATUS_UNDER_REVIEW_HEI = 'under_review_hei';
    public const STATUS_UNDER_REVIEW_CHED = 'under_review_ched';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_NEEDS_REVISION = 'needs_revision';

    // Legacy aliases kept to avoid breaking existing tests/older code paths.
    public const STATUS_PENDING = self::STATUS_UNDER_REVIEW_CHED;
    public const STATUS_PENDING_FACULTY = self::STATUS_UNDER_REVIEW_FACULTY;
    public const STATUS_PENDING_HEI = self::STATUS_UNDER_REVIEW_HEI;
    public const STATUS_PENDING_CHED = self::STATUS_UNDER_REVIEW_CHED;

    public const PENDING_STATUSES = [
        self::STATUS_SUBMITTED,
        self::STATUS_UNDER_REVIEW_FACULTY,
        self::STATUS_UNDER_REVIEW_HEI,
        self::STATUS_UNDER_REVIEW_CHED,
    ];

    protected $fillable = [
        'title',
        'authors',
        'author_email',
        'author_phone',
        'co_authors',
        'co_author_emails',
        'co_author_phones',
        'year',
        'school',
        'abstract',
        'institution_id',
        'category',
        'research_category',
        'category_type',
        'discipline_code',
        'keywords',
        'status',
        'file_path',
        'submitted_by',
        'submitted_at',
        'viewed_by',
        'viewed_at',
        'reviewed_by',
        'reviewed_at',
        'approved_by',
        'approved_at',
        'approved_by_faculty_at',
        'approved_by_hei_at',
        'approved_by_ched_at',
        'rejected_at',
        'rejected_by',
        'remarks',
        'comments',
    ];

    protected $casts = [
        'year'        => 'integer',
        'submitted_at' => 'datetime',
        'viewed_at'   => 'datetime',
        'reviewed_at' => 'datetime',
        'approved_at' => 'datetime',
        'approved_by_faculty_at' => 'datetime',
        'approved_by_hei_at' => 'datetime',
        'approved_by_ched_at' => 'datetime',
        'rejected_at' => 'datetime',
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

    public function viewer()
    {
        return $this->belongsTo(User::class, 'viewed_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejector()
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function keywordItems(): BelongsToMany
    {
        return $this->belongsToMany(Keyword::class);
    }

    public function histories(): HasMany
    {
        return $this->hasMany(ResearchProposalHistory::class)->orderByDesc('performed_at');
    }

    public function researchHistories(): HasMany
    {
        return $this->hasMany(ResearchHistory::class, 'research_id')->orderByDesc('created_at');
    }

    public function isPending(): bool
    {
        return in_array($this->status, self::PENDING_STATUSES, true);
    }

    public function isPendingFaculty(): bool
    {
        return $this->status === self::STATUS_UNDER_REVIEW_FACULTY
            || $this->status === self::STATUS_SUBMITTED;
    }

    public function isPendingHei(): bool
    {
        return $this->status === self::STATUS_UNDER_REVIEW_HEI;
    }

    public function isPendingChed(): bool
    {
        return $this->status === self::STATUS_UNDER_REVIEW_CHED;
    }

    public function isEditable(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    public function editPermissionRequests(): HasMany
    {
        return $this->hasMany(EditPermissionRequest::class, 'research_proposal_id');
    }
}