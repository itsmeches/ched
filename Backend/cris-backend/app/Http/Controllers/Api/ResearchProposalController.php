<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

        $proposal = ResearchProposal::create([
            ...$validated,
            'institution_id' => $request->user()->institution_id,
            'submitted_by' => $request->user()->id,
            'status' => 'submitted',
        ]);

        return response()->json([
            'message' => 'Proposal submitted successfully',
            'proposal' => $proposal->load('institution'),
        ], 201);
    }

    // View single proposal
    public function show(ResearchProposal $proposal)
    {
        return response()->json($proposal->load(['institution', 'submitter', 'reviewer']));
    }

    // HEI: Update own proposal (only if draft)
    public function update(Request $request, ResearchProposal $proposal)
    {
        if ($request->user()->isHEI() && $proposal->submitted_by !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($proposal->status !== 'draft' && $proposal->status !== 'rejected') {
            return response()->json(['error' => 'Cannot update proposal in current status'], 400);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'abstract' => 'sometimes|string',
            'researchers' => 'nullable|string',
            'category' => 'sometimes|string',
            'keywords' => 'nullable|string',
        ]);

        $proposal->update($validated);

        return response()->json([
            'message' => 'Proposal updated',
            'proposal' => $proposal->load('institution'),
        ]);
    }

    // CHED/SuperAdmin: Review proposal
    public function review(Request $request, ResearchProposal $proposal)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected,under_review',
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

    // HEI: Delete own draft proposal
    public function destroy(Request $request, ResearchProposal $proposal)
    {
        if ($proposal->submitted_by !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($proposal->status !== 'draft') {
            return response()->json(['error' => 'Can only delete draft proposals'], 400);
        }

        $proposal->delete();

        return response()->json(['message' => 'Proposal deleted']);
    }
}