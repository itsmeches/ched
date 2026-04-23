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
 * @property string|null $keywords
 * @property string $status
 * @property string|null $file_path
 * @property int $submitted_by
 * @property int|null $viewed_by
 * @property \Illuminate\Support\Carbon|null $viewed_at
 * @property int|null $reviewed_by
 * @property \Illuminate\Support\Carbon|null $reviewed_at
 * @property int|null $approved_by
 * @property \Illuminate\Support\Carbon|null $approved_at
 * @property string|null $comments
 */
class ResearchProposal extends Model
{
    use HasFactory;

    public const STATUS_PENDING  = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

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
        'keywords',
        'status',
        'file_path',
        'submitted_by',
        'viewed_by',
        'viewed_at',
        'reviewed_by',
        'reviewed_at',
        'approved_by',
        'approved_at',
        'comments',
    ];

    protected $casts = [
        'year'        => 'integer',
        'viewed_at'   => 'datetime',
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

    public function viewer()
    {
        return $this->belongsTo(User::class, 'viewed_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function keywordItems(): BelongsToMany
    {
        return $this->belongsToMany(Keyword::class);
    }

    public function histories(): HasMany
    {
        return $this->hasMany(ResearchProposalHistory::class)->orderByDesc('performed_at');
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isEditable(): bool
    {
        $userId = Auth::id();

        // Approved or rejected: only editable with an approved permission
        if ($this->status !== self::STATUS_PENDING) {
            if (! $userId) {
                return false;
            }

            return $this->editPermissionRequests()
                ->where('requested_by', $userId)
                ->where('status', 'approved')
                ->exists();
        }

        // Pending + not yet viewed by CHED — freely editable
        if (is_null($this->viewed_at)) {
            return true;
        }

        // Pending + locked (CHED viewed) — need an approved permission
        if ($userId) {
            return $this->editPermissionRequests()
                ->where('requested_by', $userId)
                ->where('status', 'approved')
                ->exists();
        }

        return false;
    }

    public function editPermissionRequests(): HasMany
    {
        return $this->hasMany(EditPermissionRequest::class, 'research_proposal_id');
    }
}