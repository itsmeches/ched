<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResearchProposalHistory extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'research_proposal_id',
        'user_id',
        'action',
        'old_values',
        'new_values',
        'performed_at',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'performed_at' => 'datetime',
    ];

    public function proposal(): BelongsTo
    {
        return $this->belongsTo(ResearchProposal::class, 'research_proposal_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
