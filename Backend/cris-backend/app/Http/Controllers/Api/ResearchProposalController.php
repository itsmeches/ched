<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Keyword;
use App\Models\ResearchProposal;
use Illuminate\Http\Request;

class ResearchProposalController extends Controller
{
    // HEI: List own proposals
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->isSuperAdmin() || $user->isCHED()) {
            // Admin/CHED can see all proposals
            $proposals = ResearchProposal::with(['institution', 'submitter'])
                ->orderBy('created_at', 'desc')
                ->paginate(10);
        } else {
            // HEI sees only their own
            $proposals = ResearchProposal::with(['institution'])
                ->where('submitted_by', $user->id)
                ->orderBy('created_at', 'desc')
                ->paginate(10);
        }
        
        return response()->json($proposals);
    }

    // HEI: Create proposal
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'abstract' => 'required|string',
            'researchers' => 'nullable|string',
            'category' => 'required|string',
            'keywords' => 'nullable|string',
        ]);

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
        return response()->json($proposal->load(['institution', 'submitter', 'reviewer']));
    }

    // HEI: Update own proposal while pending
    public function update(Request $request, ResearchProposal $proposal)
    {
        if ($request->user()->isHEI() && $proposal->submitted_by !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($proposal->status !== 'pending') {
            return response()->json(['error' => 'Cannot update proposal in current status'], 400);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'abstract' => 'sometimes|string',
            'researchers' => 'nullable|string',
            'category' => 'sometimes|string',
            'keywords' => 'nullable|string',
        ]);

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
        if ($proposal->submitted_by !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($proposal->status !== 'pending') {
            return response()->json(['error' => 'Can only delete pending proposals'], 400);
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