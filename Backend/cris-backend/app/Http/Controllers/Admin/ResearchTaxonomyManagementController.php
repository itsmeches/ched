<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Discipline;
use App\Models\ResearchCategory;
use App\Models\ResearchProposal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResearchTaxonomyManagementController extends Controller
{
    public function index(): Response
    {
        $categoryUsageCounts = ResearchProposal::query()
            ->selectRaw('research_category, COUNT(*) as aggregate')
            ->whereNotNull('research_category')
            ->groupBy('research_category')
            ->pluck('aggregate', 'research_category');

        $disciplineUsageCounts = ResearchProposal::query()
            ->selectRaw('discipline_code, COUNT(*) as aggregate')
            ->whereNotNull('discipline_code')
            ->groupBy('discipline_code')
            ->pluck('aggregate', 'discipline_code');

        $categories = ResearchCategory::query()
            ->select(['id', 'type', 'value', 'label', 'sort_order', 'is_active'])
            ->orderBy('sort_order')
            ->orderBy('label')
            ->get()
            ->map(function (ResearchCategory $category) use ($categoryUsageCounts) {
                return [
                    ...$category->toArray(),
                    'proposals_count' => (int) ($categoryUsageCounts[$category->value] ?? 0),
                ];
            })
            ->values();

        $disciplines = Discipline::query()
            ->select(['id', 'code', 'name', 'sort_order', 'is_active'])
            ->orderBy('sort_order')
            ->orderBy('code')
            ->get()
            ->map(function (Discipline $discipline) use ($disciplineUsageCounts) {
                return [
                    ...$discipline->toArray(),
                    'proposals_count' => (int) ($disciplineUsageCounts[$discipline->code] ?? 0),
                ];
            })
            ->values();

        return Inertia::render('Admin/Taxonomy/Index', [
            'categories' => $categories,
            'disciplines' => $disciplines,
            'categoryTypes' => [
                ['label' => 'By Data Type', 'value' => 'data_type'],
                ['label' => 'By Purpose', 'value' => 'purpose'],
                ['label' => 'By Method', 'value' => 'method'],
            ],
        ]);
    }

    public function storeCategory(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', 'in:data_type,purpose,method'],
            'value' => ['required', 'string', 'max:100', 'regex:/^[a-z0-9_]+$/', 'unique:research_categories,value'],
            'label' => ['required', 'string', 'max:150'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        ResearchCategory::query()->create([
            ...$data,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return redirect()->route('admin.taxonomy.index')->with('success', 'Research category created.');
    }

    public function updateCategory(Request $request, ResearchCategory $category): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', 'in:data_type,purpose,method'],
            'value' => ['required', 'string', 'max:100', 'regex:/^[a-z0-9_]+$/', "unique:research_categories,value,{$category->id}"],
            'label' => ['required', 'string', 'max:150'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $oldValue = $category->value;
        $newValue = $data['value'];

        $category->update([
            ...$data,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => $data['is_active'] ?? true,
        ]);

        if ($oldValue !== $newValue) {
            ResearchProposal::query()
                ->where('research_category', $oldValue)
                ->update([
                    'research_category' => $newValue,
                    'category' => $newValue,
                    'category_type' => $data['type'],
                ]);
        } else {
            ResearchProposal::query()
                ->where('research_category', $newValue)
                ->update([
                    'category_type' => $data['type'],
                ]);
        }

        return redirect()->route('admin.taxonomy.index')->with('success', 'Research category updated.');
    }

    public function destroyCategory(ResearchCategory $category): RedirectResponse
    {
        $isInUse = ResearchProposal::query()
            ->where('research_category', $category->value)
            ->exists();

        if ($isInUse) {
            return redirect()->route('admin.taxonomy.index')
                ->with('error', 'Cannot delete a research category that is currently used by submissions.');
        }

        $category->delete();

        return redirect()->route('admin.taxonomy.index')->with('success', 'Research category deleted.');
    }

    public function storeDiscipline(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'size:2', 'regex:/^\d{2}$/', 'unique:disciplines,code'],
            'name' => ['required', 'string', 'max:200'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        Discipline::query()->create([
            ...$data,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return redirect()->route('admin.taxonomy.index')->with('success', 'Discipline created.');
    }

    public function updateDiscipline(Request $request, Discipline $discipline): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'size:2', 'regex:/^\d{2}$/', "unique:disciplines,code,{$discipline->id}"],
            'name' => ['required', 'string', 'max:200'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $oldCode = $discipline->code;
        $newCode = $data['code'];

        $discipline->update([
            ...$data,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => $data['is_active'] ?? true,
        ]);

        if ($oldCode !== $newCode) {
            ResearchProposal::query()
                ->where('discipline_code', $oldCode)
                ->update(['discipline_code' => $newCode]);
        }

        return redirect()->route('admin.taxonomy.index')->with('success', 'Discipline updated.');
    }

    public function destroyDiscipline(Discipline $discipline): RedirectResponse
    {
        $isInUse = ResearchProposal::query()
            ->where('discipline_code', $discipline->code)
            ->exists();

        if ($isInUse) {
            return redirect()->route('admin.taxonomy.index')
                ->with('error', 'Cannot delete a discipline that is currently used by submissions.');
        }

        $discipline->delete();

        return redirect()->route('admin.taxonomy.index')->with('success', 'Discipline deleted.');
    }
}
