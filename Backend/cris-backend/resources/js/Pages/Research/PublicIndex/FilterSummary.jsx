import { Tag } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

export default function FilterSummary({
    D,
    textPrim,
    textSecond,
    proposals,
    hasActiveFilters,
    search,
    setSearch,
    yearFrom,
    setYearFrom,
    yearTo,
    setYearTo,
    school,
    setSchool,
    institutionId,
    setInstitutionId,
    selectedInstitutionLabel,
    category,
    setCategory,
    selectedCategoryLabel,
    disciplineCode,
    setDisciplineCode,
    selectedDisciplineLabel,
    sort,
    setSort,
    sortLabelMap,
    applyFilters,
    saveCurrentSearch,
    clearAll,
    savedSearches,
    applySavedSearch,
    deleteSavedSearch,
}) {
    return (
        <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className={`text-sm ${textSecond}`}>
                    Showing{' '}
                    <span className={`font-semibold ${textPrim}`}>{proposals.data.length}</span> of{' '}
                    <span className={`font-semibold ${textPrim}`}>{proposals.total}</span> approved
                    papers
                </p>
                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-1.5">
                        {search && (
                            <Tag
                                color="blue"
                                closable
                                onClose={() => {
                                    setSearch('');
                                    applyFilters();
                                }}
                            >
                                Query: {search}
                            </Tag>
                        )}
                        {yearFrom && (
                            <Tag
                                color="gold"
                                closable
                                onClose={() => {
                                    setYearFrom('');
                                    applyFilters();
                                }}
                            >
                                From: {yearFrom}
                            </Tag>
                        )}
                        {yearTo && (
                            <Tag
                                color="gold"
                                closable
                                onClose={() => {
                                    setYearTo('');
                                    applyFilters();
                                }}
                            >
                                To: {yearTo}
                            </Tag>
                        )}
                        {school && (
                            <Tag
                                color="geekblue"
                                closable
                                onClose={() => {
                                    setSchool('');
                                    applyFilters();
                                }}
                            >
                                School: {school}
                            </Tag>
                        )}
                        {institutionId && selectedInstitutionLabel && (
                            <Tag
                                color="cyan"
                                closable
                                onClose={() => {
                                    setInstitutionId('');
                                    applyFilters();
                                }}
                            >
                                Inst: {selectedInstitutionLabel}
                            </Tag>
                        )}
                        {category && selectedCategoryLabel && (
                            <Tag
                                color="geekblue"
                                closable
                                onClose={() => {
                                    setCategory('');
                                    applyFilters();
                                }}
                            >
                                Category: {selectedCategoryLabel}
                            </Tag>
                        )}
                        {disciplineCode && selectedDisciplineLabel && (
                            <Tag
                                color="cyan"
                                closable
                                onClose={() => {
                                    setDisciplineCode('');
                                    applyFilters();
                                }}
                            >
                                Discipline: {selectedDisciplineLabel}
                            </Tag>
                        )}
                        {sort && sort !== 'recent' && (
                            <Tag
                                color="purple"
                                closable
                                onClose={() => {
                                    setSort('recent');
                                    applyFilters();
                                }}
                            >
                                Sort: {sortLabelMap[sort]}
                            </Tag>
                        )}
                        <button
                            type="button"
                            onClick={saveCurrentSearch}
                            className={`text-xs underline ${textSecond} hover:text-blue-500`}
                        >
                            Save search
                        </button>
                        <button
                            type="button"
                            onClick={clearAll}
                            className={`text-xs underline ${textSecond} hover:text-red-400`}
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {savedSearches.length > 0 && (
                <div
                    className={`mb-4 rounded-2xl border px-4 py-3 ${D ? 'border-[#1e2d47] bg-[#111827]' : 'border-slate-200 bg-white'}`}
                >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <p
                                className={`text-xs font-semibold uppercase tracking-wide ${textSecond}`}
                            >
                                Saved Searches
                            </p>
                            <p className={`text-xs ${textSecond}`}>
                                Quickly reopen your common discovery filters.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {savedSearches.map((item) => (
                            <div
                                key={item.id}
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${D ? 'border-blue-900/50 bg-blue-950/30 text-blue-100' : 'border-blue-200 bg-blue-50 text-blue-700'}`}
                            >
                                <button
                                    type="button"
                                    onClick={() => applySavedSearch(item)}
                                    className="hover:underline"
                                >
                                    {item.name}
                                </button>
                                <button
                                    type="button"
                                    aria-label={`Delete saved search ${item.name}`}
                                    onClick={() => deleteSavedSearch(item.id)}
                                    className={`${D ? 'text-blue-300 hover:text-blue-100' : 'text-blue-500 hover:text-blue-800'}`}
                                >
                                    <CloseOutlined style={{ fontSize: 10 }} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
