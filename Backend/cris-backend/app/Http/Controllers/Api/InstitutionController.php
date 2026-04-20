<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Institution;
use Illuminate\Http\Request;

class InstitutionController extends Controller
{
    // List all institutions (SuperAdmin/CHED only)
    public function index(Request $request)
    {
        $institutions = Institution::withCount(['users', 'proposals'])
            ->orderBy('name')
            ->paginate(10);

        return response()->json($institutions);
    }

    // Create institution (SuperAdmin only)
    public function store(Request $request)
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:institutions,code|max:50',
            'address' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string|max:20',
        ]);

        $institution = Institution::create($validated);

        return response()->json([
            'message' => 'Institution created',
            'institution' => $institution,
        ], 201);
    }

    // View single institution
    public function show(Institution $institution)
    {
        return response()->json($institution->load(['users', 'proposals']));
    }

    // Update institution (SuperAdmin only)
    public function update(Request $request, Institution $institution)
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|unique:institutions,code,' . $institution->id . '|max:50',
            'address' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string|max:20',
        ]);

        $institution->update($validated);

        return response()->json([
            'message' => 'Institution updated',
            'institution' => $institution,
        ]);
    }

    // Delete institution (SuperAdmin only)
    public function destroy(Request $request, Institution $institution)
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $institution->delete();

        return response()->json(['message' => 'Institution deleted']);
    }
}