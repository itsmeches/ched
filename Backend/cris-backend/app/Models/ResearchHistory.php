<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResearchHistory extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'research_id',
        'action',
        'performed_by',
        'role',
        'remarks',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function research(): BelongsTo
    {
        return $this->belongsTo(ResearchProposal::class, 'research_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
