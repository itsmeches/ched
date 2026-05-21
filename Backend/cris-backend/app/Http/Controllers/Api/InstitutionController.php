<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Institution;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class InstitutionController extends Controller
{
    // List all institutions (SuperAdmin/CHED only)
    public function index(Request $request)
    {
        $this->authorize('viewAny', Institution::class);

        $perPage = min(max((int) $request->integer('per_page', 10), 1), 100);
        $cacheKey = $this->institutionIndexCacheKey($request, $perPage);

        $institutions = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($perPage) {
            return Institution::query()
                ->select(['id', 'name', 'code', 'address', 'contact_email', 'contact_phone', 'created_at', 'updated_at'])
                ->withCount(['users', 'proposals'])
                ->orderBy('name')
                ->paginate($perPage)
                ->toArray();
        });

        return response()->json($institutions);
    }

    // Create institution (SuperAdmin only)
    public function store(Request $request)
    {
        $this->authorize('create', Institution::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:institutions,code|max:50',
            'address' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string|max:20',
        ], [], [
            'code' => 'acronym',
        ]);

        $institution = Institution::create($validated);
        $this->bumpInstitutionIndexCacheVersion();

        return response()->json([
            'message' => 'Institution created',
            'institution' => $institution,
        ], 201);
    }

    // View single institution
    public function show(Institution $institution)
    {
        $this->authorize('view', $institution);

        return response()->json($institution->load(['users', 'proposals']));
    }

    // Update institution (SuperAdmin only)
    public function update(Request $request, Institution $institution)
    {
        $this->authorize('update', $institution);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|unique:institutions,code,'.$institution->id.'|max:50',
            'address' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string|max:20',
        ], [], [
            'code' => 'acronym',
        ]);

        $institution->update($validated);
        $this->bumpInstitutionIndexCacheVersion();

        return response()->json([
            'message' => 'Institution updated',
            'institution' => $institution,
        ]);
    }

    // Delete institution (SuperAdmin only)
    public function destroy(Request $request, Institution $institution)
    {
        $this->authorize('delete', $institution);

        $institution->delete();
        $this->bumpInstitutionIndexCacheVersion();

        return response()->json(['message' => 'Institution deleted']);
    }

    private function institutionIndexCacheKey(Request $request, int $perPage): string
    {
        $version = (int) Cache::get('institutions:index:version', 1);
        $page = max((int) $request->integer('page', 1), 1);

        return "institutions:index:v{$version}:page:{$page}:per_page:{$perPage}";
    }

    private function bumpInstitutionIndexCacheVersion(): void
    {
        if (! Cache::has('institutions:index:version')) {
            Cache::forever('institutions:index:version', 1);
        }

        Cache::increment('institutions:index:version');
    }
}
