<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreResearchProposalRequest;
use App\Http\Requests\UpdateResearchProposalRequest;
use App\Models\EditPermissionRequest;
use App\Models\Keyword;
use App\Models\ResearchProposal;
use App\Models\ResearchProposalHistory;
use App\Notifications\ResearchProposalReviewed;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
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
            'proposal'    => $proposal,
            'canLogin'    => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }

    public function publicDownloadFile(ResearchProposal $proposal): BinaryFileResponse
    {
        abort_unless($proposal->status === ResearchProposal::STATUS_APPROVED, 404);
        abort_if(empty($proposal->file_path), 404);
        abort_unless(Storage::disk('public')->exists($proposal->file_path), 404);

        $absolutePath = Storage::disk('public')->path($proposal->file_path);
        $downloadName = $this->safePdfFileName($proposal);
        $disposition = request()->boolean('download') ? 'attachment' : 'inline';

        return response()->file($absolutePath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => $disposition . '; filename="' . $downloadName . '"',
        ]);
    }

    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = ResearchProposal::with(['submitter:id,name', 'institution:id,name'])
            ->select(['id', 'title', 'authors', 'year', 'school', 'keywords', 'status', 'institution_id', 'submitted_by', 'viewed_at', 'updated_at'])
            ->orderByDesc('updated_at');

        $this->applySearchFilters($query, $request, includeStatus: true);

        // HEI only sees own papers
        if ($user->isHEI()) {
            $query->where('submitted_by', $user->id);
        }

        $editability = (string) $request->input('editability', '');
        if ($editability === 'editable') {
            $query->where('status', ResearchProposal::STATUS_PENDING)
                ->whereNull('viewed_at');
        } elseif ($editability === 'locked') {
            $query->where(function ($inner) {
                $inner->where('status', '!=', ResearchProposal::STATUS_PENDING)
                    ->orWhereNotNull('viewed_at');
            });
        }

        return Inertia::render('Research/Index', [
            'proposals'  => $query->paginate(15)->withQueryString(),
            'filters'    => $request->only(['search', 'status', 'year', 'school', 'editability']),
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
                    ->orWhere('keywords', 'like', "%{$search}%")
                    ->orWhereHas('keywordItems', fn ($keywordQuery) => $keywordQuery->where('name', 'like', "%{$search}%"));
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

        return Inertia::render('Research/Create', [
            'keywordOptions' => Keyword::query()->orderBy('name')->pluck('name'),
        ]);
    }

    public function store(StoreResearchProposalRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $normalizedKeywords = $this->parseKeywords($data['keywords'] ?? null);
        $data['keywords'] = $normalizedKeywords !== [] ? implode(', ', $normalizedKeywords) : null;

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

        $this->syncKeywords($proposal, $normalizedKeywords);

        $this->logHistory($proposal, $request->user()->id, 'created', null, $this->trackedValues($proposal));

        return redirect()->route('research.show', ['proposal' => $proposal->id])
            ->with('success', 'Research paper submitted and marked as pending review.');
    }

    public function show(ResearchProposal $proposal): Response
    {
        $this->authorize('view', $proposal);
        $user = request()->user();

        if ($user?->isCHED() && is_null($proposal->viewed_at)) {
            // Lock HEI editing after CHED has first opened the submission.
            DB::table('research_proposals')
                ->where('id', $proposal->id)
                ->whereNull('viewed_at')
                ->update([
                    'viewed_by' => $user->id,
                    'viewed_at' => now(),
                ]);

            $proposal->refresh();
        }

        $proposal->load(['submitter:id,name', 'viewer:id,name', 'reviewer:id,name', 'approver:id,name', 'institution:id,name']);

        // For HEI: their latest edit permission request on this proposal
        $editPermission = null;
        if ($user?->isHEI() && $proposal->submitted_by === $user->id) {
            $editPermission = $proposal->editPermissionRequests()
                ->where('requested_by', $user->id)
                ->latest()
                ->first();
        }

        // For CHED / Super Admin: pending requests awaiting decision
        $pendingEditRequests = null;
        if ($user?->isCHED() || $user?->isSuperAdmin()) {
            $pendingEditRequests = $proposal->editPermissionRequests()
                ->where('status', 'pending')
                ->with('requester:id,name')
                ->get();
        }

        return Inertia::render('Research/Show', [
            'proposal'            => $proposal,
            'canEdit'             => $user?->can('update', $proposal) ?? false,
            'canReview'           => $user?->can('review', $proposal) ?? false,
            'canDelete'           => $user?->can('delete', $proposal) ?? false,
            'editPermission'      => $editPermission,
            'pendingEditRequests' => $pendingEditRequests,
        ]);
    }

    public function downloadFile(ResearchProposal $proposal): BinaryFileResponse
    {
        $this->authorize('view', $proposal);
        abort_if(empty($proposal->file_path), 404);
        abort_unless(Storage::disk('public')->exists($proposal->file_path), 404);

        $absolutePath = Storage::disk('public')->path($proposal->file_path);
        $downloadName = $this->safePdfFileName($proposal);
        $disposition = request()->boolean('download') ? 'attachment' : 'inline';

        return response()->file($absolutePath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => $disposition . '; filename="' . $downloadName . '"',
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

    public function edit(ResearchProposal $proposal): Response|RedirectResponse
    {
        if (! request()->user()?->can('update', $proposal)) {
            return redirect()->route('research.show', ['proposal' => $proposal->id])
                ->with('error', 'You are not allowed to edit this research paper.');
        }

        return Inertia::render('Research/Edit', [
            'proposal' => $proposal,
            'keywordOptions' => Keyword::query()->orderBy('name')->pluck('name'),
        ]);
    }

    public function update(UpdateResearchProposalRequest $request, ResearchProposal $proposal): RedirectResponse
    {
        if (! $request->user()->can('update', $proposal)) {
            return redirect()->route('research.show', ['proposal' => $proposal->id])
                ->with('error', 'You are not allowed to update this research paper.');
        }

        $data = $request->validated();
        $normalizedKeywords = $this->parseKeywords($data['keywords'] ?? null);
        $data['keywords'] = $normalizedKeywords !== [] ? implode(', ', $normalizedKeywords) : null;

        if ($request->hasFile('pdf_file')) {
            // Remove old file
            if ($proposal->file_path) {
                Storage::disk('public')->delete($proposal->file_path);
            }
            $data['file_path'] = $request->file('pdf_file')
                ->store('research_papers', 'public');
        }

        unset($data['pdf_file']);

        $oldValues = $this->trackedValues($proposal);

        $proposal->update($data);
        $this->syncKeywords($proposal, $normalizedKeywords);

        $newValues = $this->trackedValues($proposal->fresh());
        $this->logHistory($proposal, $request->user()->id, 'updated', $oldValues, $newValues);

        // Consume the approved edit permission so the lock re-engages after this edit
        $proposal->editPermissionRequests()
            ->where('requested_by', $request->user()->id)
            ->where('status', 'approved')
            ->delete();

        return redirect()->route('research.show', ['proposal' => $proposal->id])
            ->with('success', 'Research paper updated.');
    }

    public function destroy(ResearchProposal $proposal): RedirectResponse
    {
        $this->authorize('delete', $proposal);

        $this->logHistory($proposal, request()->user()?->id, 'deleted', $this->trackedValues($proposal), null);

        if ($proposal->file_path) {
            Storage::disk('public')->delete($proposal->file_path);
        }

        $proposal->delete();

        return redirect()->route('research.index')
            ->with('success', 'Research paper deleted.');
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

        $this->logHistory($proposal, $request->user()->id, $request->action === 'approve' ? 'approved' : 'rejected', null, [
            'status'   => $proposal->status,
            'comments' => $proposal->comments,
        ]);

        $proposal->loadMissing('submitter:id,name,email');

        if ($proposal->submitter && $proposal->submitter->email) {
            $proposal->submitter->notify(new ResearchProposalReviewed($proposal));
        }

        return back()->with('success', 'Review saved.');
    }

    /** @return array<string, mixed> */
    private function trackedValues(ResearchProposal $proposal): array
    {
        return $proposal->only([
            'title', 'authors', 'author_email', 'author_phone',
            'co_authors', 'co_author_emails', 'co_author_phones',
            'year', 'school', 'abstract', 'category', 'keywords',
            'status', 'comments',
        ]);
    }

    /**
     * @param array<string, mixed>|null $oldValues
     * @param array<string, mixed>|null $newValues
     */
    private function logHistory(
        ResearchProposal $proposal,
        ?int $userId,
        string $action,
        ?array $oldValues,
        ?array $newValues,
    ): void {
        // For "updated" entries, only store fields that actually changed
        if ($action === 'updated' && $oldValues !== null && $newValues !== null) {
            $changedOld = [];
            $changedNew = [];

            foreach ($newValues as $key => $newVal) {
                $oldVal = $oldValues[$key] ?? null;
                if ($oldVal !== $newVal) {
                    $changedOld[$key] = $oldVal;
                    $changedNew[$key] = $newVal;
                }
            }

            if ($changedOld === []) {
                return; // nothing changed — skip log entry
            }

            $oldValues = $changedOld;
            $newValues = $changedNew;
        }

        ResearchProposalHistory::create([
            'research_proposal_id' => $proposal->id,
            'user_id'              => $userId,
            'action'               => $action,
            'old_values'           => $oldValues,
            'new_values'           => $newValues,
            'performed_at'         => now(),
        ]);
    }
}
