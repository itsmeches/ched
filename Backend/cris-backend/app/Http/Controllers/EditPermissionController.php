<?php

namespace App\Http\Controllers;

use App\Models\EditPermissionRequest;
use App\Models\ResearchProposal;
use App\Models\User;
use App\Notifications\EditPermissionDecided;
use App\Notifications\EditPermissionRequested;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EditPermissionController extends Controller
{
    /**
     * Student submits an edit permission request for a locked proposal.
     */
    public function store(Request $request, ResearchProposal $proposal): RedirectResponse
    {
        $user = $request->user();

        // Student can request a permission whenever the proposal is locked to them:
        //  - under_review_ched + already viewed by CHED, OR
        //  - already approved / rejected
        $isLocked = $proposal->submitted_by === $user->id
            && (
                ($proposal->status === ResearchProposal::STATUS_UNDER_REVIEW_CHED && ! is_null($proposal->viewed_at))
                || in_array($proposal->status, [ResearchProposal::STATUS_APPROVED, ResearchProposal::STATUS_REJECTED], true)
            );

        abort_unless($user->isStudent() && $isLocked, 403);

        // Block if a pending request already exists
        $alreadyPending = $proposal->editPermissionRequests()
            ->where('requested_by', $user->id)
            ->where('status', 'pending')
            ->exists();

        if ($alreadyPending) {
            return back()->with('error', 'You already have a pending edit permission request.');
        }

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $editRequest = $proposal->editPermissionRequests()->create([
            'requested_by' => $user->id,
            'reason'       => $validated['reason'] ?? null,
            'status'       => 'pending',
        ]);

        // Notify the CHED user — prefer the reviewer, fall back to the viewer
        $chedUserId = $proposal->reviewed_by ?? $proposal->viewed_by;
        if ($chedUserId) {
            $chedUser = User::find($chedUserId);
            $chedUser?->notify(new EditPermissionRequested($proposal, $editRequest, $user));
        }

        return back()->with('success', 'Edit permission request submitted. CHED will review it shortly.');
    }

    /**
     * CHED approves or denies an edit permission request.
     */
    public function decide(Request $request, ResearchProposal $proposal, EditPermissionRequest $editRequest): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user->isCHED() || $user->isSuperAdmin(), 403);
        abort_unless($editRequest->research_proposal_id === $proposal->id, 404);

        if ($editRequest->status !== 'pending') {
            return back()->with('error', 'This request has already been decided.');
        }

        $validated = $request->validate([
            'decision' => ['required', 'in:approved,denied'],
        ]);

        $editRequest->update([
            'status'     => $validated['decision'],
            'decided_by' => $user->id,
            'decided_at' => now(),
        ]);

        // Notify the student who requested
        $studentUser = User::find($editRequest->requested_by);
        $studentUser?->notify(new EditPermissionDecided($proposal, $editRequest));

        $label = $validated['decision'] === 'approved' ? 'approved' : 'denied';

        return back()->with('success', "Edit permission request {$label}.");
    }
}
