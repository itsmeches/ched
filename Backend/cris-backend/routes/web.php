<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResearchProposalController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\InstitutionManagementController;
use Illuminate\Support\Facades\Route;

Route::get('/', [ResearchProposalController::class, 'publicIndex'])
    ->name('research.public.index');

Route::get('/public/research', [ResearchProposalController::class, 'publicIndex'])
    ->name('research.public.archive');
Route::get('/public/research/{proposal}', [ResearchProposalController::class, 'publicShow'])
    ->name('research.public.show');
Route::get('/public/research/{proposal}/file', [ResearchProposalController::class, 'publicDownloadFile'])
    ->name('research.public.file');

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
    });

    // ── CHED ─────────────────────────────────────────────────────────────────
    Route::middleware('role:ched')->group(function () {
        Route::get('/ched/dashboard', [DashboardController::class, 'ched'])->name('ched.dashboard');

        Route::post('research/{proposal}/review', [ResearchProposalController::class, 'review'])
            ->name('research.review');
    });

    // Shared: any authenticated user can list/view research
    Route::get('/research', [ResearchProposalController::class, 'index'])->name('research.index');
    Route::get('/research/{proposal}', [ResearchProposalController::class, 'show'])->name('research.show');
    Route::get('/research/{proposal}/file', [ResearchProposalController::class, 'downloadFile'])->name('research.file');

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

