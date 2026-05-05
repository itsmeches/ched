<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HierarchicalAccountController;
use App\Http\Controllers\EditPermissionController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResearchProposalController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\InstitutionManagementController;
use App\Http\Controllers\Admin\KeywordManagementController;
use App\Http\Controllers\Admin\ResearchTaxonomyManagementController;
use Illuminate\Support\Facades\Route;

Route::get('/robots.txt', function () {
    return response("User-agent: *\nDisallow:", 200, [
        'Content-Type' => 'text/plain; charset=UTF-8',
    ]);
});

Route::middleware('throttle:60,1')->group(function () {
    Route::get('/', [ResearchProposalController::class, 'publicIndex'])
        ->name('research.public.index');

    Route::get('/public/research', [ResearchProposalController::class, 'publicIndex'])
        ->name('research.public.archive');
    Route::get('/public/research/{proposal}', [ResearchProposalController::class, 'publicShow'])
        ->name('research.public.show');
    Route::get('/public/research/{proposal}/file', [ResearchProposalController::class, 'publicDownloadFile'])
        ->name('research.public.file');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {

    // Generic dashboard — redirects to role-specific one
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── STUDENT ──────────────────────────────────────────────────────────────
    Route::middleware('role:student,super_admin')->group(function () {
        Route::get('/student/dashboard', [DashboardController::class, 'student'])->name('student.dashboard');
    });

    // ── FACULTY ──────────────────────────────────────────────────────────────
    Route::middleware('role:faculty,super_admin')->group(function () {
        Route::get('/faculty/dashboard', [DashboardController::class, 'faculty'])->name('faculty.dashboard');
    });

    // ── HEI ──────────────────────────────────────────────────────────────────
    Route::middleware('role:hei,super_admin')->group(function () {
        Route::get('/hei/dashboard', [DashboardController::class, 'hei'])->name('hei.dashboard');
    });

    Route::middleware('role:hei,faculty,student,ched,super_admin')->group(function () {
        Route::resource('research', ResearchProposalController::class)
            ->parameters(['research' => 'proposal'])
            ->except(['index', 'show', 'destroy']);
    });

    // ── CHED ─────────────────────────────────────────────────────────────────
    Route::middleware('role:ched,super_admin')->group(function () {
        Route::get('/ched/dashboard', [DashboardController::class, 'ched'])->name('ched.dashboard');
        Route::get('/ched/decisions', [DashboardController::class, 'chedDecisions'])->name('ched.decisions');
    });

    Route::middleware('role:faculty,hei,ched,super_admin')->group(function () {
        Route::post('research/{proposal}/review', [ResearchProposalController::class, 'review'])
            ->name('research.review');
    });

    Route::middleware('role:student')->group(function () {
        Route::post('research/{proposal}/resubmit', [ResearchProposalController::class, 'resubmit'])
            ->name('research.resubmit');
    });

    // Shared: any authenticated user can list/view research
    Route::get('/research', [ResearchProposalController::class, 'index'])->name('research.index');
    Route::get('/research/{proposal}', [ResearchProposalController::class, 'show'])->name('research.show');
    Route::delete('/research/{proposal}', [ResearchProposalController::class, 'destroy'])->name('research.destroy');
    Route::get('/research/{proposal}/file', [ResearchProposalController::class, 'downloadFile'])->name('research.file');

    // Edit permission requests (HEI → CHED)
    Route::post('/research/{proposal}/edit-permission', [EditPermissionController::class, 'store'])
        ->name('research.edit-permission.store');
    Route::post('/research/{proposal}/edit-permission/{editRequest}/decide', [EditPermissionController::class, 'decide'])
        ->name('research.edit-permission.decide');

    // History (scoped per role inside controller)
    Route::get('/history', [HistoryController::class, 'index'])->name('history.index');
    Route::get('/history/export', [HistoryController::class, 'exportCsv'])->name('history.export');

    Route::post('/notifications/read-all', [DashboardController::class, 'markAllNotificationsRead'])
        ->name('notifications.read-all');

    Route::post('/notifications/{id}/read', [DashboardController::class, 'markNotificationRead'])
        ->name('notifications.read-one')
        ->whereNumber('id');

    // Hierarchical account creation (CHED -> HEI -> Faculty -> Student)
    Route::middleware('role:ched,hei,faculty')->group(function () {
        Route::get('/accounts/create', [HierarchicalAccountController::class, 'create'])
            ->name('accounts.create');
        Route::get('/accounts/hierarchy', [HierarchicalAccountController::class, 'hierarchy'])
            ->name('accounts.hierarchy');
        Route::post('/accounts', [HierarchicalAccountController::class, 'store'])
            ->name('accounts.store');

        // Manage subordinate accounts (creator-owned)
        Route::get('/accounts/{user}/edit', [HierarchicalAccountController::class, 'edit'])
            ->name('accounts.edit');
        Route::put('/accounts/{user}', [HierarchicalAccountController::class, 'update'])
            ->name('accounts.update');
        Route::post('/accounts/{user}/reset-password', [HierarchicalAccountController::class, 'resetPassword'])
            ->name('accounts.reset-password');
        Route::delete('/accounts/{user}', [HierarchicalAccountController::class, 'deactivate'])
            ->name('accounts.deactivate');
        Route::post('/accounts/{user}/reactivate', [HierarchicalAccountController::class, 'reactivate'])
            ->name('accounts.reactivate');
    });

    // ── SUPER ADMIN ───────────────────────────────────────────────────────────
    Route::middleware('role:super_admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'admin'])->name('dashboard');

        Route::resource('users', UserManagementController::class)
            ->except(['show']);

        Route::get('users/audits', [UserManagementController::class, 'audits'])
            ->name('users.audits');

        Route::post('users/{user}/restore', [UserManagementController::class, 'restore'])
            ->name('users.restore');

        Route::resource('institutions', InstitutionManagementController::class)
            ->except(['show']);

        Route::resource('keywords', KeywordManagementController::class)
            ->except(['show', 'create', 'edit']);

        Route::get('taxonomy', [ResearchTaxonomyManagementController::class, 'index'])
            ->name('taxonomy.index');
        Route::get('taxonomy/categories', [ResearchTaxonomyManagementController::class, 'categoriesPage'])
            ->name('taxonomy.categories.index');
        Route::get('taxonomy/disciplines', [ResearchTaxonomyManagementController::class, 'disciplinesPage'])
            ->name('taxonomy.disciplines.index');
        Route::post('taxonomy/categories', [ResearchTaxonomyManagementController::class, 'storeCategory'])
            ->name('taxonomy.categories.store');
        Route::put('taxonomy/categories/{category}', [ResearchTaxonomyManagementController::class, 'updateCategory'])
            ->name('taxonomy.categories.update');
        Route::delete('taxonomy/categories/{category}', [ResearchTaxonomyManagementController::class, 'destroyCategory'])
            ->name('taxonomy.categories.destroy');

        Route::post('taxonomy/disciplines', [ResearchTaxonomyManagementController::class, 'storeDiscipline'])
            ->name('taxonomy.disciplines.store');
        Route::put('taxonomy/disciplines/{discipline}', [ResearchTaxonomyManagementController::class, 'updateDiscipline'])
            ->name('taxonomy.disciplines.update');
        Route::delete('taxonomy/disciplines/{discipline}', [ResearchTaxonomyManagementController::class, 'destroyDiscipline'])
            ->name('taxonomy.disciplines.destroy');
    });
});

require __DIR__.'/auth.php';

