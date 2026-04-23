<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property int $id
 * @property string $name
 */
class Keyword extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    public function researchProposals(): BelongsToMany
    {
        return $this->belongsToMany(ResearchProposal::class);
    }
}
