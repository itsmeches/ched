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

        $stats = [
            'total'       => ResearchProposal::where('submitted_by', $user->id)->count(),
            'draft'       => ResearchProposal::where('submitted_by', $user->id)->where('status', 'draft')->count(),
            'submitted'   => ResearchProposal::where('submitted_by', $user->id)->whereIn('status', ['submitted', 'under_review'])->count(),
            'approved'    => ResearchProposal::where('submitted_by', $user->id)->where('status', 'approved')->count(),
            'rejected'    => ResearchProposal::where('submitted_by', $user->id)->where('status', 'rejected')->count(),
        ];

        $recent = ResearchProposal::where('submitted_by', $user->id)
            ->orderByDesc('updated_at')
            ->limit(5)
            ->get(['id', 'title', 'status', 'updated_at']);

        return Inertia::render('Dashboard/HEI', [
            'stats'  => $stats,
            'recent' => $recent,
        ]);
    }

    public function ched(Request $request): Response
    {
        $stats = [
            'pending'  => ResearchProposal::whereIn('status', ['submitted', 'under_review'])->count(),
            'approved' => ResearchProposal::where('status', 'approved')->count(),
            'rejected' => ResearchProposal::where('status', 'rejected')->count(),
            'total'    => ResearchProposal::count(),
        ];

        $forReview = ResearchProposal::with('submitter:id,name', 'institution:id,name')
            ->whereIn('status', ['submitted', 'under_review'])
            ->orderBy('created_at')
            ->limit(5)
            ->get(['id', 'title', 'status', 'submitted_by', 'institution_id', 'created_at']);

        return Inertia::render('Dashboard/CHED', [
            'stats'     => $stats,
            'forReview' => $forReview,
        ]);
    }

    public function admin(): Response
    {
        $stats = [
            'users'        => User::count(),
            'institutions' => Institution::count(),
            'proposals'    => ResearchProposal::count(),
            'approved'     => ResearchProposal::where('status', 'approved')->count(),
            'pending'      => ResearchProposal::whereIn('status', ['submitted', 'under_review'])->count(),
            'heiUsers'     => User::where('role', 'hei')->count(),
            'chedUsers'    => User::where('role', 'ched')->count(),
            'admins'       => User::where('role', 'super_admin')->count(),
        ];

        $recentUsers = User::with('institution:id,name')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get(['id', 'name', 'email', 'role', 'institution_id', 'created_at']);

        return Inertia::render('Dashboard/SuperAdmin', [
            'stats'       => $stats,
            'recentUsers' => $recentUsers,
            'institutions' => Institution::orderBy('name')->get(['id', 'name', 'code']),
            'roles'        => [
                ['value' => 'hei', 'label' => 'HEI'],
                ['value' => 'ched', 'label' => 'CHED'],
                ['value' => 'super_admin', 'label' => 'Super Admin'],
            ],
        ]);
    }
}
