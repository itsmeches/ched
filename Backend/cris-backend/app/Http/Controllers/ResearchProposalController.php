<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreResearchProposalRequest;
use App\Http\Requests\UpdateResearchProposalRequest;
use App\Models\ResearchProposal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ResearchProposalController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = ResearchProposal::with(['submitter:id,name', 'institution:id,name'])
            ->when($request->search, fn ($q, $s) =>
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('authors', 'like', "%{$s}%")
                  ->orWhere('keywords', 'like', "%{$s}%")
            )
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderByDesc('updated_at');

        // HEI only sees own papers
        if ($user->isHEI()) {
            $query->where('submitted_by', $user->id);
        }

        return Inertia::render('Research/Index', [
            'proposals'  => $query->paginate(15)->withQueryString(),
            'filters'    => $request->only(['search', 'status']),
            'canCreate'  => $user->isHEI(),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', ResearchProposal::class);

        return Inertia::render('Research/Create');
    }

    public function store(StoreResearchProposalRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('pdf_file')) {
            $data['file_path'] = $request->file('pdf_file')
                ->store('research_papers', 'public');
        }

        unset($data['pdf_file']);

        $proposal = ResearchProposal::create([
            ...$data,
            'submitted_by'   => $request->user()->id,
            'institution_id' => $request->user()->institution_id,
            'status'         => ResearchProposal::STATUS_DRAFT,
        ]);

        return redirect()->route('research.show', $proposal)
            ->with('success', 'Research paper saved as draft.');
    }

    public function show(ResearchProposal $proposal): Response
    {
        $this->authorize('view', $proposal);

        $proposal->load(['submitter:id,name', 'reviewer:id,name', 'institution:id,name']);

        return Inertia::render('Research/Show', [
            'proposal' => $proposal,
            'canEdit'  => auth()->user()->can('update', $proposal),
            'canReview' => auth()->user()->can('review', $proposal),
        ]);
    }

    public function edit(ResearchProposal $proposal): Response
    {
        $this->authorize('update', $proposal);

        return Inertia::render('Research/Edit', [
            'proposal' => $proposal,
        ]);
    }

    public function update(UpdateResearchProposalRequest $request, ResearchProposal $proposal): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('pdf_file')) {
            // Remove old file
            if ($proposal->file_path) {
                Storage::disk('public')->delete($proposal->file_path);
            }
            $data['file_path'] = $request->file('pdf_file')
                ->store('research_papers', 'public');
        }

        unset($data['pdf_file']);
        $proposal->update($data);

        return redirect()->route('research.show', $proposal)
            ->with('success', 'Research paper updated.');
    }

    public function destroy(ResearchProposal $proposal): RedirectResponse
    {
        $this->authorize('delete', $proposal);

        if ($proposal->file_path) {
            Storage::disk('public')->delete($proposal->file_path);
        }

        $proposal->delete();

        return redirect()->route('research.index')
            ->with('success', 'Research paper deleted.');
    }

    /** HEI submits a draft for review */
    public function submit(ResearchProposal $proposal): RedirectResponse
    {
        $this->authorize('submit', $proposal);

        $proposal->update(['status' => ResearchProposal::STATUS_SUBMITTED]);

        return back()->with('success', 'Paper submitted for review.');
    }

    /** CHED / Super Admin reviews a paper */
    public function review(Request $request, ResearchProposal $proposal): RedirectResponse
    {
        $this->authorize('review', $proposal);

        $request->validate([
            'action'   => ['required', 'in:approve,reject'],
            'comments' => ['nullable', 'string', 'max:2000'],
        ]);

        $proposal->update([
            'status'      => $request->action === 'approve'
                ? ResearchProposal::STATUS_APPROVED
                : ResearchProposal::STATUS_REJECTED,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'comments'    => $request->comments,
        ]);

        return back()->with('success', 'Review saved.');
    }
}
