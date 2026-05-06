<?php

namespace App\Http\Controllers;

use App\Models\ResearchProposal;
use App\Models\User;
use App\Models\EditPermissionRequest;
use App\Models\Discipline;
use App\Models\Institution;
use App\Models\SimpleNotification;
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
        $base = ResearchProposal::where('submitted_by', $user->id);
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
            ->orderByDesc('updated_at')
            ->limit(10)
            ->get(['id', 'title', 'status', 'remarks', 'year', 'school', 'updated_at']);

        $pendingQueue = ResearchProposal::where('submitted_by', $user->id)
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
        ]);
    }

    public function faculty(Request $request): Response
    {
        $user = $request->user();
        $monthKeyExpression = $this->monthKeyExpression();

        $base = ResearchProposal::query()
            ->where(function ($query) use ($user) {
                $query->whereHas('submitter', fn ($inner) => $inner->where('faculty_id', $user->id))
                    ->orWhereHas('histories', fn ($inner) => $inner
                        ->where('action', 'rejected')
                        ->where('user_id', $user->id));
            });

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
        ]);
    }

    public function hei(Request $request): Response
    {
        $user = $request->user();
        $monthKeyExpression = $this->monthKeyExpression();

        $base = ResearchProposal::query()
            ->whereHas('submitter', fn ($query) => $query
                ->where('role', User::ROLE_STUDENT)
                ->whereHas('faculty', fn ($f) => $f->where('hei_id', $user->id))
            );

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
        ]);
    }

    public function ched(Request $request): Response
    {
        $monthKeyExpression = $this->monthKeyExpression();
        $disciplineNames = $this->disciplineNameByCodeMap();
        $approvedCount = ResearchProposal::where('status', 'approved')->count();
        $resolvedCount = ResearchProposal::whereIn('status', ['approved', 'rejected'])->count();

        $stats = [
            'pending'       => ResearchProposal::whereIn('status', ResearchProposal::PENDING_STATUSES)->count(),
            'approved'      => $approvedCount,
            'rejected'      => ResearchProposal::where('status', 'rejected')->count(),
            'total'         => ResearchProposal::count(),
            'reviewedToday' => ResearchProposal::whereDate('reviewed_at', now()->toDateString())->count(),
            'approvalRate'  => $resolvedCount > 0 ? round(($approvedCount / $resolvedCount) * 100, 1) : 0,
        ];

        $stageCounts = [
            'under_review_faculty' => ResearchProposal::where('status', ResearchProposal::STATUS_UNDER_REVIEW_FACULTY)->count(),
            'under_review_hei' => ResearchProposal::where('status', ResearchProposal::STATUS_UNDER_REVIEW_HEI)->count(),
            'under_review_ched' => ResearchProposal::where('status', ResearchProposal::STATUS_UNDER_REVIEW_CHED)->count(),
            'approved' => ResearchProposal::where('status', ResearchProposal::STATUS_APPROVED)->count(),
            'rejected' => ResearchProposal::where('status', ResearchProposal::STATUS_REJECTED)->count(),
        ];

        $forReview = ResearchProposal::with('submitter:id,name', 'institution:id,name')
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
        $monthlyTrends = ResearchProposal::query()
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
        $disciplineBreakdown = ResearchProposal::query()
            ->selectRaw('discipline_code, COUNT(*) as count')
            ->groupBy('discipline_code')
            ->orderByDesc('count')
            ->limit(8)
            ->get()
            ->map(fn ($item) => [
                'discipline' => $disciplineNames[$item->discipline_code] ?? ($item->discipline_code ?: 'Unspecified'),
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

    public function admin(): Response
    {
        $monthKeyExpression = $this->monthKeyExpression();
        $disciplineNames = $this->disciplineNameByCodeMap();
        $proposalTotal = ResearchProposal::count();
        $approvedTotal = ResearchProposal::where('status', 'approved')->count();

        $stats = [
            'users'        => User::count(),
            'institutions' => Institution::count(),
            'proposals'    => $proposalTotal,
            'approved'     => $approvedTotal,
            'pending'      => ResearchProposal::whereIn('status', ResearchProposal::PENDING_STATUSES)->count(),
            'rejected'     => ResearchProposal::where('status', 'rejected')->count(),
            'heiUsers'     => User::where('role', 'hei')->count(),
            'facultyUsers' => User::where('role', 'faculty')->count(),
            'studentUsers' => User::where('role', 'student')->count(),
            'chedUsers'    => User::where('role', 'ched')->count(),
            'admins'       => User::where('role', 'super_admin')->count(),
            'approvalRate' => $proposalTotal > 0 ? round(($approvedTotal / $proposalTotal) * 100, 1) : 0,
        ];

        $recentUsers = User::with('institution:id,name')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get(['id', 'name', 'email', 'role', 'institution_id', 'created_at']);

        $recentProposals = ResearchProposal::with(['institution:id,name', 'submitter:id,name'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get(['id', 'title', 'status', 'institution_id', 'submitted_by', 'created_at']);

        $institutionOverview = Institution::query()
            ->withCount([
                'proposals as proposals_count',
                'proposals as approved_count' => fn ($query) => $query->where('status', 'approved'),
                'proposals as pending_count' => fn ($query) => $query->whereIn('status', ResearchProposal::PENDING_STATUSES),
                'users as hei_users_count' => fn ($query) => $query->where('role', 'hei'),
                'users as faculty_users_count' => fn ($query) => $query->where('role', 'faculty'),
                'users as student_users_count' => fn ($query) => $query->where('role', 'student'),
            ])
            ->withMax('proposals', 'created_at')
            ->orderByDesc('proposals_count')
            ->limit(10)
            ->get(['id', 'name', 'code']);

        $monthlyTrends = ResearchProposal::query()
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

        $disciplineBreakdown = ResearchProposal::query()
            ->selectRaw('discipline_code, COUNT(*) as count')
            ->groupBy('discipline_code')
            ->orderByDesc('count')
            ->limit(8)
            ->get()
            ->map(function ($item) use ($disciplineNames) {
                return [
                    'discipline' => $disciplineNames[$item->discipline_code] ?? ($item->discipline_code ?: 'UNSPECIFIED'),
                    'submissions' => $item->count,
                ];
            })
            ->values();

        $institutionPerformance = $institutionOverview
            ->take(8)
            ->map(function ($institution) {
                return [
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

        $url = $request->input('redirect');

        return $url
            ? redirect($url)
            : back();
    }
}
