<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreResearchProposalRequest;
use App\Http\Requests\UpdateResearchProposalRequest;
use App\Models\ResearchProposal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ResearchProposalController extends Controller
{
    public function publicIndex(Request $request): Response
    {
        $query = ResearchProposal::with(['institution:id,name'])
            ->select(['id', 'title', 'authors', 'school', 'year', 'keywords', 'status', 'institution_id', 'approved_at', 'updated_at'])
            ->where('status', ResearchProposal::STATUS_APPROVED)
            ->orderByDesc('approved_at')
            ->orderByDesc('updated_at');

        $this->applySearchFilters($query, $request, includeStatus: false);

        return Inertia::render('Research/PublicIndex', [
            'proposals'    => $query->paginate(12)->withQueryString(),
            'filters'      => $request->only(['search', 'year', 'school']),
            'canLogin'     => Route::has('login'),
            'canRegister'  => Route::has('register'),
        ]);
    }

    public function publicShow(ResearchProposal $proposal): Response
    {
        abort_unless($proposal->status === ResearchProposal::STATUS_APPROVED, 404);

        $proposal->load(['institution:id,name', 'approver:id,name']);

        return Inertia::render('Research/PublicShow', [
            'proposal' => $proposal,
        ]);
    }

    public function publicDownloadFile(ResearchProposal $proposal): BinaryFileResponse
    {
        abort_unless($proposal->status === ResearchProposal::STATUS_APPROVED, 404);
        abort_if(empty($proposal->file_path), 404);
        abort_unless(Storage::disk('public')->exists($proposal->file_path), 404);

        $absolutePath = Storage::disk('public')->path($proposal->file_path);
        $downloadName = $this->safePdfFileName($proposal);

        return response()->file($absolutePath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $downloadName . '"',
        ]);
    }

    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = ResearchProposal::with(['submitter:id,name', 'institution:id,name'])
            ->select(['id', 'title', 'authors', 'year', 'school', 'keywords', 'status', 'institution_id', 'submitted_by', 'updated_at'])
            ->orderByDesc('updated_at');

        $this->applySearchFilters($query, $request, includeStatus: true);

        // HEI only sees own papers
        if ($user->isHEI()) {
            $query->where('submitted_by', $user->id);
        }

        return Inertia::render('Research/Index', [
            'proposals'  => $query->paginate(15)->withQueryString(),
            'filters'    => $request->only(['search', 'status', 'year', 'school']),
            'canCreate'  => $user->isHEI(),
        ]);
    }

    private function applySearchFilters($query, Request $request, bool $includeStatus): void
    {
        $search = trim((string) $request->input('search', ''));

        if ($search !== '') {
            $query->where(function ($inner) use ($search) {
                $inner->where('title', 'like', "%{$search}%")
                    ->orWhere('authors', 'like', "%{$search}%")
                    ->orWhere('keywords', 'like', "%{$search}%");
            });
        }

        $year = (int) $request->input('year');
        $minYear = 1900;
        $maxYear = (int) date('Y') + 1;

        if ($request->filled('year') && $year > 0) {
            $year = max($minYear, min($maxYear, $year));
            $query->where('year', $year);
        }

        $query->when($request->filled('school'), fn ($q) => $q->where('school', 'like', '%' . trim((string) $request->input('school')) . '%'));

        if ($includeStatus) {
            $query->when($request->filled('status'), fn ($q) => $q->where('status', (string) $request->input('status')));
        }
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
            'status'         => ResearchProposal::STATUS_PENDING,
        ]);

        return redirect()->route('research.show', $proposal)
            ->with('success', 'Research paper submitted and marked as pending review.');
    }

    public function show(ResearchProposal $proposal): Response
    {
        $this->authorize('view', $proposal);
        $user = request()->user();

        $proposal->load(['submitter:id,name', 'reviewer:id,name', 'approver:id,name', 'institution:id,name']);

        return Inertia::render('Research/Show', [
            'proposal' => $proposal,
            'canEdit'  => $user?->can('update', $proposal) ?? false,
            'canReview' => $user?->can('review', $proposal) ?? false,
        ]);
    }

    public function downloadFile(ResearchProposal $proposal): BinaryFileResponse
    {
        $this->authorize('view', $proposal);
        abort_if(empty($proposal->file_path), 404);
        abort_unless(Storage::disk('public')->exists($proposal->file_path), 404);

        $absolutePath = Storage::disk('public')->path($proposal->file_path);
        $downloadName = $this->safePdfFileName($proposal);

        return response()->file($absolutePath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $downloadName . '"',
        ]);
    }

    private function safePdfFileName(ResearchProposal $proposal): string
    {
        $slug = Str::slug($proposal->title ?? 'research-paper');

        if ($slug === '') {
            $slug = 'research-paper-' . $proposal->id;
        }

        return $slug . '.pdf';
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

    /** CHED / Super Admin reviews a paper */
    public function review(Request $request, ResearchProposal $proposal): RedirectResponse
    {
        $this->authorize('review', $proposal);

        if (! $proposal->isPending()) {
            return back()->with('error', 'Only pending papers can be reviewed.');
        }

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
            'approved_by' => $request->action === 'approve' ? $request->user()->id : null,
            'approved_at' => $request->action === 'approve' ? now() : null,
            'comments'    => $request->comments,
        ]);

        return back()->with('success', 'Review saved.');
    }
}
