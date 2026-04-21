<?php

namespace App\Http\Controllers;

use App\Models\ResearchProposal;
use App\Models\User;
use App\Models\Institution;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /** Redirect to role-specific dashboard */
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        return match ($user->role) {
            'super_admin' => redirect()->route('admin.dashboard'),
            'ched'        => redirect()->route('ched.dashboard'),
            default       => redirect()->route('hei.dashboard'),
        };
    }

    public function hei(Request $request): Response
    {
        $user = $request->user();
        $base = ResearchProposal::where('submitted_by', $user->id);
        $startOfMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();

        $approvedCount = (clone $base)->where('status', 'approved')->count();
        $totalCount = (clone $base)->count();

        $stats = [
            'total'        => $totalCount,
            'pending'      => (clone $base)->where('status', 'pending')->count(),
            'approved'     => $approvedCount,
            'rejected'     => (clone $base)->where('status', 'rejected')->count(),
            'uploadedThisMonth' => (clone $base)->whereBetween('created_at', [$startOfMonth, $endOfMonth])->count(),
            'approvalRate' => $totalCount > 0 ? round(($approvedCount / $totalCount) * 100, 1) : 0,
        ];

        $recentUploads = ResearchProposal::where('submitted_by', $user->id)
            ->orderByDesc('updated_at')
            ->limit(10)
            ->get(['id', 'title', 'status', 'year', 'school', 'updated_at']);

        $pendingQueue = ResearchProposal::where('submitted_by', $user->id)
            ->where('status', 'pending')
            ->orderBy('created_at')
            ->limit(5)
            ->get(['id', 'title', 'created_at']);

        return Inertia::render('Dashboard/HEI', [
            'stats'         => $stats,
            'recentUploads' => $recentUploads,
            'pendingQueue'  => $pendingQueue,
        ]);
    }

    public function ched(Request $request): Response
    {
        $approvedCount = ResearchProposal::where('status', 'approved')->count();
        $resolvedCount = ResearchProposal::whereIn('status', ['approved', 'rejected'])->count();

        $stats = [
            'pending'       => ResearchProposal::where('status', 'pending')->count(),
            'approved'      => $approvedCount,
            'rejected'      => ResearchProposal::where('status', 'rejected')->count(),
            'total'         => ResearchProposal::count(),
            'reviewedToday' => ResearchProposal::whereDate('reviewed_at', now()->toDateString())->count(),
            'approvalRate'  => $resolvedCount > 0 ? round(($approvedCount / $resolvedCount) * 100, 1) : 0,
        ];

        $forReview = ResearchProposal::with('submitter:id,name', 'institution:id,name')
            ->where('status', 'pending')
            ->orderBy('created_at')
            ->limit(10)
            ->get(['id', 'title', 'authors', 'year', 'school', 'status', 'submitted_by', 'institution_id', 'created_at']);

        $recentDecisions = ResearchProposal::with('reviewer:id,name', 'institution:id,name')
            ->whereIn('status', ['approved', 'rejected'])
            ->orderByDesc('reviewed_at')
            ->limit(10)
            ->get(['id', 'title', 'status', 'institution_id', 'reviewed_by', 'reviewed_at']);

        return Inertia::render('Dashboard/CHED', [
            'stats'           => $stats,
            'forReview'       => $forReview,
            'recentDecisions' => $recentDecisions,
        ]);
    }

    public function admin(): Response
    {
        $proposalTotal = ResearchProposal::count();
        $approvedTotal = ResearchProposal::where('status', 'approved')->count();

        $stats = [
            'users'        => User::count(),
            'institutions' => Institution::count(),
            'proposals'    => $proposalTotal,
            'approved'     => $approvedTotal,
            'pending'      => ResearchProposal::where('status', 'pending')->count(),
            'rejected'     => ResearchProposal::where('status', 'rejected')->count(),
            'heiUsers'     => User::where('role', 'hei')->count(),
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
                'proposals as pending_count' => fn ($query) => $query->where('status', 'pending'),
                'users as hei_users_count' => fn ($query) => $query->where('role', 'hei'),
            ])
            ->withMax('proposals', 'created_at')
            ->orderByDesc('proposals_count')
            ->limit(10)
            ->get(['id', 'name', 'code']);

        return Inertia::render('Dashboard/SuperAdmin', [
            'stats'               => $stats,
            'recentUsers'         => $recentUsers,
            'recentProposals'     => $recentProposals,
            'institutionOverview' => $institutionOverview,
            'institutions'        => Institution::orderBy('name')->get(['id', 'name', 'code']),
            'roles'               => [
                ['value' => 'hei', 'label' => 'HEI'],
                ['value' => 'ched', 'label' => 'CHED'],
                ['value' => 'super_admin', 'label' => 'Super Admin'],
            ],
        ]);
    }
}
