<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreResearchProposalRequest;
use App\Http\Requests\UpdateResearchProposalRequest;
use App\Models\Discipline;
use App\Models\Institution;
use App\Models\Keyword;
use App\Models\ResearchCategory;
use App\Models\ResearchHistory;
use App\Models\ResearchProposal;
use App\Models\ResearchProposalHistory;
use App\Models\User;
use App\Notifications\ResearchProposalReviewed;
use App\Services\SimpleNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ResearchProposalController extends Controller
{
    /**
     * Disk used for new research PDF uploads. Private (not symlinked into
     * /public/storage), only served via downloadFile/publicDownloadFile
     * after authorization.
     */
    private const RESEARCH_DISK = 'research';

    /**
     * Resolve which disk currently holds a research file. Newly uploaded
     * files live on the private 'research' disk; legacy uploads may still
     * be on the 'public' disk until migrated by `php artisan research:migrate-files`.
     */
    private function resolveResearchDisk(?string $filePath): ?string
    {
        if (! $filePath) {
            return null;
        }
        if (Storage::disk(self::RESEARCH_DISK)->exists($filePath)) {
            return self::RESEARCH_DISK;
        }
        if (Storage::disk('public')->exists($filePath)) {
            return 'public';
        }

        return null;
    }

    public function publicIndex(Request $request): Response
    {
        $sort = (string) $request->input('sort', 'recent');
        $allowedSorts = ['recent', 'oldest', 'year_desc', 'year_asc', 'title_asc', 'title_desc'];
        if (! in_array($sort, $allowedSorts, true)) {
            $sort = 'recent';
        }

        $query = ResearchProposal::with(['institution:id,name'])
            ->select(['id', 'title', 'abstract', 'authors', 'school', 'year', 'keywords', 'category', 'research_category', 'discipline_code', 'status', 'institution_id', 'approved_at', 'updated_at'])
            ->where('status', ResearchProposal::STATUS_APPROVED);

        if ($sort === 'oldest') {
            $query->orderBy('approved_at')->orderBy('updated_at');
        } elseif ($sort === 'year_desc') {
            $query->orderByDesc('year')->orderByDesc('approved_at');
        } elseif ($sort === 'year_asc') {
            $query->orderBy('year')->orderByDesc('approved_at');
        } elseif ($sort === 'title_asc') {
            $query->orderBy('title')->orderByDesc('approved_at');
        } elseif ($sort === 'title_desc') {
            $query->orderByDesc('title')->orderByDesc('approved_at');
        } else {
            $query->orderByDesc('approved_at')->orderByDesc('updated_at');
        }

        $this->applySearchFilters($query, $request, includeStatus: false);
        $disciplineLabels = Discipline::query()->pluck('name', 'code');
        $proposals = $query->paginate(10)->withQueryString();
        $proposals->getCollection()->transform(function (ResearchProposal $proposal) use ($disciplineLabels) {
            $code = (string) ($proposal->discipline_code ?? '');
            $name = $code !== '' ? $disciplineLabels->get($code) : null;

            $proposal->setAttribute('discipline_label', $name ? ($code.' - '.$name) : ($code !== '' ? $code : null));
            $proposal->setAttribute('abstract_snippet', $proposal->abstract ? Str::limit($proposal->abstract, 220) : null);
            $proposal->makeHidden('abstract');

            return $proposal;
        });

        $popularDisciplines = ResearchProposal::query()
            ->where('status', ResearchProposal::STATUS_APPROVED)
            ->whereNotNull('discipline_code')
            ->selectRaw('discipline_code, COUNT(*) as total')
            ->groupBy('discipline_code')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(function ($item) use ($disciplineLabels) {
                $code = (string) $item->discipline_code;

                return [
                    'code' => $code,
                    'name' => $disciplineLabels->get($code) ?: $code,
                    'total' => (int) $item->total,
                ];
            })
            ->values();

        return Inertia::render('Research/PublicIndex', [
            'proposals' => $proposals,
            'filters' => (object) $request->only(['search', 'year', 'year_from', 'year_to', 'school', 'institution_id', 'category', 'discipline_code', 'sort']),
            'institutions' => Institution::query()->orderBy('name')->get(['id', 'name']),
            'categories' => ResearchCategory::query()->orderBy('label')->get(['value', 'label']),
            'disciplines' => Discipline::query()->orderBy('code')->get(['code', 'name']),
            'popularDisciplines' => $popularDisciplines,
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }

    public function publicShow(ResearchProposal $proposal): Response
    {
        abort_unless($proposal->status === ResearchProposal::STATUS_APPROVED, 404);

        $proposal->load(['institution:id,name', 'approver:id,name']);

        $disciplineName = $proposal->discipline_code
            ? Discipline::query()->where('code', $proposal->discipline_code)->value('name')
            : null;

        $proposal->setAttribute(
            'discipline_label',
            $disciplineName
                ? ($proposal->discipline_code.' - '.$disciplineName)
                : ($proposal->discipline_code ?: null)
        );

        $relatedProposals = collect();

        if ($proposal->institution_id || $proposal->research_category || $proposal->category || $proposal->discipline_code) {
            $relatedProposals = ResearchProposal::query()
                ->with(['institution:id,name'])
                ->select(['id', 'title', 'authors', 'year', 'institution_id', 'research_category', 'category', 'discipline_code', 'approved_at'])
                ->where('status', ResearchProposal::STATUS_APPROVED)
                ->whereKeyNot($proposal->id)
                ->where(function ($query) use ($proposal) {
                    if ($proposal->institution_id) {
                        $query->orWhere('institution_id', $proposal->institution_id);
                    }

                    if ($proposal->research_category || $proposal->category) {
                        $query->orWhere('research_category', $proposal->research_category ?: $proposal->category)
                            ->orWhere('category', $proposal->research_category ?: $proposal->category);
                    }

                    if ($proposal->discipline_code) {
                        $query->orWhere('discipline_code', $proposal->discipline_code);
                    }
                })
                ->orderByRaw('CASE WHEN institution_id = ? THEN 0 ELSE 1 END', [$proposal->institution_id ?: 0])
                ->orderByDesc('approved_at')
                ->limit(4)
                ->get();
        }

        return Inertia::render('Research/PublicShow', [
            'proposal' => $proposal,
            'relatedProposals' => $relatedProposals,
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }

    public function publicInstitutionShow(Request $request, Institution $institution): Response
    {
        $papersQuery = ResearchProposal::query()
            ->with(['institution:id,name'])
            ->select(['id', 'title', 'abstract', 'authors', 'school', 'year', 'keywords', 'research_category', 'category', 'discipline_code', 'status', 'institution_id', 'approved_at'])
            ->where('status', ResearchProposal::STATUS_APPROVED)
            ->where('institution_id', $institution->id);

        $this->applySearchFilters($papersQuery, $request, includeStatus: false);

        $tag = trim((string) $request->input('tag', ''));
        if ($tag !== '') {
            $papersQuery->where(function ($query) use ($tag) {
                $query->where('keywords', 'like', "%{$tag}%")
                    ->orWhereHas('keywordItems', fn ($keywordQuery) => $keywordQuery->where('name', 'like', "%{$tag}%"));
            });
        }

        $papers = $papersQuery
            ->orderByDesc('approved_at')
            ->paginate(10)
            ->withQueryString();

        $statsBase = ResearchProposal::query()
            ->where('status', ResearchProposal::STATUS_APPROVED)
            ->where('institution_id', $institution->id);

        $latestApprovedAt = (clone $statsBase)->max('approved_at');
        $topCategories = (clone $statsBase)
            ->selectRaw('COALESCE(research_category, category) as label, COUNT(*) as total')
            ->where(function ($query) {
                $query->whereNotNull('research_category')
                    ->orWhereNotNull('category');
            })
            ->groupByRaw('COALESCE(research_category, category)')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        return Inertia::render('Research/PublicInstitution', [
            'institution' => [
                'id' => $institution->id,
                'name' => $institution->name,
                'code' => $institution->code,
                'address' => $institution->address,
                'contact_email' => $institution->contact_email,
                'contact_phone' => $institution->contact_phone,
            ],
            'papers' => $papers,
            'stats' => [
                'approved_count' => (clone $statsBase)->count(),
                'latest_year' => (clone $statsBase)->max('year'),
                'latest_approved_at' => $latestApprovedAt,
                'top_categories' => $topCategories,
            ],
            'filters' => (object) $request->only(['search', 'category', 'discipline_code', 'year', 'tag']),
            'categories' => ResearchCategory::query()->orderBy('label')->get(['value', 'label']),
            'disciplines' => Discipline::query()->orderBy('code')->get(['code', 'name']),
            'years' => (clone $statsBase)
                ->whereNotNull('year')
                ->select('year')
                ->distinct()
                ->orderByDesc('year')
                ->pluck('year')
                ->values(),
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }

    public function publicDownloadFile(ResearchProposal $proposal): BinaryFileResponse
    {
        abort_unless($proposal->status === ResearchProposal::STATUS_APPROVED, 404);
        abort_if(empty($proposal->file_path), 404);

        $disk = $this->resolveResearchDisk($proposal->file_path);
        abort_unless($disk !== null, 404);

        $absolutePath = Storage::disk($disk)->path($proposal->file_path);
        $downloadName = $this->safePdfFileName($proposal);
        $disposition = request()->boolean('download') ? 'attachment' : 'inline';

        return response()->file($absolutePath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => $disposition.'; filename="'.$downloadName.'"',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $tab = (string) $request->input('tab', '');

        $query = ResearchProposal::with(['submitter:id,name', 'institution:id,name'])
            ->select(['id', 'title', 'authors', 'year', 'school', 'keywords', 'status', 'institution_id', 'submitted_by', 'viewed_at', 'updated_at'])
            ->orderByDesc('updated_at');

        $this->applySearchFilters($query, $request, includeStatus: true);

        // Student: own papers only
        if ($user->isStudent()) {
            $query->where('submitted_by', $user->id);
        } elseif ($user->isFaculty()) {
            // Faculty: papers from assigned students, plus revised papers this faculty previously rejected.
            $query->where(function ($inner) use ($user) {
                $inner->whereHas('submitter', fn ($submitter) => $submitter->where('faculty_id', $user->id))
                    ->orWhereHas('histories', fn ($history) => $history
                        ->where('action', 'rejected')
                        ->where('user_id', $user->id));
            });
        } elseif ($user->role === User::ROLE_HEI) {
            // HEI: only student proposals where student -> faculty -> HEI matches current user.
            $query->whereHas('submitter', function ($inner) use ($user) {
                $inner->where('role', User::ROLE_STUDENT)
                    ->whereHas('faculty', fn ($faculty) => $faculty->where('hei_id', $user->id));
            });
        }

        $editability = (string) $request->input('editability', '');
        if ($editability === 'editable') {
            $query->where('status', ResearchProposal::STATUS_REJECTED);
        } elseif ($editability === 'locked') {
            $query->where(function ($inner) {
                $inner->where('status', '!=', ResearchProposal::STATUS_REJECTED)
                    ->orWhereNotNull('viewed_at');
            });
        }

        if ($tab === 'queue' && ! $user->isStudent()) {
            if ($user->isFaculty()) {
                $query->where('status', ResearchProposal::STATUS_UNDER_REVIEW_FACULTY);
            } elseif ($user->role === User::ROLE_HEI) {
                $query->where('status', ResearchProposal::STATUS_UNDER_REVIEW_HEI);
            } elseif ($user->isCHED()) {
                $query->where('status', ResearchProposal::STATUS_UNDER_REVIEW_CHED);
            } elseif ($user->isSuperAdmin()) {
                $query->whereIn('status', ResearchProposal::PENDING_STATUSES);
            }
        }

        return Inertia::render('Research/Index', [
            'proposals' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['search', 'status', 'year', 'school', 'editability', 'tab', 'discipline_code', 'hei_id']),
            'tab' => $tab,
            'canCreate' => $user->isStudent(),
            'disciplines' => Discipline::query()->where('is_active', true)->orderBy('code')->get(['code', 'name']),
            'institutions' => $user->isSuperAdmin() || $user->isCHED()
                ? Institution::query()->orderBy('name')->get(['id', 'name'])
                : Institution::query()->where('id', $user->institution_id)->get(['id', 'name']),
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
                    ->orWhere('school', 'like', "%{$search}%")
                    ->orWhereHas('institution', fn ($institutionQuery) => $institutionQuery->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('keywordItems', fn ($keywordQuery) => $keywordQuery->where('name', 'like', "%{$search}%"));
            });
        }

        $year = (int) $request->input('year');
        $minYear = 1900;
        $maxYear = (int) date('Y') + 1;

        if ($request->filled('year') && $year > 0) {
            $year = max($minYear, min($maxYear, $year));
            $query->where('year', $year);
        } else {
            $yearFrom = (int) $request->input('year_from');
            $yearTo = (int) $request->input('year_to');

            if ($request->filled('year_from') && $yearFrom > 0) {
                $yearFrom = max($minYear, min($maxYear, $yearFrom));
                $query->where('year', '>=', $yearFrom);
            }

            if ($request->filled('year_to') && $yearTo > 0) {
                $yearTo = max($minYear, min($maxYear, $yearTo));
                $query->where('year', '<=', $yearTo);
            }
        }

        $query->when($request->filled('school'), fn ($q) => $q->where('school', 'like', '%'.trim((string) $request->input('school')).'%'));
        $query->when($request->filled('institution_id'), fn ($q) => $q->where('institution_id', (int) $request->input('institution_id')));
        $query->when($request->filled('hei_id'), fn ($q) => $q->where('institution_id', (int) $request->input('hei_id')));
        $query->when($request->filled('discipline_code'), fn ($q) => $q->where('discipline_code', trim((string) $request->input('discipline_code'))));

        if (! $includeStatus) {
            $query->when($request->filled('category'), function ($q) use ($request) {
                $category = trim((string) $request->input('category'));

                if ($category !== '') {
                    $q->where(function ($categoryQuery) use ($category) {
                        $categoryQuery->where('research_category', $category)
                            ->orWhere('category', $category);
                    });
                }
            });
        }

        if ($includeStatus) {
            $query->when($request->filled('status'), function ($q) use ($request) {
                $status = (string) $request->input('status');

                if ($status === 'pending') {
                    $q->whereIn('status', ResearchProposal::PENDING_STATUSES);

                    return;
                }

                $q->where('status', $status);
            });
        }
    }

    public function create(): Response
    {
        $this->authorize('create', ResearchProposal::class);

        return Inertia::render('Research/Create', [
            'keywordOptions' => Keyword::query()->orderBy('name')->pluck('name'),
            'disciplineOptions' => $this->disciplineOptions(),
            'researchCategoryGroups' => $this->researchCategoryGroups(),
        ]);
    }

    public function store(StoreResearchProposalRequest $request): RedirectResponse
    {
        $guardErrors = $this->submissionGuardrailErrors($request->user());

        if ($guardErrors !== []) {
            return back()->withErrors($guardErrors)->withInput();
        }

        $data = $request->validated();
        $data['category'] = $data['research_category'];
        $data['category_type'] = $this->resolveCategoryType($data['research_category']) ?? $data['category_type'] ?? null;
        $data['discipline_code'] = $data['discipline'];
        $normalizedKeywords = $this->parseKeywords($data['keywords'] ?? null);
        $data['keywords'] = $normalizedKeywords !== [] ? implode(', ', $normalizedKeywords) : null;

        if ($request->hasFile('pdf_file')) {
            $data['file_path'] = $request->file('pdf_file')
                ->store('research_papers', self::RESEARCH_DISK);
        }

        unset($data['pdf_file']);
        unset($data['discipline']);

        $proposal = ResearchProposal::create([
            ...$data,
            'submitted_by' => $request->user()->id,
            'submitted_at' => now(),
            'institution_id' => $request->user()->institution_id,
            'status' => ResearchProposal::STATUS_UNDER_REVIEW_FACULTY,
        ]);

        $requestUser = $request->user();
        SimpleNotificationService::notify(
            $requestUser?->faculty_id,
            "New submission '{$proposal->title}' is waiting for your review.",
            route('research.show', $proposal->id).'#review-decision',
            'review_action_needed'
        );

        $this->syncKeywords($proposal, $normalizedKeywords);

        $this->logHistory($proposal, $request->user()->id, 'created', null, $this->trackedValues($proposal));
        $this->logResearchHistory($proposal, $request->user(), 'submitted');

        return redirect()->route('research.show', ['proposal' => $proposal->id])
            ->with('success', 'Research paper submitted for faculty review.');
    }

    public function show(ResearchProposal $proposal): Response
    {
        $this->authorize('view', $proposal);
        $user = request()->user();

        if ($user?->isCHED() && $proposal->isPendingChed() && is_null($proposal->viewed_at)) {
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

        $proposal->load(['submitter:id,name', 'viewer:id,name', 'reviewer:id,name', 'approver:id,name', 'rejector:id,name', 'institution:id,name']);
        $proposal->load(['researchHistories.actor:id,name']);

        $lastActionBy = $proposal->submitter?->name;
        $lastActionAt = $proposal->submitted_at ?? $proposal->created_at;

        if ($proposal->status === ResearchProposal::STATUS_APPROVED && $proposal->approver) {
            $lastActionBy = $proposal->approver->name;
            $lastActionAt = $proposal->approved_at ?? $proposal->reviewed_at ?? $proposal->updated_at;
        } elseif ($proposal->status === ResearchProposal::STATUS_REJECTED && $proposal->rejector) {
            $lastActionBy = $proposal->rejector->name;
            $lastActionAt = $proposal->rejected_at ?? $proposal->reviewed_at ?? $proposal->updated_at;
        } elseif ($proposal->reviewer) {
            $lastActionBy = $proposal->reviewer->name;
            $lastActionAt = $proposal->reviewed_at ?? $proposal->updated_at;
        }

        $proposal->setAttribute('last_action_by', $lastActionBy);
        $proposal->setAttribute('last_action_at', $lastActionAt);

        $proposal->setAttribute('current_stage', match ($proposal->status) {
            ResearchProposal::STATUS_UNDER_REVIEW_FACULTY => 'Under Faculty Review',
            ResearchProposal::STATUS_UNDER_REVIEW_HEI => 'Under HEI Review',
            ResearchProposal::STATUS_UNDER_REVIEW_CHED => 'Under CHED Review',
            ResearchProposal::STATUS_APPROVED => 'Approved',
            ResearchProposal::STATUS_REJECTED => 'Rejected',
            default => ucfirst(str_replace('_', ' ', (string) $proposal->status)),
        });

        $proposal->setAttribute(
            'last_reviewer',
            $proposal->reviewer?->name ?? $proposal->approver?->name ?? $proposal->rejector?->name,
        );

        $proposal->setAttribute(
            'last_decision_time',
            $proposal->approved_at ?? $proposal->rejected_at ?? $proposal->reviewed_at,
        );

        // For Student: latest edit permission request on this proposal
        $editPermission = null;
        if ($user?->isStudent() && $proposal->submitted_by === $user->id) {
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
            'proposal' => $proposal,
            'researchHistory' => $proposal->researchHistories
                ->map(fn (ResearchHistory $entry) => [
                    'id' => $entry->id,
                    'action' => $entry->action,
                    'role' => $entry->role,
                    'remarks' => $entry->remarks,
                    'created_at' => $entry->created_at,
                    'performed_by' => $entry->performed_by,
                    'actor_name' => $entry->actor?->name,
                ])
                ->values(),
            'canEdit' => $user?->can('update', $proposal) ?? false,
            'canReview' => $user?->can('review', $proposal) ?? false,
            'canDelete' => $user?->can('delete', $proposal) ?? false,
            'editPermission' => $editPermission,
            'pendingEditRequests' => $pendingEditRequests,
            'breadcrumbs' => [
                ['label' => 'My Research', 'href' => route('research.index', ['tab' => 'mine'])],
                ['label' => $proposal->title],
            ],
        ]);
    }

    public function downloadFile(ResearchProposal $proposal): BinaryFileResponse
    {
        $this->authorize('view', $proposal);
        abort_if(empty($proposal->file_path), 404);

        $disk = $this->resolveResearchDisk($proposal->file_path);
        abort_unless($disk !== null, 404);

        $absolutePath = Storage::disk($disk)->path($proposal->file_path);
        $downloadName = $this->safePdfFileName($proposal);
        $disposition = request()->boolean('download') ? 'attachment' : 'inline';

        return response()->file($absolutePath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => $disposition.'; filename="'.$downloadName.'"',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function safePdfFileName(ResearchProposal $proposal): string
    {
        $slug = Str::slug($proposal->title ?? 'research-paper');

        if ($slug === '') {
            $slug = 'research-paper-'.$proposal->id;
        }

        return $slug.'.pdf';
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
            'disciplineOptions' => $this->disciplineOptions(),
            'researchCategoryGroups' => $this->researchCategoryGroups(),
            'breadcrumbs' => [
                ['label' => 'My Research', 'href' => route('research.index', ['tab' => 'mine'])],
                ['label' => $proposal->title, 'href' => route('research.show', $proposal->id)],
                ['label' => 'Edit'],
            ],
        ]);
    }

    public function update(UpdateResearchProposalRequest $request, ResearchProposal $proposal): RedirectResponse
    {
        if (! $request->user()->can('update', $proposal)) {
            return redirect()->route('research.show', ['proposal' => $proposal->id])
                ->with('error', 'You are not allowed to update this research paper.');
        }

        $hasApprovedPermission = $proposal->editPermissionRequests()
            ->where('requested_by', $request->user()->id)
            ->where('status', 'approved')
            ->exists();

        $data = $request->validated();
        $data['category'] = $data['research_category'];
        $data['category_type'] = $this->resolveCategoryType($data['research_category']) ?? $data['category_type'] ?? null;
        $data['discipline_code'] = $data['discipline'];
        $normalizedKeywords = $this->parseKeywords($data['keywords'] ?? null);
        $data['keywords'] = $normalizedKeywords !== [] ? implode(', ', $normalizedKeywords) : null;

        if ($request->hasFile('pdf_file')) {
            if ($proposal->file_path) {
                $oldDisk = $this->resolveResearchDisk($proposal->file_path);
                if ($oldDisk) {
                    Storage::disk($oldDisk)->delete($proposal->file_path);
                }
            }
            $data['file_path'] = $request->file('pdf_file')
                ->store('research_papers', self::RESEARCH_DISK);
        }

        if ($hasApprovedPermission) {
            $data = array_merge($data, [
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
        }

        unset($data['pdf_file']);
        unset($data['discipline']);

        $oldValues = $this->trackedValues($proposal);

        $proposal->update($data);
        $this->syncKeywords($proposal, $normalizedKeywords);

        $newValues = $this->trackedValues($proposal->fresh());
        $this->logHistory($proposal, $request->user()->id, 'updated', $oldValues, $newValues);
        $this->logResearchHistory($proposal, $request->user(), 'edited');

        // Consume the approved edit permission so the lock re-engages after this edit
        $proposal->editPermissionRequests()
            ->where('requested_by', $request->user()->id)
            ->where('status', 'approved')
            ->delete();

        if ($hasApprovedPermission) {
            SimpleNotificationService::notify(
                $request->user()?->faculty_id,
                "Updated submission '{$proposal->title}' was resubmitted and is awaiting your Faculty review.",
                route('research.show', $proposal->id).'#review-decision',
                'review_action_needed'
            );
        }

        return redirect()->route('research.show', ['proposal' => $proposal->id])
            ->with('success', $hasApprovedPermission
                ? 'Research paper updated and routed back to Faculty review.'
                : 'Research paper updated.');
    }

    public function resubmit(ResearchProposal $proposal): RedirectResponse
    {
        $user = request()->user();

        abort_unless($user && $user->isStudent() && $proposal->submitted_by === $user->id, 403);

        if ($proposal->status !== ResearchProposal::STATUS_REJECTED) {
            return redirect()->route('research.show', ['proposal' => $proposal->id])
                ->with('error', 'Only rejected submissions can be resubmitted.');
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

        $this->logHistory($proposal, $user->id, 'resubmitted', null, [
            'status' => $proposal->status,
            'submitted_at' => $proposal->submitted_at,
        ]);
        $this->logResearchHistory($proposal, $user, 'submitted', 'Resubmitted after revision.');

        return redirect()->route('research.show', ['proposal' => $proposal->id])
            ->with('success', 'Submission resubmitted and routed back to Faculty review.');
    }

    public function destroy(ResearchProposal $proposal): RedirectResponse
    {
        $this->authorize('delete', $proposal);

        $this->logHistory($proposal, request()->user()?->id, 'deleted', $this->trackedValues($proposal), null);

        if ($proposal->file_path) {
            $disk = $this->resolveResearchDisk($proposal->file_path);
            if ($disk) {
                Storage::disk($disk)->delete($proposal->file_path);
            }
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
     * @param  array<int, string>  $keywordNames
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

    /** Faculty / HEI / CHED / Super Admin reviews a paper */
    public function review(Request $request, ResearchProposal $proposal): RedirectResponse
    {
        $this->authorize('review', $proposal);

        if (! $proposal->isPending()) {
            return back()->with('error', 'Only pending papers can be reviewed.');
        }

        $request->validate([
            'action' => ['required', 'in:approve,reject'],
            'comments' => ['nullable', 'string', 'max:2000', 'required_if:action,reject'],
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

        if ($request->action === 'approve') {
            if ($reviewer->isFaculty()) {
                $approvedByFacultyAt = now();
            } elseif ($reviewer->role === User::ROLE_HEI) {
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
            $rejectedBy = $reviewer->id;
            $remarks = $request->comments;
            $nextStatus = ResearchProposal::STATUS_REJECTED;
        }

        $proposal->update([
            'status' => $nextStatus,
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
            'comments' => $request->comments,
        ]);

        $submitter = $proposal->submitter;

        if ($request->action === 'approve') {
            if ($nextStatus === ResearchProposal::STATUS_UNDER_REVIEW_HEI) {
                SimpleNotificationService::notify(
                    $submitter?->hei_id,
                    "Submission '{$proposal->title}' is now awaiting HEI review.",
                    route('research.show', $proposal->id).'#review-decision',
                    'review_action_needed'
                );
            } elseif ($nextStatus === ResearchProposal::STATUS_UNDER_REVIEW_CHED) {
                SimpleNotificationService::notify(
                    $submitter?->ched_id,
                    "Submission '{$proposal->title}' is now awaiting CHED review.",
                    route('research.show', $proposal->id).'#review-decision',
                    'review_action_needed'
                );
            } elseif ($nextStatus === ResearchProposal::STATUS_APPROVED) {
                SimpleNotificationService::notify(
                    $submitter?->id,
                    "Your submission '{$proposal->title}' was approved.",
                    route('research.show', $proposal->id).'#research-actions',
                    'research_approved'
                );
            }
        } else {
            SimpleNotificationService::notify(
                $submitter?->id,
                "Your submission '{$proposal->title}' was rejected.",
                route('research.show', $proposal->id).'#reviewer-comments',
                'research_rejected'
            );
        }

        $this->logHistory($proposal, $request->user()->id, $request->action === 'approve' ? 'approved' : 'rejected', null, [
            'status' => $proposal->status,
            'comments' => $proposal->comments,
        ]);
        $this->logResearchHistory(
            $proposal,
            $reviewer,
            $request->action === 'approve' ? 'approved' : 'rejected',
            $request->action === 'reject' ? (string) $request->comments : null,
        );

        $proposal->loadMissing('submitter:id,name,email');

        if ($proposal->submitter && $proposal->submitter->email) {
            $proposal->submitter->notify(new ResearchProposalReviewed($proposal));
        }

        if ($request->action === 'reject') {
            return back()->with('success', 'Submission rejected and returned to student for revision.');
        }

        if ($isFinalApproval) {
            return back()->with('success', 'Final approval completed.');
        }

        return back()->with('success', 'Submission approved and moved to the next review stage.');
    }

    /** @return array<string, mixed> */
    private function trackedValues(ResearchProposal $proposal): array
    {
        return $proposal->only([
            'title', 'authors', 'author_email', 'author_phone',
            'co_authors', 'co_author_emails', 'co_author_phones',
            'year', 'school', 'abstract', 'category', 'research_category', 'category_type', 'discipline_code', 'keywords',
            'status', 'comments',
        ]);
    }

    /** @return array<int, array<string, mixed>> */
    private function disciplineOptions(): array
    {
        return Discipline::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('code')
            ->get(['code', 'name'])
            ->map(fn (Discipline $discipline) => [
                'value' => $discipline->code,
                'label' => $discipline->name,
            ])
            ->all();
    }

    /** @return array<int, array<string, mixed>> */
    private function researchCategoryGroups(): array
    {
        $categories = ResearchCategory::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('label')
            ->get(['type', 'value', 'label']);

        $labelByType = [
            'data_type' => 'By Data Type',
            'purpose' => 'By Purpose',
            'method' => 'By Method',
        ];

        return collect($labelByType)
            ->map(function (string $groupLabel, string $type) use ($categories) {
                $options = $categories
                    ->where('type', $type)
                    ->map(fn (ResearchCategory $category) => [
                        'label' => $category->label,
                        'value' => $category->value,
                    ])
                    ->values()
                    ->all();

                return [
                    'label' => $groupLabel,
                    'type' => $type,
                    'options' => $options,
                ];
            })
            ->values()
            ->all();
    }

    private function resolveCategoryType(string $categoryValue): ?string
    {
        return ResearchCategory::query()
            ->where('value', $categoryValue)
            ->where('is_active', true)
            ->value('type');
    }

    /**
     * @param  array<string, mixed>|null  $oldValues
     * @param  array<string, mixed>|null  $newValues
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
            'user_id' => $userId,
            'action' => $action,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'performed_at' => now(),
        ]);
    }

    private function logResearchHistory(
        ResearchProposal $proposal,
        ?User $actor,
        string $action,
        ?string $remarks = null,
    ): void {
        ResearchHistory::create([
            'research_id' => $proposal->id,
            'action' => $action,
            'performed_by' => $actor?->id,
            'role' => $actor?->role ?? 'system',
            'remarks' => $remarks,
            'created_at' => now(),
        ]);
    }

    /**
     * @return array<string, string>
     */
    private function submissionGuardrailErrors(?User $user): array
    {
        if (! $user) {
            return [
                'user' => 'Unable to determine submitting account.',
            ];
        }

        if (! $user->institution_id) {
            return [
                'institution_id' => 'Your account must be linked to an institution before submitting a proposal.',
            ];
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
            return [
                'role_linkage' => 'Your student account is missing required role linkage: '.implode(', ', $missing).'.',
            ];
        }

        return [];
    }
}
