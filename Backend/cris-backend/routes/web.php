<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResearchProposalController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\InstitutionManagementController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {

    // Generic dashboard — redirects to role-specific one
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── HEI ──────────────────────────────────────────────────────────────────
    Route::middleware('role:hei,super_admin')->group(function () {
        Route::get('/hei/dashboard', [DashboardController::class, 'hei'])->name('hei.dashboard');

        Route::resource('research', ResearchProposalController::class)->except(['index', 'show']);
        Route::post('research/{proposal}/submit', [ResearchProposalController::class, 'submit'])
            ->name('research.submit');
    });

    // ── CHED ─────────────────────────────────────────────────────────────────
    Route::middleware('role:ched,super_admin')->group(function () {
        Route::get('/ched/dashboard', [DashboardController::class, 'ched'])->name('ched.dashboard');

        Route::post('research/{proposal}/review', [ResearchProposalController::class, 'review'])
            ->name('research.review');
    });

    // Shared: any authenticated user can list/view research
    Route::get('/research', [ResearchProposalController::class, 'index'])->name('research.index');
    Route::get('/research/{proposal}', [ResearchProposalController::class, 'show'])->name('research.show');

    // ── SUPER ADMIN ───────────────────────────────────────────────────────────
    Route::middleware('role:super_admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'admin'])->name('dashboard');

        Route::resource('users', UserManagementController::class)
            ->except(['show']);

        Route::resource('institutions', InstitutionManagementController::class)
            ->except(['show']);
    });
});

require __DIR__.'/auth.php';

