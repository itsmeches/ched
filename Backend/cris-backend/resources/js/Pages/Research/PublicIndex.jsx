import { Head, router } from '@inertiajs/react';
import { Pagination } from 'antd';
import { UpOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@/utils/ThemeContext';
import PublicNav from '@/Components/Public/PublicNav';
import SearchHero from './PublicIndex/SearchHero';
import FilterSummary from './PublicIndex/FilterSummary';
import ResultsList from './PublicIndex/ResultsList';
import SaveSearchModal from './PublicIndex/SaveSearchModal';

const SAVED_SEARCHES_KEY = 'cris.public.saved-searches';

const SORT_LABEL_MAP = {
    recent: 'Recently approved',
    oldest: 'Oldest approved',
    year_desc: 'Year: newest first',
    year_asc: 'Year: oldest first',
    title_asc: 'Title: A → Z',
    title_desc: 'Title: Z → A',
};

export default function PublicResearchIndex({
    proposals,
    filters,
    institutions = [],
    categories = [],
    disciplines = [],
    popularDisciplines = [],
    canLogin,
    canRegister,
}) {
    const { dark } = useTheme();

    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [saveSearchModalOpen, setSaveSearchModalOpen] = useState(false);
    const [saveSearchName, setSaveSearchName] = useState('');

    useEffect(() => {
        function handleScroll() {
            setShowScrollTop(window.scrollY > 400);
        }
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [search, setSearch] = useState(filters.search ?? '');
    const [yearFrom, setYearFrom] = useState(filters.year_from ?? '');
    const [yearTo, setYearTo] = useState(filters.year_to ?? '');
    const [school, setSchool] = useState(filters.school ?? '');
    const [institutionId, setInstitutionId] = useState(filters.institution_id ?? '');
    const [category, setCategory] = useState(filters.category ?? '');
    const [disciplineCode, setDisciplineCode] = useState(filters.discipline_code ?? '');
    const [sort, setSort] = useState(filters.sort ?? 'recent');
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [savedSearches, setSavedSearches] = useState([]);

    const hasActiveFilters = Boolean(
        search ||
        yearFrom ||
        yearTo ||
        school ||
        institutionId ||
        category ||
        disciplineCode ||
        (sort && sort !== 'recent')
    );
    const hasAdvancedFilters = Boolean(
        yearFrom ||
        yearTo ||
        school ||
        institutionId ||
        category ||
        disciplineCode ||
        (sort && sort !== 'recent')
    );

    const isLiveFilterEnabled = useRef(false);

    const institutionOptions = useMemo(
        () => institutions.map((i) => ({ value: i.id, label: i.name })),
        [institutions]
    );
    const categoryOptions = useMemo(
        () => categories.map((i) => ({ value: i.value, label: i.label })),
        [categories]
    );
    const categoryLabelMap = useMemo(
        () => Object.fromEntries(categories.map((i) => [i.value, i.label])),
        [categories]
    );
    const disciplineOptions = useMemo(
        () => disciplines.map((i) => ({ value: i.code, label: i.name })),
        [disciplines]
    );
    const disciplineLabelMap = useMemo(
        () => Object.fromEntries(disciplines.map((i) => [i.code, i.name])),
        [disciplines]
    );

    const selectedInstitutionLabel = useMemo(() => {
        const found = institutions.find((i) => String(i.id) === String(institutionId));
        return found?.name ?? '';
    }, [institutions, institutionId]);
    const selectedCategoryLabel = useMemo(() => {
        const found = categories.find((i) => i.value === category);
        return found?.label ?? '';
    }, [categories, category]);
    const selectedDisciplineLabel = useMemo(() => {
        const found = disciplines.find((i) => i.code === disciplineCode);
        return found?.name ?? '';
    }, [disciplines, disciplineCode]);

    function formatDisciplineLabel(value) {
        if (!value) return '';
        const normalized = disciplineLabelMap[value] ?? value;
        return String(normalized).replace(/^\s*\d+\s*-\s*/, '');
    }

    function applyFilters(page = 1) {
        runIndexRequest({
            search,
            year_from: yearFrom,
            year_to: yearTo,
            school,
            institution_id: institutionId,
            category,
            discipline_code: disciplineCode,
            sort,
            page,
        });
    }

    function runIndexRequest(params, overrides = {}) {
        const { onStart, onFinish, ...rest } = overrides;

        router.get(route('research.public.index'), params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
            ...rest,
            onStart: () => {
                setIsFiltering(true);
                onStart?.();
            },
            onFinish: () => {
                setIsFiltering(false);
                onFinish?.();
            },
        });
    }

    function currentFilterPayload() {
        return {
            search,
            year_from: yearFrom,
            year_to: yearTo,
            school,
            institution_id: institutionId,
            category,
            discipline_code: disciplineCode,
            sort,
        };
    }

    function loadSavedSearches() {
        if (typeof window === 'undefined') return;

        try {
            const parsed = JSON.parse(window.localStorage.getItem(SAVED_SEARCHES_KEY) || '[]');
            setSavedSearches(Array.isArray(parsed) ? parsed : []);
        } catch {
            setSavedSearches([]);
        }
    }

    function persistSavedSearches(next) {
        setSavedSearches(next);

        if (typeof window !== 'undefined') {
            window.localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(next));
        }
    }

    function saveCurrentSearch() {
        setSaveSearchName(search ? `Search: ${search}` : 'My saved search');
        setSaveSearchModalOpen(true);
    }

    function confirmSaveCurrentSearch() {
        const name = saveSearchName.trim();

        if (!name) return;

        const next = [
            {
                id: Date.now(),
                name,
                filters: currentFilterPayload(),
            },
            ...savedSearches,
        ].slice(0, 8);

        persistSavedSearches(next);
        setSaveSearchModalOpen(false);
        setSaveSearchName('');
    }

    function applySavedSearch(item) {
        const next = item.filters || {};
        setSearch(next.search ?? '');
        setYearFrom(next.year_from ?? '');
        setYearTo(next.year_to ?? '');
        setSchool(next.school ?? '');
        setInstitutionId(next.institution_id ?? '');
        setCategory(next.category ?? '');
        setDisciplineCode(next.discipline_code ?? '');
        setSort(next.sort ?? 'recent');

        runIndexRequest(next);
    }

    function deleteSavedSearch(id) {
        persistSavedSearches(savedSearches.filter((item) => item.id !== id));
    }

    function clearAll() {
        setSearch('');
        setYearFrom('');
        setYearTo('');
        setSchool('');
        setInstitutionId('');
        setCategory('');
        setDisciplineCode('');
        setSort('recent');
        runIndexRequest({});
    }

    useEffect(() => {
        if (!isLiveFilterEnabled.current) return;
        const id = window.setTimeout(() => applyFilters(1), 450);
        return () => window.clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, yearFrom, yearTo, school, institutionId, category, disciplineCode, sort]);

    useEffect(() => {
        loadSavedSearches();
    }, []);

    const D = dark;
    const bg = D ? 'bg-[#0a0f1e]' : 'bg-slate-50';
    const heroBg = D ? 'bg-[#0d1526]' : 'bg-gradient-to-b from-white via-[#f3f8ff] to-white';
    const cardBg = D ? 'bg-[#111827]' : 'bg-white';
    const cardBorder = D ? 'border-[#1e2d47]' : 'border-slate-200';
    const textPrim = D ? 'text-white' : 'text-slate-900';
    const textSecond = D ? 'text-slate-400' : 'text-slate-500';
    const textMeta = D ? 'text-slate-300' : 'text-slate-600';
    const hoverCard = D
        ? 'hover:border-blue-500 hover:shadow-blue-900/30'
        : 'hover:border-blue-200 hover:shadow-md';
    const labelCls = D ? 'text-slate-400' : 'text-slate-500';

    return (
        <>
            <Head title="CRIS - CALABARZON Research Information System">
                <meta
                    head-key="description"
                    name="description"
                    content="Search approved research papers in CRIS, the CALABARZON Research Information System public archive for Region IV-A institutions."
                />
            </Head>

            <div className={`min-h-screen transition-colors duration-300 ${bg}`}>
                <PublicNav canLogin={canLogin} canRegister={canRegister} />

                {isFiltering && (
                    <div className="sticky top-0 z-30 h-1 w-full overflow-hidden bg-transparent">
                        <div className="h-full w-1/3 animate-pulse rounded-r bg-[#0033a0]" />
                    </div>
                )}

                <SearchHero
                    D={D}
                    heroBg={heroBg}
                    labelCls={labelCls}
                    proposals={proposals}
                    search={search}
                    setSearch={setSearch}
                    applyFilters={applyFilters}
                    isFiltering={isFiltering}
                    advancedOpen={advancedOpen}
                    setAdvancedOpen={setAdvancedOpen}
                    hasAdvancedFilters={hasAdvancedFilters}
                    isLiveFilterEnabled={isLiveFilterEnabled}
                    yearFrom={yearFrom}
                    setYearFrom={setYearFrom}
                    yearTo={yearTo}
                    setYearTo={setYearTo}
                    school={school}
                    setSchool={setSchool}
                    institutionId={institutionId}
                    setInstitutionId={setInstitutionId}
                    institutionOptions={institutionOptions}
                    category={category}
                    setCategory={setCategory}
                    categoryOptions={categoryOptions}
                    disciplineCode={disciplineCode}
                    setDisciplineCode={setDisciplineCode}
                    disciplineOptions={disciplineOptions}
                    sort={sort}
                    setSort={setSort}
                    clearAll={clearAll}
                    popularDisciplines={popularDisciplines}
                    runIndexRequest={runIndexRequest}
                />

                <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                    <FilterSummary
                        D={D}
                        textPrim={textPrim}
                        textSecond={textSecond}
                        proposals={proposals}
                        hasActiveFilters={hasActiveFilters}
                        search={search}
                        setSearch={setSearch}
                        yearFrom={yearFrom}
                        setYearFrom={setYearFrom}
                        yearTo={yearTo}
                        setYearTo={setYearTo}
                        school={school}
                        setSchool={setSchool}
                        institutionId={institutionId}
                        setInstitutionId={setInstitutionId}
                        selectedInstitutionLabel={selectedInstitutionLabel}
                        category={category}
                        setCategory={setCategory}
                        selectedCategoryLabel={selectedCategoryLabel}
                        disciplineCode={disciplineCode}
                        setDisciplineCode={setDisciplineCode}
                        selectedDisciplineLabel={selectedDisciplineLabel}
                        sort={sort}
                        setSort={setSort}
                        sortLabelMap={SORT_LABEL_MAP}
                        applyFilters={applyFilters}
                        saveCurrentSearch={saveCurrentSearch}
                        clearAll={clearAll}
                        savedSearches={savedSearches}
                        applySavedSearch={applySavedSearch}
                        deleteSavedSearch={deleteSavedSearch}
                    />

                    <ResultsList
                        isFiltering={isFiltering}
                        cardBg={cardBg}
                        cardBorder={cardBorder}
                        hoverCard={hoverCard}
                        textSecond={textSecond}
                        textMeta={textMeta}
                        proposals={proposals}
                        categoryLabelMap={categoryLabelMap}
                        formatDisciplineLabel={formatDisciplineLabel}
                        setSearch={setSearch}
                        isLiveFilterEnabled={isLiveFilterEnabled}
                        runIndexRequest={runIndexRequest}
                        yearFrom={yearFrom}
                        yearTo={yearTo}
                        school={school}
                        institutionId={institutionId}
                        category={category}
                        disciplineCode={disciplineCode}
                        sort={sort}
                    />

                    {proposals.last_page > 1 && (
                        <div className="mt-8 flex justify-center">
                            <Pagination
                                current={proposals.current_page}
                                pageSize={proposals.per_page}
                                total={proposals.total}
                                onChange={(page) => applyFilters(page)}
                                showSizeChanger={false}
                            />
                        </div>
                    )}

                    <p className={`mt-10 text-center text-xs ${textSecond}`}>
                        CRIS is the official public-facing archive for approved CALABARZON research
                        submissions.
                    </p>
                </div>
            </div>

            {showScrollTop && (
                <button
                    type="button"
                    aria-label="Scroll to top"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className={`fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 ${
                        D
                            ? 'bg-[#1a2540] text-white ring-1 ring-white/20 hover:bg-[#243054]'
                            : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
                    }`}
                >
                    <UpOutlined style={{ fontSize: 14 }} />
                </button>
            )}

            <SaveSearchModal
                open={saveSearchModalOpen}
                name={saveSearchName}
                onNameChange={setSaveSearchName}
                onCancel={() => setSaveSearchModalOpen(false)}
                onOk={confirmSaveCurrentSearch}
            />
        </>
    );
}
