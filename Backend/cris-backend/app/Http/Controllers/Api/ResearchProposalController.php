<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Keyword;
use App\Models\ResearchProposal;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ResearchProposalController extends Controller
{
    // HEI: List own proposals
    public function index(Request $request)
    {
        $this->authorize('viewAny', ResearchProposal::class);

        $user = $request->user();
        $perPage = min(max((int) $request->integer('per_page', 10), 1), 100);
        $selectColumns = [
            'id',
            'title',
            'authors',
            'co_authors',
            'year',
            'school',
            'abstract',
            'category',
            'keywords',
            'status',
            'comments',
            'institution_id',
            'submitted_by',
            'reviewed_by',
            'created_at',
            'updated_at',
        ];
        
        if ($user->isSuperAdmin() || $user->isCHED()) {
            // Admin/CHED can see all proposals
            $proposals = ResearchProposal::query()
                ->select($selectColumns)
                ->with([
                    'institution:id,name,code',
                    'submitter:id,name,email',
                ])
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        } else {
            // HEI sees only their own
            $proposals = ResearchProposal::query()
                ->select($selectColumns)
                ->with(['institution:id,name,code'])
                ->where('submitted_by', $user->id)
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        }
        
        return response()->json($proposals);
    }

    // HEI: Create proposal
    public function store(Request $request)
    {
        $this->authorize('create', ResearchProposal::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'abstract' => 'required|string',
            'authors' => 'nullable|string|max:500',
            'researchers' => 'nullable|string|max:500',
            'co_authors' => 'nullable|string|max:500',
            'year' => 'nullable|integer|min:1900|max:2100',
            'school' => 'nullable|string|max:255',
            'category' => 'required|string',
            'keywords' => 'nullable|string',
        ]);

        if (! array_key_exists('authors', $validated) && array_key_exists('researchers', $validated)) {
            $validated['authors'] = $validated['researchers'];
        }

        unset($validated['researchers']);

        $normalizedKeywords = $this->parseKeywords($validated['keywords'] ?? null);
        $validated['keywords'] = $normalizedKeywords !== [] ? implode(', ', $normalizedKeywords) : null;

        $proposal = ResearchProposal::create([
            ...$validated,
            'institution_id' => $request->user()->institution_id,
            'submitted_by' => $request->user()->id,
            'status' => 'pending',
        ]);

        $this->syncKeywords($proposal, $normalizedKeywords);

        return response()->json([
            'message' => 'Proposal submitted and marked as pending',
            'proposal' => $proposal->load('institution'),
        ], 201);
    }

    // View single proposal
    public function show(ResearchProposal $proposal)
    {
        $this->authorize('view', $proposal);

        return response()->json($proposal->load(['institution', 'submitter', 'reviewer']));
    }

    // HEI: Update own proposal while pending
    public function update(Request $request, ResearchProposal $proposal)
    {
        $this->authorize('update', $proposal);

        if ($proposal->status !== 'pending') {
            throw ValidationException::withMessages([
                'proposal' => ['Cannot update proposal in current status.'],
            ]);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'abstract' => 'sometimes|string',
            'authors' => 'sometimes|nullable|string|max:500',
            'researchers' => 'sometimes|nullable|string|max:500',
            'co_authors' => 'sometimes|nullable|string|max:500',
            'year' => 'sometimes|nullable|integer|min:1900|max:2100',
            'school' => 'sometimes|nullable|string|max:255',
            'category' => 'sometimes|string',
            'keywords' => 'nullable|string',
        ]);

        if (! array_key_exists('authors', $validated) && array_key_exists('researchers', $validated)) {
            $validated['authors'] = $validated['researchers'];
        }

        unset($validated['researchers']);

        $normalizedKeywords = $this->parseKeywords($validated['keywords'] ?? null);

        if (array_key_exists('keywords', $validated)) {
            $validated['keywords'] = $normalizedKeywords !== [] ? implode(', ', $normalizedKeywords) : null;
        }

        $proposal->update($validated);

        if (array_key_exists('keywords', $validated)) {
            $this->syncKeywords($proposal, $normalizedKeywords);
        }

        return response()->json([
            'message' => 'Proposal updated',
            'proposal' => $proposal->load('institution'),
        ]);
    }

    // CHED/SuperAdmin: Review proposal
    public function review(Request $request, ResearchProposal $proposal)
    {
        $this->authorize('review', $proposal);

        if (! $proposal->isPending()) {
            throw ValidationException::withMessages([
                'proposal' => ['Only pending proposals can be reviewed.'],
            ]);
        }

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'comments' => 'nullable|string',
        ]);

        $proposal->update([
            'status' => $validated['status'],
            'comments' => $validated['comments'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Proposal reviewed',
            'proposal' => $proposal->load(['institution', 'submitter', 'reviewer']),
        ]);
    }

    // HEI: Delete own pending proposal
    public function destroy(Request $request, ResearchProposal $proposal)
    {
        $this->authorize('delete', $proposal);

        if ($proposal->status !== 'pending') {
            throw ValidationException::withMessages([
                'proposal' => ['Only pending proposals can be deleted.'],
            ]);
        }

        $proposal->delete();

        return response()->json(['message' => 'Proposal deleted']);
    }

    /**
     * @return array<int, string>
     */
    private function parseKeywords(?string $keywords): array
    {
        if (! $keywords) {
            return [];
        }

        $items = array_filter(array_map(
            static fn (string $value) => trim($value),
            explode(',', $keywords),
        ));

        $normalized = [];

        foreach ($items as $item) {
            $key = mb_strtolower($item);

            if (! isset($normalized[$key])) {
                $normalized[$key] = $item;
            }
        }

        return array_values($normalized);
    }

    /**
     * @param array<int, string> $keywordNames
     */
    private function syncKeywords(ResearchProposal $proposal, array $keywordNames): void
    {
        if ($keywordNames === []) {
            $proposal->keywordItems()->sync([]);
            return;
        }

        $keywordIds = [];

        foreach ($keywordNames as $keywordName) {
            $keywordIds[] = Keyword::query()->firstOrCreate(['name' => $keywordName])->id;
        }

        $proposal->keywordItems()->sync(array_values(array_unique($keywordIds)));
    }
}