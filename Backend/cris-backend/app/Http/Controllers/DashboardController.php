<?php

namespace App\Http\Controllers;

use App\Models\ResearchProposal;
use App\Models\User;
use App\Models\EditPermissionRequest;
use App\Models\Discipline;
use App\Models\Institution;
use App\Models\SimpleNotification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Response;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /** Redirect to role-specific dashboard */
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user?->role === User::ROLE_PENDING) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')
                ->with('status', 'Your account is pending Super Admin approval.');
        }

        return match ($user->role) {
            'super_admin' => redirect()->route('admin.dashboard'),
            'ched'        => redirect()->route('ched.dashboard'),
            'hei'         => redirect()->route('hei.dashboard'),
            'faculty'     => redirect()->route('faculty.dashboard'),
            'student'     => redirect()->route('student.dashboard'),
            default       => redirect()->route('hei.dashboard'),
        };
    }

    public function student(Request $request): Response
    {
        $user = $request->user();
        $filters = $this->dashboardFilters($request, $user);
        $filterOptions = $this->dashboardFilterOptions($user);
        $base = ResearchProposal::where('submitted_by', $user->id);
        $this->applyDashboardFilters($base, $filters);
        $startOfMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();
        $monthKeyExpression = $this->monthKeyExpression();

        $approvedCount = (clone $base)->where('status', 'approved')->count();
        $totalCount = (clone $base)->count();

        $stats = [
            'total'        => $totalCount,
            'pending'      => (clone $base)->whereIn('status', ResearchProposal::PENDING_STATUSES)->count(),
            'approved'     => $approvedCount,
            'rejected'     => (clone $base)->where('status', 'rejected')->count(),
            'uploadedThisMonth' => (clone $base)->whereBetween('created_at', [$startOfMonth, $endOfMonth])->count(),
            'approvalRate' => $totalCount > 0 ? round(($approvedCount / $totalCount) * 100, 1) : 0,
        ];

        $stageCounts = [
            'under_review_faculty' => (clone $base)->where('status', ResearchProposal::STATUS_UNDER_REVIEW_FACULTY)->count(),
            'under_review_hei' => (clone $base)->where('status', ResearchProposal::STATUS_UNDER_REVIEW_HEI)->count(),
            'under_review_ched' => (clone $base)->where('status', ResearchProposal::STATUS_UNDER_REVIEW_CHED)->count(),
            'approved' => (clone $base)->where('status', ResearchProposal::STATUS_APPROVED)->count(),
            'rejected' => (clone $base)->where('status', ResearchProposal::STATUS_REJECTED)->count(),
        ];

        $recentUploads = ResearchProposal::where('submitted_by', $user->id)
            ->tap(fn (Builder $query) => $this->applyDashboardFilters($query, $filters))
            ->orderByDesc('updated_at')
            ->limit(10)
            ->get(['id', 'title', 'status', 'remarks', 'year', 'school', 'updated_at']);

        $pendingQueue = ResearchProposal::where('submitted_by', $user->id)
            ->tap(fn (Builder $query) => $this->applyDashboardFilters($query, $filters))
            ->whereIn('status', ResearchProposal::PENDING_STATUSES)
            ->orderBy('created_at')
            ->limit(5)
            ->get(['id', 'title', 'created_at']);

        $monthlyActivity = (clone $base)
            ->selectRaw("{$monthKeyExpression} as month_key, status, COUNT(*) as count")
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->groupByRaw("{$monthKeyExpression}, status")
            ->orderBy('month_key')
            ->get()
            ->groupBy('month_key')
            ->map(function ($group, $monthKey) {
                return [
                    'month' => date('M Y', strtotime($monthKey . '-01')),
                    'uploads' => $group->sum('count'),
                    'approved' => $group->where('status', ResearchProposal::STATUS_APPROVED)->sum('count'),
                    'pending' => $group->whereIn('status', ResearchProposal::PENDING_STATUSES)->sum('count'),
                    'rejected' => $group->where('status', ResearchProposal::STATUS_REJECTED)->sum('count'),
                ];
            })
            ->values();

        return Inertia::render('Dashboard/Student', [
            'stats'         => $stats,
            'stageCounts'   => $stageCounts,
            'recentUploads' => $recentUploads,
            'pendingQueue'  => $pendingQueue,
            'monthlyActivity' => $monthlyActivity,
            'filters'       => $filters,
            'filterOptions' => $filterOptions,
        ]);
    }

    public function faculty(Request $request): Response
    {
        $user = $request->user();
        $filters = $this->dashboardFilters($request, $user);
        $filterOptions = $this->dashboardFilterOptions($user);
        $monthKeyExpression = $this->monthKeyExpression();

        $base = ResearchProposal::query()
            ->where(function ($query) use ($user) {
                $query->whereHas('submitter', fn ($inner) => $inner->where('faculty_id', $user->id))
                    ->orWhereHas('histories', fn ($inner) => $inner
                        ->where('action', 'rejected')
                        ->where('user_id', $user->id));
            });
        $this->applyDashboardFilters($base, $filters);

        $stats = [
            'total' => (clone $base)->count(),
            'pending' => (clone $base)->where('status', ResearchProposal::STATUS_UNDER_REVIEW_FACULTY)->count(),
            'approved' => (clone $base)->where('status', ResearchProposal::STATUS_APPROVED)->count(),
            'rejected' => (clone $base)->where('status', ResearchProposal::STATUS_REJECTED)->count(),
        ];

        $stageCounts = [
            'under_review_faculty' => (clone $base)->where('status', ResearchProposal::STATUS_UNDER_REVIEW_FACULTY)->count(),
            'under_review_hei' => (clone $base)->where('status', ResearchProposal::STATUS_UNDER_REVIEW_HEI)->count(),
            'under_review_ched' => (clone $base)->where('status', ResearchProposal::STATUS_UNDER_REVIEW_CHED)->count(),
            'approved' => (clone $base)->where('status', ResearchProposal::STATUS_APPROVED)->count(),
            'rejected' => (clone $base)->where('status', ResearchProposal::STATUS_REJECTED)->count(),
        ];

        $forReview = ResearchProposal::query()
            ->with(['submitter:id,name', 'institution:id,name'])
            ->tap(fn (Builder $query) => $this->applyDashboardFilters($query, $filters))
            ->where('status', ResearchProposal::STATUS_UNDER_REVIEW_FACULTY)
            ->where(function ($query) use ($user) {
                $query->whereHas('submitter', fn ($inner) => $inner->where('faculty_id', $user->id))
                    ->orWhereHas('histories', fn ($inner) => $inner
                        ->where('action', 'rejected')
                        ->where('user_id', $user->id));
            })
            ->orderByDesc('submitted_at')
            ->orderByDesc('updated_at')
            ->limit(12)
            ->get(['id', 'title', 'status', 'remarks', 'submitted_by', 'institution_id', 'submitted_at', 'created_at', 'updated_at']);

        $recentDecisions = ResearchProposal::query()
            ->with(['submitter:id,name', 'institution:id,name'])
            ->tap(fn (Builder $query) => $this->applyDashboardFilters($query, $filters))
            ->where('reviewed_by', $user->id)
            ->orderByDesc('reviewed_at')
            ->limit(8)
            ->get(['id', 'title', 'status', 'remarks', 'submitted_by', 'institution_id', 'reviewed_at']);

        $monthlyTrends = (clone $base)
            ->selectRaw("{$monthKeyExpression} as month_key, status, COUNT(*) as count")
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->groupByRaw("{$monthKeyExpression}, status")
            ->orderBy('month_key')
            ->get()
            ->groupBy('month_key')
            ->map(function ($group, $monthKey) {
                return [
                    'month' => date('M Y', strtotime($monthKey . '-01')),
                    'submissions' => $group->sum('count'),
                    'approved' => $group->where('status', ResearchProposal::STATUS_APPROVED)->sum('count'),
                    'pending' => $group->whereIn('status', ResearchProposal::PENDING_STATUSES)->sum('count'),
                    'rejected' => $group->where('status', ResearchProposal::STATUS_REJECTED)->sum('count'),
                ];
            })
            ->values();

        $studentBreakdown = (clone $base)
            ->with('submitter:id,name')
            ->get(['id', 'submitted_by'])
            ->groupBy(fn ($proposal) => $proposal->submitter?->name ?? 'Unknown')
            ->map(fn ($group, $studentName) => [
                'student' => $studentName,
                'submissions' => $group->count(),
            ])
            ->sortByDesc('submissions')
            ->take(8)
            ->values();

        return Inertia::render('Dashboard/Faculty', [
            'stats' => $stats,
            'stageCounts' => $stageCounts,
            'forReview' => $forReview,
            'recentDecisions' => $recentDecisions,
            'monthlyTrends' => $monthlyTrends,
            'studentBreakdown' => $studentBreakdown,
            'filters' => $filters,
            'filterOptions' => $filterOptions,
        ]);
    }

    public function hei(Request $request): Response
    {
        $user = $request->user();
        $filters = $this->dashboardFilters($request, $user);
        $filterOptions = $this->dashboardFilterOptions($user);
        $monthKeyExpression = $this->monthKeyExpression();

        $base = ResearchProposal::query()
            ->whereHas('submitter', fn ($query) => $query
                ->where('role', User::ROLE_STUDENT)
                ->whereHas('faculty', fn ($f) => $f->where('hei_id', $user->id))
            );
        $this->applyDashboardFilters($base, $filters);

        $stats = [
            'total' => (clone $base)->count(),
            'pending' => (clone $base)->where('status', ResearchProposal::STATUS_UNDER_REVIEW_HEI)->count(),
            'approved' => (clone $base)->where('status', ResearchProposal::STATUS_APPROVED)->count(),
            'rejected' => (clone $base)->where('status', ResearchProposal::STATUS_REJECTED)->count(),
        ];

        $stageCounts = [
            'under_review_faculty' => (clone $base)->where('status', ResearchProposal::STATUS_UNDER_REVIEW_FACULTY)->count(),
            'under_review_hei' => (clone $base)->where('status', ResearchProposal::STATUS_UNDER_REVIEW_HEI)->count(),
            'under_review_ched' => (clone $base)->where('status', ResearchProposal::STATUS_UNDER_REVIEW_CHED)->count(),
            'approved' => (clone $base)->where('status', ResearchProposal::STATUS_APPROVED)->count(),
            'rejected' => (clone $base)->where('status', ResearchProposal::STATUS_REJECTED)->count(),
        ];

        $forReview = ResearchProposal::query()
            ->with(['submitter:id,name', 'institution:id,name'])
            ->tap(fn (Builder $query) => $this->applyDashboardFilters($query, $filters))
            ->where('status', ResearchProposal::STATUS_UNDER_REVIEW_HEI)
            ->whereHas('submitter', fn ($query) => $query
                ->where('role', User::ROLE_STUDENT)
                ->whereHas('faculty', fn ($f) => $f->where('hei_id', $user->id))
            )
            ->orderByDesc('submitted_at')
            ->orderByDesc('updated_at')
            ->limit(12)
            ->get(['id', 'title', 'status', 'remarks', 'submitted_by', 'institution_id', 'submitted_at', 'created_at', 'updated_at']);

        $recentDecisions = ResearchProposal::query()
            ->with(['submitter:id,name', 'institution:id,name'])
            ->tap(fn (Builder $query) => $this->applyDashboardFilters($query, $filters))
            ->where('reviewed_by', $user->id)
            ->orderByDesc('reviewed_at')
            ->limit(8)
            ->get(['id', 'title', 'status', 'remarks', 'submitted_by', 'institution_id', 'reviewed_at']);

        $monthlyTrends = (clone $base)
            ->selectRaw("{$monthKeyExpression} as month_key, status, COUNT(*) as count")
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->groupByRaw("{$monthKeyExpression}, status")
            ->orderBy('month_key')
            ->get()
            ->groupBy('month_key')
            ->map(function ($group, $monthKey) {
                return [
                    'month' => date('M Y', strtotime($monthKey . '-01')),
                    'submissions' => $group->sum('count'),
                    'approved' => $group->where('status', ResearchProposal::STATUS_APPROVED)->sum('count'),
                    'pending' => $group->whereIn('status', ResearchProposal::PENDING_STATUSES)->sum('count'),
                    'rejected' => $group->where('status', ResearchProposal::STATUS_REJECTED)->sum('count'),
                ];
            })
            ->values();

        $facultyBreakdown = (clone $base)
            ->with('submitter.faculty:id,name')
            ->get(['id', 'submitted_by'])
            ->groupBy(fn ($proposal) => $proposal->submitter?->faculty?->name ?? 'Unassigned')
            ->map(fn ($group, $facultyName) => [
                'faculty' => $facultyName,
                'submissions' => $group->count(),
            ])
            ->sortByDesc('submissions')
            ->take(8)
            ->values();

        return Inertia::render('Dashboard/HEI', [
            'stats' => $stats,
            'stageCounts' => $stageCounts,
            'forReview' => $forReview,
            'recentDecisions' => $recentDecisions,
            'monthlyTrends' => $monthlyTrends,
            'facultyBreakdown' => $facultyBreakdown,
            'filters' => $filters,
            'filterOptions' => $filterOptions,
        ]);
    }

    /**
     * @return array{year:string, hei_id:string, discipline_code:string, status:string}
     */
    private function dashboardFilters(Request $request, User $user): array
    {
        $filters = [
            'year' => trim((string) $request->input('year', '')),
            'hei_id' => trim((string) $request->input('hei_id', '')),
            'discipline_code' => trim((string) $request->input('discipline_code', '')),
            'status' => trim((string) $request->input('status', '')),
        ];

        if ($user->isHEI()) {
            $filters['hei_id'] = (string) ($user->institution_id ?? '');
        }

        if ($user->isFaculty()) {
            $filters['hei_id'] = (string) ($user->institution_id ?? '');
        }

        if ($user->isStudent()) {
            $filters['hei_id'] = '';
        }

        return $filters;
    }

    /**
     * @return array{years: array<int, int>, institutions: array<int, array{id:int,name:string,code:?string}>, disciplines: array<int, array{code:string,name:string}>}
     */
    private function dashboardFilterOptions(User $user): array
    {
        $yearExpression = DB::connection()->getDriverName() === 'sqlite'
            ? "CAST(strftime('%Y', created_at) as INTEGER)"
            : 'YEAR(created_at)';

        $years = ResearchProposal::query()
            ->selectRaw("{$yearExpression} as year")
            ->whereNotNull('created_at')
            ->groupByRaw($yearExpression)
            ->orderByDesc('year')
            ->pluck('year')
            ->filter()
            ->map(fn ($year) => (int) $year)
            ->values()
            ->all();

        $disciplines = Discipline::query()
            ->where('is_active', true)
            ->orderBy('code')
            ->get(['code', 'name'])
            ->map(fn (Discipline $discipline) => [
                'code' => $discipline->code,
                'name' => $discipline->name,
            ])
            ->values()
            ->all();

        $institutions = collect();

        if ($user->isCHED() || $user->isSuperAdmin()) {
            $institutions = Institution::query()
                ->orderBy('name')
                ->get(['id', 'name', 'code']);
        } elseif ($user->isFaculty() && $user->institution_id) {
            $institutions = Institution::query()
                ->where('id', $user->institution_id)
                ->orderBy('name')
                ->get(['id', 'name', 'code']);
        }

        return [
            'years' => $years,
            'institutions' => $institutions
                ->map(fn (Institution $institution) => [
                    'id' => $institution->id,
                    'name' => $institution->name,
                    'code' => $institution->code,
                ])
                ->values()
                ->all(),
            'disciplines' => $disciplines,
        ];
    }

    /**
     * @param array{year:string, hei_id:string, discipline_code:string, status:string} $filters
     */
    private function applyDashboardFilters($query, array $filters): void
    {
        $query->when($filters['year'] !== '', fn (Builder $inner) => $inner->whereYear('created_at', (int) $filters['year']));

        $query->when($filters['hei_id'] !== '', fn (Builder $inner) => $inner->where('institution_id', (int) $filters['hei_id']));

        $query->when($filters['discipline_code'] !== '', fn (Builder $inner) => $inner->where('discipline_code', $filters['discipline_code']));

        $query->when($filters['status'] !== '', function (Builder $inner) use ($filters) {
            if ($filters['status'] === 'pending') {
                $inner->whereIn('status', ResearchProposal::PENDING_STATUSES);
                return;
            }

            $inner->where('status', $filters['status']);
        });
    }

    public function ched(Request $request): Response
    {
        $user = $request->user();
        $filters = $this->dashboardFilters($request, $user);
        $filterOptions = $this->dashboardFilterOptions($user);
        $monthKeyExpression = $this->monthKeyExpression();
        $disciplineNames = $this->disciplineNameByCodeMap();

        $base = ResearchProposal::query();
        $this->applyDashboardFilters($base, $filters);

        $approvedCount = (clone $base)->where('status', ResearchProposal::STATUS_APPROVED)->count();
        $resolvedCount = (clone $base)->whereIn('status', [ResearchProposal::STATUS_APPROVED, ResearchProposal::STATUS_REJECTED])->count();

        $stats = [
            'pending'       => (clone $base)->whereIn('status', ResearchProposal::PENDING_STATUSES)->count(),
            'approved'      => $approvedCount,
            'rejected'      => (clone $base)->where('status', ResearchProposal::STATUS_REJECTED)->count(),
            'total'         => (clone $base)->count(),
            'reviewedToday' => (clone $base)->whereDate('reviewed_at', now()->toDateString())->count(),
            'approvalRate'  => $resolvedCount > 0 ? round(($approvedCount / $resolvedCount) * 100, 1) : 0,
        ];

        $stageCounts = [
            'under_review_faculty' => (clone $base)->where('status', ResearchProposal::STATUS_UNDER_REVIEW_FACULTY)->count(),
            'under_review_hei' => (clone $base)->where('status', ResearchProposal::STATUS_UNDER_REVIEW_HEI)->count(),
            'under_review_ched' => (clone $base)->where('status', ResearchProposal::STATUS_UNDER_REVIEW_CHED)->count(),
            'approved' => (clone $base)->where('status', ResearchProposal::STATUS_APPROVED)->count(),
            'rejected' => (clone $base)->where('status', ResearchProposal::STATUS_REJECTED)->count(),
        ];

        $forReview = ResearchProposal::query()
            ->with('submitter:id,name', 'institution:id,name')
            ->tap(fn (Builder $query) => $this->applyDashboardFilters($query, $filters))
            ->where('status', ResearchProposal::STATUS_UNDER_REVIEW_CHED)
            ->orderByDesc('submitted_at')
            ->orderByDesc('updated_at')
            ->limit(10)
            ->get(['id', 'title', 'authors', 'year', 'school', 'status', 'remarks', 'submitted_by', 'institution_id', 'submitted_at', 'created_at', 'updated_at']);

        $editRequests = EditPermissionRequest::with([
                'requester:id,name',
                'proposal:id,title',
            ])
            ->where('status', 'pending')
            ->latest()
            ->get();

        // Chart data: Monthly trends (last 12 months)
        $monthlyTrends = (clone $base)
            ->selectRaw("{$monthKeyExpression} as month_key, status, COUNT(*) as count")
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupByRaw("{$monthKeyExpression}, status")
            ->orderBy('month_key')
            ->get()
            ->groupBy('month_key')
            ->map(fn ($group, $monthKey) => [
                'month' => date('M Y', strtotime($monthKey . '-01')),
                'submitted' => $group->where('status', 'submitted')->sum('count'),
                'approved' => $group->where('status', 'approved')->sum('count'),
                'rejected' => $group->where('status', 'rejected')->sum('count'),
                'pending' => $group->whereIn('status', ResearchProposal::PENDING_STATUSES)->sum('count'),
            ])
            ->values();

        // Chart data: Discipline breakdown
        $disciplineBreakdown = (clone $base)
            ->selectRaw('discipline_code, COUNT(*) as count')
            ->groupBy('discipline_code')
            ->orderByDesc('count')
            ->limit(8)
            ->get()
            ->map(fn ($item) => [
                'discipline' => $disciplineNames[$item->discipline_code] ?? ($item->discipline_code ?: 'Unspecified'),
                'discipline_code' => $item->discipline_code,
                'submissions' => $item->count,
            ])
            ->values();

        // Chart data: Approval funnel (stages)
        $approvalFunnel = [
            ['stage' => 'Faculty Review', 'count' => $stageCounts['under_review_faculty']],
            ['stage' => 'HEI Review', 'count' => $stageCounts['under_review_hei']],
            ['stage' => 'CHED Review', 'count' => $stageCounts['under_review_ched']],
            ['stage' => 'Approved', 'count' => $stageCounts['approved']],
        ];

        return Inertia::render('Dashboard/CHED', [
            'stats'               => $stats,
            'stageCounts'         => $stageCounts,
            'forReview'           => $forReview,
            'editRequests'        => $editRequests,
            'monthlyTrends'       => $monthlyTrends,
            'disciplineBreakdown' => $disciplineBreakdown,
            'approvalFunnel'      => $approvalFunnel,
            'filters'             => $filters,
            'filterOptions'       => $filterOptions,
        ]);
    }

    public function chedDecisions(Request $request): Response
    {
        $decisions = ResearchProposal::with('reviewer:id,name', 'institution:id,name')
            ->whereIn('status', ['approved', 'rejected'])
            ->orderByDesc('reviewed_at')
            ->limit(50)
            ->get(['id', 'title', 'status', 'institution_id', 'reviewed_by', 'reviewed_at']);

        return Inertia::render('Dashboard/CHEDDecisions', [
            'decisions' => $decisions,
        ]);
    }

    public function admin(Request $request): Response
    {
        $user = $request->user();
        $filters = $this->dashboardFilters($request, $user);
        $filterOptions = $this->dashboardFilterOptions($user);
        $monthKeyExpression = $this->monthKeyExpression();
        $disciplineNames = $this->disciplineNameByCodeMap();

        $base = ResearchProposal::query();
        $this->applyDashboardFilters($base, $filters);
        $proposalTotal = (clone $base)->count();
        $approvedTotal = (clone $base)->where('status', ResearchProposal::STATUS_APPROVED)->count();

        // User counts scoped by institution filter when active (year/discipline only apply to proposals)
        $userBase = User::query();
        if ($filters['hei_id'] !== '') {
            $userBase->where('institution_id', (int) $filters['hei_id']);
        }

        $stats = [
            'users'        => (clone $userBase)->count(),
            'institutions' => Institution::count(),
            'proposals'    => $proposalTotal,
            'approved'     => $approvedTotal,
            'pending'      => (clone $base)->whereIn('status', ResearchProposal::PENDING_STATUSES)->count(),
            'rejected'     => (clone $base)->where('status', ResearchProposal::STATUS_REJECTED)->count(),
            'heiUsers'     => (clone $userBase)->where('role', 'hei')->count(),
            'facultyUsers' => (clone $userBase)->where('role', 'faculty')->count(),
            'studentUsers' => (clone $userBase)->where('role', 'student')->count(),
            'chedUsers'    => (clone $userBase)->where('role', 'ched')->count(),
            'admins'       => (clone $userBase)->where('role', 'super_admin')->count(),
            'approvalRate' => $proposalTotal > 0 ? round(($approvedTotal / $proposalTotal) * 100, 1) : 0,
        ];

        $recentUsers = User::with('institution:id,name')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get(['id', 'name', 'email', 'role', 'institution_id', 'created_at']);

        $recentProposals = ResearchProposal::with(['institution:id,name', 'submitter:id,name'])
            ->tap(fn (Builder $query) => $this->applyDashboardFilters($query, $filters))
            ->orderByDesc('created_at')
            ->limit(10)
            ->get(['id', 'title', 'status', 'institution_id', 'submitted_by', 'created_at']);

        $institutionOverview = Institution::query()
            ->withCount([
                'proposals as proposals_count' => fn ($query) => $this->applyDashboardFilters($query, $filters),
                'proposals as approved_count' => fn ($query) => $query
                    ->where('status', ResearchProposal::STATUS_APPROVED)
                    ->tap(fn (Builder $inner) => $this->applyDashboardFilters($inner, $filters)),
                'proposals as pending_count' => fn ($query) => $query
                    ->whereIn('status', ResearchProposal::PENDING_STATUSES)
                    ->tap(fn (Builder $inner) => $this->applyDashboardFilters($inner, $filters)),
                'users as hei_users_count' => fn ($query) => $query->where('role', 'hei'),
                'users as faculty_users_count' => fn ($query) => $query->where('role', 'faculty'),
                'users as student_users_count' => fn ($query) => $query->where('role', 'student'),
            ])
            ->withMax(['proposals as proposals_max_created_at' => fn ($query) => $this->applyDashboardFilters($query, $filters)], 'created_at')
            ->orderByDesc('proposals_count')
            ->limit(10)
            ->get(['id', 'name', 'code']);

        $monthlyTrends = (clone $base)
            ->selectRaw("{$monthKeyExpression} as month_key, status, COUNT(*) as count")
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->groupByRaw("{$monthKeyExpression}, status")
            ->orderBy('month_key')
            ->get()
            ->groupBy('month_key')
            ->map(function ($group, $monthKey) {
                return [
                    'month' => date('M Y', strtotime($monthKey . '-01')),
                    'submissions' => $group->sum('count'),
                    'approved' => $group->where('status', ResearchProposal::STATUS_APPROVED)->sum('count'),
                    'pending' => $group->whereIn('status', ResearchProposal::PENDING_STATUSES)->sum('count'),
                    'rejected' => $group->where('status', ResearchProposal::STATUS_REJECTED)->sum('count'),
                ];
            })
            ->values();

        $roleDistribution = User::query()
            ->selectRaw('role, COUNT(*) as count')
            ->groupBy('role')
            ->orderByDesc('count')
            ->get()
            ->map(function ($item) {
                return [
                    'role' => strtoupper(str_replace('_', ' ', $item->role)),
                    'count' => $item->count,
                ];
            })
            ->values();

        $disciplineBreakdown = (clone $base)
            ->selectRaw('discipline_code, COUNT(*) as count')
            ->groupBy('discipline_code')
            ->orderByDesc('count')
            ->limit(8)
            ->get()
            ->map(function ($item) use ($disciplineNames) {
                return [
                    'discipline' => $disciplineNames[$item->discipline_code] ?? ($item->discipline_code ?: 'UNSPECIFIED'),
                    'discipline_code' => $item->discipline_code,
                    'submissions' => $item->count,
                ];
            })
            ->values();

        $institutionPerformance = $institutionOverview
            ->take(8)
            ->map(function ($institution) {
                return [
                    'institution_id' => $institution->id,
                    'institution' => $institution->code ?: $institution->name,
                    'submissions' => $institution->proposals_count,
                    'approved' => $institution->approved_count,
                ];
            })
            ->values();

        return Inertia::render('Dashboard/SuperAdmin', [
            'stats'               => $stats,
            'recentUsers'         => $recentUsers,
            'recentProposals'     => $recentProposals,
            'institutionOverview' => $institutionOverview,
            'monthlyTrends'       => $monthlyTrends,
            'roleDistribution'    => $roleDistribution,
            'disciplineBreakdown' => $disciplineBreakdown,
            'institutionPerformance' => $institutionPerformance,
            'institutions'        => Institution::orderBy('name')->get(['id', 'name', 'code']),
            'roles'               => [
                ['value' => 'hei', 'label' => 'HEI'],
                ['value' => 'faculty', 'label' => 'Faculty'],
                ['value' => 'student', 'label' => 'Student'],
                ['value' => 'ched', 'label' => 'CHED'],
                ['value' => 'super_admin', 'label' => 'Super Admin'],
            ],
            'filters'            => $filters,
            'filterOptions'      => $filterOptions,
        ]);
    }

    private function dashboardNotifications(int $userId)
    {
        return SimpleNotification::query()
            ->where('user_id', $userId)
            ->where('is_read', false)
            ->latest()
            ->limit(8)
            ->get(['id', 'message', 'is_read', 'created_at']);
    }

    private function monthKeyExpression(): string
    {
        return DB::connection()->getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', created_at)"
            : "DATE_FORMAT(created_at, '%Y-%m')";
    }

    private function disciplineNameByCodeMap(): array
    {
        return Discipline::query()
            ->pluck('name', 'code')
            ->toArray();
    }

    public function markAllNotificationsRead(Request $request): RedirectResponse
    {
        SimpleNotification::query()
            ->where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return back()->with('success', 'All notifications marked as read.');
    }

    public function markNotificationRead(Request $request, int $id): RedirectResponse
    {
        SimpleNotification::query()
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->update(['is_read' => true]);

        $url = $this->sanitizeInternalRedirect($request->input('redirect'), $request);

        return $url
            ? redirect($url)
            : back();
    }

    private function sanitizeInternalRedirect(mixed $url, Request $request): ?string
    {
        if (! is_string($url)) {
            return null;
        }

        $url = trim($url);
        if ($url === '') {
            return null;
        }

        $parts = parse_url($url);
        if ($parts === false) {
            return null;
        }

        // Accept absolute URLs only when they point to this app host.
        if (isset($parts['scheme']) || isset($parts['host'])) {
            $requestHost = parse_url($request->root(), PHP_URL_HOST);
            $urlHost = $parts['host'] ?? null;

            if (! $urlHost || ! $requestHost || ! hash_equals((string) $requestHost, (string) $urlHost)) {
                return null;
            }

            $normalized = $parts['path'] ?? '/';

            if (isset($parts['query'])) {
                $normalized .= '?' . $parts['query'];
            }

            if (isset($parts['fragment'])) {
                $normalized .= '#' . $parts['fragment'];
            }

            return $normalized;
        }

        return str_starts_with($url, '/') ? $url : null;
    }
}
