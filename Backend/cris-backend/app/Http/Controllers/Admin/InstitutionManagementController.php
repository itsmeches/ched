<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Institution;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InstitutionManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $institutions = Institution::withCount('users')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%")
                ->orWhere('code', 'like', "%{$s}%")
            )
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Institutions/Index', [
            'institutions' => $institutions,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Institutions/Create');
    }

    public function export(Request $request): StreamedResponse
    {
        $query = Institution::withCount('users')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%")
                ->orWhere('code', 'like', "%{$s}%")
            )
            ->orderBy('name');

        $fileName = 'institutions-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Name', 'Code', 'Address', 'Contact Email', 'Contact Phone', 'Users', 'Created At']);

            $query->chunkById(500, function ($rows) use ($handle) {
                foreach ($rows as $row) {
                    fputcsv($handle, [
                        $row->id,
                        $row->name,
                        $row->code,
                        $row->address,
                        $row->contact_email,
                        $row->contact_phone,
                        $row->users_count,
                        optional($row->created_at)->format('Y-m-d H:i:s'),
                    ]);
                }
            });

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:institutions,code'],
            'address' => ['nullable', 'string', 'max:500'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
        ], [], [
            'code' => 'acronym',
        ]);

        Institution::create($data);

        return redirect()->route('admin.institutions.index')
            ->with('success', 'Institution created.');
    }

    public function edit(Institution $institution): Response
    {
        return Inertia::render('Admin/Institutions/Edit', [
            'institution' => $institution,
        ]);
    }

    public function update(Request $request, Institution $institution): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', "unique:institutions,code,{$institution->id}"],
            'address' => ['nullable', 'string', 'max:500'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
        ], [], [
            'code' => 'acronym',
        ]);

        $institution->update($data);

        return redirect()->route('admin.institutions.index')
            ->with('success', 'Institution updated.');
    }

    public function destroy(Institution $institution): RedirectResponse
    {
        $institution->delete();

        return redirect()->route('admin.institutions.index')
            ->with('success', 'Institution deleted.');
    }
}
