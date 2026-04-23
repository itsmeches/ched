<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Keyword;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KeywordManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $keywords = Keyword::query()
            ->withCount('researchProposals')
            ->when($request->search, fn ($query, $search) =>
                $query->where('name', 'like', "%{$search}%")
            )
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Keywords/Index', [
            'keywords' => $keywords,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120', 'unique:keywords,name'],
        ]);

        Keyword::query()->create($data);

        return redirect()->route('admin.keywords.index')
            ->with('success', 'Keyword created.');
    }

    public function update(Request $request, Keyword $keyword): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120', "unique:keywords,name,{$keyword->id}"],
        ]);

        $keyword->update($data);

        return redirect()->route('admin.keywords.index')
            ->with('success', 'Keyword updated.');
    }

    public function destroy(Keyword $keyword): RedirectResponse
    {
        if ($keyword->researchProposals()->exists()) {
            return redirect()->route('admin.keywords.index')
                ->with('error', 'Cannot delete a keyword that is currently used by research papers.');
        }

        $keyword->delete();

        return redirect()->route('admin.keywords.index')
            ->with('success', 'Keyword deleted.');
    }
}
