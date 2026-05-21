<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InstitutionController;
use App\Http\Controllers\Api\ResearchProposalController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:api-login');

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Research Proposals
    Route::get('/proposals', [ResearchProposalController::class, 'index']);
    Route::post('/proposals', [ResearchProposalController::class, 'store']);
    Route::get('/proposals/{proposal}', [ResearchProposalController::class, 'show']);
    Route::put('/proposals/{proposal}', [ResearchProposalController::class, 'update']);
    Route::post('/proposals/{proposal}/resubmit', [ResearchProposalController::class, 'resubmit']);
    Route::delete('/proposals/{proposal}', [ResearchProposalController::class, 'destroy']);
    Route::post('/proposals/{proposal}/review', [ResearchProposalController::class, 'review']);

    // Institutions (SuperAdmin/CHED only)
    Route::get('/institutions', [InstitutionController::class, 'index']);
    Route::post('/institutions', [InstitutionController::class, 'store']);
    Route::get('/institutions/{institution}', [InstitutionController::class, 'show']);
    Route::put('/institutions/{institution}', [InstitutionController::class, 'update']);
    Route::delete('/institutions/{institution}', [InstitutionController::class, 'destroy']);
});

Route::fallback(function () {
    return response()->json([
        'message' => 'The requested resource was not found.',
        'status' => 404,
    ], 404);
});
