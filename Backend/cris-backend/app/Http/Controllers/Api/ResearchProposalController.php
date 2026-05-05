<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Keyword;
use App\Models\ResearchProposal;
use App\Services\SimpleNotificationService;
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
        } elseif ($user->isFaculty()) {
            // Faculty sees proposals submitted by their students
            $proposals = ResearchProposal::query()
                ->select($selectColumns)
                ->with(['institution:id,name,code'])
                ->whereHas('submitter', fn ($inner) => $inner->where('faculty_id', $user->id))
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        } elseif ($user->role === \App\Models\User::ROLE_HEI) {
            // HEI sees student proposals where student -> faculty -> HEI matches current user.
            $proposals = ResearchProposal::query()
                ->select($selectColumns)
                ->with(['institution:id,name,code'])
                ->whereHas('submitter', fn ($inner) => $inner
                    ->where('role', \App\Models\User::ROLE_STUDENT)
                    ->whereHas('faculty', fn ($faculty) => $faculty->where('hei_id', $user->id))
                )
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        } else {
            // Student sees own proposals
            $proposals = ResearchProposal::query()
                ->select($selectColumns)
                ->with(['institution:id,name,code'])
                ->where('submitted_by', $user->id)
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        }
        
        return response()->json($proposals);
    }

    // Student: Create proposal
    public function store(Request $request)
    {
        $this->authorize('create', ResearchProposal::class);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255', 'regex:/\\S/'],
            'abstract' => 'required|string',
            'authors' => 'nullable|string|max:500',
            'researchers' => 'nullable|string|max:500',
            'co_authors' => 'nullable|string|max:500',
            'year' => 'nullable|integer|min:1900|max:2100',
            'school' => 'nullable|string|max:255',
            'category' => 'required|string',
            'keywords' => 'nullable|string',
        ]);

        $request->validate([
            'title' => ['regex:/\\S/'],
        ], [
            'title.regex' => 'Title cannot be empty or whitespace only.',
        ]);

        $this->assertSubmissionGuardrails($request);

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
            'submitted_at' => now(),
            'status' => ResearchProposal::STATUS_UNDER_REVIEW_FACULTY,
        ]);

        $requestUser = $request->user();
        SimpleNotificationService::notify(
            $requestUser?->faculty_id,
            "New submission '{$proposal->title}' is waiting for your review.",
            route('research.show', $proposal->id)
        );

        $this->syncKeywords($proposal, $normalizedKeywords);

        return response()->json([
            'message' => 'Proposal submitted for faculty review',
            'proposal' => $proposal->load('institution'),
        ], 201);
    }

    // View single proposal
    public function show(ResearchProposal $proposal)
    {
        $this->authorize('view', $proposal);

        return response()->json($proposal->load(['institution', 'submitter', 'reviewer']));
    }

    // Student: Update own rejected proposal
    public function update(Request $request, ResearchProposal $proposal)
    {
        $this->authorize('update', $proposal);

        if ($proposal->status !== ResearchProposal::STATUS_REJECTED) {
            throw ValidationException::withMessages([
                'proposal' => ['Only rejected proposals can be edited.'],
            ]);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255', 'regex:/\\S/'],
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

    public function resubmit(Request $request, ResearchProposal $proposal)
    {
        $user = $request->user();

        if (! $user || ! $user->isStudent() || $proposal->submitted_by !== $user->id) {
            return response()->json([
                'message' => 'This action is unauthorized.',
                'status' => 403,
            ], 403);
        }

        if ($proposal->status !== ResearchProposal::STATUS_REJECTED) {
            throw ValidationException::withMessages([
                'proposal' => ['Only rejected submissions can be resubmitted.'],
            ]);
        }

        $proposal->update([
            'status' => ResearchProposal::STATUS_UNDER_REVIEW_FACULTY,
            'submitted_at' => now(),
            'reviewed_by' => null,
            'reviewed_at' => null,
            'approved_by' => null,
            'approved_at' => null,
            'approved_by_faculty_at' => null,
            'approved_by_hei_at' => null,
            'approved_by_ched_at' => null,
            'rejected_at' => null,
            'rejected_by' => null,
            'remarks' => null,
            'comments' => null,
            'viewed_by' => null,
            'viewed_at' => null,
        ]);

        return response()->json([
            'message' => 'Proposal resubmitted for faculty review',
            'proposal' => $proposal->load('institution'),
        ]);
    }

    // Faculty/HEI/CHED/SuperAdmin: Review proposal
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
            'comments' => 'nullable|string|required_if:status,rejected',
        ]);

        $nextStatus = ResearchProposal::STATUS_REJECTED;
        $isFinalApproval = false;
        $reviewer = $request->user();
        $approvedByFacultyAt = $proposal->approved_by_faculty_at;
        $approvedByHeiAt = $proposal->approved_by_hei_at;
        $approvedByChedAt = $proposal->approved_by_ched_at;
        $rejectedAt = null;
        $rejectedBy = null;
        $remarks = null;

        if ($validated['status'] === 'approved') {
            if ($reviewer->isFaculty()) {
                $approvedByFacultyAt = now();
            } elseif ($reviewer->role === \App\Models\User::ROLE_HEI) {
                $approvedByHeiAt = now();
            } elseif ($reviewer->isCHED()) {
                $approvedByChedAt = now();
            }

            if ($proposal->isPendingFaculty()) {
                $nextStatus = ResearchProposal::STATUS_UNDER_REVIEW_HEI;
            } elseif ($proposal->isPendingHei()) {
                $nextStatus = ResearchProposal::STATUS_UNDER_REVIEW_CHED;
            } elseif ($proposal->isPendingChed()) {
                $nextStatus = ResearchProposal::STATUS_APPROVED;
                $isFinalApproval = true;
            }
        } else {
            $rejectedAt = now();
            $rejectedBy = $reviewer?->id;
            $remarks = $validated['comments'] ?? null;
            $nextStatus = ResearchProposal::STATUS_REJECTED;
        }

        $proposal->update([
            'status' => $nextStatus,
            'comments' => $validated['comments'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'approved_by' => $isFinalApproval ? $request->user()->id : null,
            'approved_at' => $isFinalApproval ? now() : null,
            'approved_by_faculty_at' => $approvedByFacultyAt,
            'approved_by_hei_at' => $approvedByHeiAt,
            'approved_by_ched_at' => $approvedByChedAt,
            'rejected_at' => $rejectedAt,
            'rejected_by' => $rejectedBy,
            'remarks' => $remarks,
        ]);

        $submitter = $proposal->submitter;

        if ($validated['status'] === 'approved') {
            if ($nextStatus === ResearchProposal::STATUS_UNDER_REVIEW_HEI) {
                SimpleNotificationService::notify(
                    $submitter?->hei_id,
                    "Submission '{$proposal->title}' is now awaiting HEI review.",
                    route('research.show', $proposal->id)
                );
            } elseif ($nextStatus === ResearchProposal::STATUS_UNDER_REVIEW_CHED) {
                SimpleNotificationService::notify(
                    $submitter?->ched_id,
                    "Submission '{$proposal->title}' is now awaiting CHED review.",
                    route('research.show', $proposal->id)
                );
            } elseif ($nextStatus === ResearchProposal::STATUS_APPROVED) {
                SimpleNotificationService::notify(
                    $submitter?->id,
                    "Your submission '{$proposal->title}' was approved.",
                    route('research.show', $proposal->id)
                );
            }
        } else {
            SimpleNotificationService::notify(
                $submitter?->id,
                "Your submission '{$proposal->title}' was rejected.",
                route('research.show', $proposal->id)
            );
        }

        return response()->json([
            'message' => 'Proposal reviewed',
            'proposal' => $proposal->load(['institution', 'submitter', 'reviewer']),
        ]);
    }

    // Student: Delete own rejected proposal
    public function destroy(Request $request, ResearchProposal $proposal)
    {
        $this->authorize('delete', $proposal);

        if ($proposal->status !== ResearchProposal::STATUS_REJECTED) {
            throw ValidationException::withMessages([
                'proposal' => ['Only rejected proposals can be deleted.'],
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

    private function assertSubmissionGuardrails(Request $request): void
    {
        $user = $request->user();

        if (! $user?->institution_id) {
            throw ValidationException::withMessages([
                'institution_id' => ['Your account must be linked to an institution before submitting a proposal.'],
            ]);
        }

        $missing = [];

        if (! $user->faculty_id) {
            $missing[] = 'faculty link';
        }

        if (! $user->hei_id) {
            $missing[] = 'HEI link';
        }

        if (! $user->ched_id) {
            $missing[] = 'CHED link';
        }

        if ($missing !== []) {
            throw ValidationException::withMessages([
                'role_linkage' => ['Your student account is missing required role linkage: ' . implode(', ', $missing) . '.'],
            ]);
        }
    }
}