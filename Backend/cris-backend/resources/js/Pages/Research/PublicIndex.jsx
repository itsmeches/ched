import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button, Col, Input, Pagination, Row, Select, Tag } from 'antd';
import {
    BookOutlined,
    CloseOutlined,
    ControlOutlined,
    MoonOutlined,
    SearchOutlined,
    SunOutlined,
    UpOutlined,
    DownOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@/utils/ThemeContext';

// ── Popular discipline quick-links shown below search bar ────────────────────
const POPULAR_TOPICS = ['Agriculture', 'Engineering', 'Information Technology', 'Education', 'Health Sciences'];

export default function PublicResearchIndex({
    proposals,
    filters,
    institutions = [],
    categories = [],
    disciplines = [],
    canLogin,
    canRegister,
}) {
    const { auth } = usePage().props;
    const { dark, toggleDark } = useTheme();

    // ── filter state ──────────────────────────────────────────────────────────
    const [search, setSearch] = useState(filters.search ?? '');
    const [yearFrom, setYearFrom] = useState(filters.year_from ?? '');
    const [yearTo, setYearTo] = useState(filters.year_to ?? '');
    const [school, setSchool] = useState(filters.school ?? '');
    const [institutionId, setInstitutionId] = useState(filters.institution_id ?? '');
    const [category, setCategory] = useState(filters.category ?? '');
    const [disciplineCode, setDisciplineCode] = useState(filters.discipline_code ?? '');
    const [sort, setSort] = useState(filters.sort ?? 'recent');
    const [advancedOpen, setAdvancedOpen] = useState(false);

    const hasActiveFilters = Boolean(
        search || yearFrom || yearTo || school || institutionId || category || disciplineCode || (sort && sort !== 'recent'),
    );
    const hasAdvancedFilters = Boolean(yearFrom || yearTo || school || institutionId || category || disciplineCode || (sort && sort !== 'recent'));

    const isLiveFilterEnabled = useRef(false);

    // ── derived options ───────────────────────────────────────────────────────
    const institutionOptions = useMemo(
        () => institutions.map((i) => ({ value: i.id, label: i.name })),
        [institutions],
    );
    const categoryOptions = useMemo(
        () => categories.map((i) => ({ value: i.value, label: i.label })),
        [categories],
    );
    const categoryLabelMap = useMemo(
        () => Object.fromEntries(categories.map((i) => [i.value, i.label])),
        [categories],
    );
    const disciplineOptions = useMemo(
        () => disciplines.map((i) => ({ value: i.code, label: i.name })),
        [disciplines],
    );
    const disciplineLabelMap = useMemo(
        () => Object.fromEntries(disciplines.map((i) => [i.code, i.name])),
        [disciplines],
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

    const sortLabelMap = {
        recent: 'Recently approved',
        oldest: 'Oldest approved',
        year_desc: 'Year: newest first',
        year_asc: 'Year: oldest first',
        title_asc: 'Title: A → Z',
        title_desc: 'Title: Z → A',
    };

    function formatDisciplineLabel(value) {
        if (!value) return '';
        const normalized = disciplineLabelMap[value] ?? value;
        return String(normalized).replace(/^\s*\d+\s*-\s*/, '');
    }

    function applyFilters(page = 1) {
        router.get(
            route('research.public.index'),
            { search, year_from: yearFrom, year_to: yearTo, school, institution_id: institutionId, category, discipline_code: disciplineCode, sort, page },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    }

    function clearAll() {
        setSearch(''); setYearFrom(''); setYearTo(''); setSchool('');
        setInstitutionId(''); setCategory(''); setDisciplineCode(''); setSort('recent');
        router.get(route('research.public.index'), {}, { replace: true, preserveScroll: true });
    }

    // persist dark mode — handled globally by ThemeContext

    // live-search debounce
    useEffect(() => {
        if (!isLiveFilterEnabled.current) return;
        const id = window.setTimeout(() => applyFilters(1), 450);
        return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, yearFrom, yearTo, school, institutionId, category, disciplineCode, sort]);

    // ── theme tokens ──────────────────────────────────────────────────────────
    const D = dark;
    const bg        = D ? 'bg-[#0a0f1e]'      : 'bg-slate-50';
    const heroBg    = D ? 'bg-[#0d1526]'      : 'bg-white';
    const cardBg    = D ? 'bg-[#111827]'      : 'bg-white';
    const cardBorder= D ? 'border-[#1e2d47]'  : 'border-slate-200';
    const textPrim  = D ? 'text-white'         : 'text-slate-900';
    const textSecond= D ? 'text-slate-400'     : 'text-slate-500';
    const textMeta  = D ? 'text-slate-300'     : 'text-slate-600';
    const hoverCard = D ? 'hover:border-blue-500 hover:shadow-blue-900/30' : 'hover:border-blue-200 hover:shadow-md';
    const advBg     = D ? 'bg-[#0d1526] border-[#1e2d47]' : 'bg-white border-slate-200';
    const labelCls  = D ? 'text-slate-400'     : 'text-slate-500';
    const inputBg   = D ? '[&_.ant-input]:bg-[#1a2540] [&_.ant-input]:text-white [&_.ant-input]:border-[#2a3a5c] [&_.ant-select-selector]:bg-[#1a2540] [&_.ant-select-selector]:text-white [&_.ant-select-selector]:border-[#2a3a5c]' : '';

    return (
        <>
            <Head title="CRIS - CALABARZON Research Information System">
                <meta head-key="description" name="description" content="Search approved research papers in CRIS, the CALABARZON Research Information System public archive for Region IV-A institutions." />
            </Head>

            <div className={`min-h-screen transition-colors duration-300 ${bg}`}>

                {/* ── Top navbar ──────────────────────────────────────────── */}
                <nav className={`sticky top-0 z-40 border-b backdrop-blur-md ${D ? 'bg-[#0a0f1e]/90 border-[#1e2d47]' : 'bg-white/90 border-slate-200'}`}>
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
                        <div className="flex items-center gap-2.5">
                            <img src="/cris-mark.svg" alt="CRIS" className="h-8 w-8 rounded-lg" />
                            <span className={`hidden text-sm font-semibold sm:block ${D ? 'text-white' : 'text-slate-800'}`}>
                                CRIS
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Dark / light toggle */}
                            <button
                                type="button"
                                onClick={toggleDark}
                                aria-label="Toggle theme"
                                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${D ? 'bg-[#1a2540] text-yellow-300 hover:bg-[#243054]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {D ? <SunOutlined /> : <MoonOutlined />}
                            </button>
                            {auth?.user ? (
                                <Link href={route('dashboard')}>
                                    <button type="button" className="rounded-lg bg-[#0033a0] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                                        Dashboard
                                    </button>
                                </Link>
                            ) : (
                                <>
                                    {canLogin && (
                                        <Link href={route('login')}>
                                            <button type="button" className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${D ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                                                Sign In
                                            </button>
                                        </Link>
                                    )}
                                    {canRegister && (
                                        <Link href={route('register')}>
                                            <button type="button" className="rounded-lg bg-[#0033a0] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                                                Submit Research
                                            </button>
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* ── Hero ────────────────────────────────────────────────── */}
                <section className={`${heroBg} relative overflow-hidden pb-16 pt-20 text-center`}>
                    {/* subtle radial glows */}
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute left-1/4 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
                        <div className="absolute right-1/4 top-10 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />
                    </div>

                    <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
                        {/* badge */}
                        <div className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium backdrop-blur-sm ${
                            D ? 'border-white/20 bg-white/10 text-white' : 'border-slate-200 bg-slate-100 text-slate-600'
                        }`}>
                            <BookOutlined style={{ color: D ? '#fde047' : '#0033a0' }} />
                            <span>{proposals.total.toLocaleString()} Research Papers Available</span>
                        </div>

                        <h1 className={`mb-4 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl ${D ? 'text-white' : 'text-slate-900'}`}>
                            Empowering Research in<br />
                            <span className={D ? 'text-blue-300' : 'text-[#0033a0]'}>Region 4-A CALABARZON</span>
                        </h1>

                        <p className={`mb-10 text-base sm:text-lg ${D ? 'text-blue-100/80' : 'text-slate-500'}`}>
                            The official Higher Education Research Information System. Discover,<br className="hidden sm:block" />
                            collaborate, and innovate with academic studies from top institutions.
                        </p>

                        {/* ── Search bar ─────────────────────────────────── */}
                        <div className="mx-auto max-w-2xl">
                            <div className={`flex overflow-hidden rounded-2xl p-1.5 shadow-xl backdrop-blur-md ring-1 ${D ? 'bg-white/10 shadow-black/20 ring-white/20' : 'bg-slate-100 shadow-slate-200/80 ring-slate-200'}`}>
                                <div className="flex flex-1 items-center gap-2 rounded-xl bg-white px-4 py-1">
                                    <SearchOutlined className="flex-shrink-0 text-slate-400" style={{ fontSize: 18 }} />
                                    <input
                                        type="text"
                                        value={search}
                                        placeholder="Search for papers, authors, or topics..."
                                        className="flex-1 bg-transparent py-2 text-slate-800 placeholder-slate-400 outline-none text-sm"
                                        onChange={(e) => {
                                            isLiveFilterEnabled.current = true;
                                            setSearch(e.target.value);
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                    />
                                    {search && (
                                        <button type="button" onClick={() => { setSearch(''); isLiveFilterEnabled.current = true; }} className="text-slate-400 hover:text-slate-600">
                                            <CloseOutlined style={{ fontSize: 13 }} />
                                        </button>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => applyFilters()}
                                    className="ml-1.5 rounded-xl bg-[#0033a0] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:scale-95"
                                >
                                    Search
                                </button>
                            </div>

                            {/* ── Advanced search toggle ─────────────────── */}
                            <button
                                type="button"
                                onClick={() => setAdvancedOpen((v) => !v)}
                                className={`mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                    hasAdvancedFilters
                                        ? (D ? 'bg-blue-500/30 text-blue-200 ring-1 ring-blue-400/40' : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200')
                                        : (D ? 'bg-white/10 text-blue-100 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
                                }`}
                            >
                                <ControlOutlined />
                                Advanced Search
                                {hasAdvancedFilters && (
                                    <span className="rounded-full bg-blue-400 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                        Active
                                    </span>
                                )}
                                {advancedOpen ? <UpOutlined style={{ fontSize: 10 }} /> : <DownOutlined style={{ fontSize: 10 }} />}
                            </button>

                            {/* ── Advanced search panel ──────────────────── */}
                            {advancedOpen && (
                                <div className={`mt-2 rounded-2xl border p-4 text-left shadow-2xl ${D ? 'bg-[#0d1526]/95 border-[#1e2d47]' : 'bg-white border-slate-200'} backdrop-blur-md`}>
                                    <Row gutter={[12, 12]}>
                                        <Col xs={12} sm={6}>
                                            <label className={`mb-1 block text-xs ${labelCls}`}>Year From</label>
                                            <Input
                                                placeholder="2020"
                                                value={yearFrom}
                                                size="middle"
                                                onChange={(e) => { isLiveFilterEnabled.current = true; setYearFrom(e.target.value.replace(/\D/g, '')); }}
                                                onPressEnter={() => applyFilters()}
                                            />
                                        </Col>
                                        <Col xs={12} sm={6}>
                                            <label className={`mb-1 block text-xs ${labelCls}`}>Year To</label>
                                            <Input
                                                placeholder="2026"
                                                value={yearTo}
                                                size="middle"
                                                onChange={(e) => { isLiveFilterEnabled.current = true; setYearTo(e.target.value.replace(/\D/g, '')); }}
                                                onPressEnter={() => applyFilters()}
                                            />
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <label className={`mb-1 block text-xs ${labelCls}`}>School</label>
                                            <Input
                                                placeholder="School name"
                                                value={school}
                                                size="middle"
                                                onChange={(e) => { isLiveFilterEnabled.current = true; setSchool(e.target.value); }}
                                                onPressEnter={() => applyFilters()}
                                            />
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <label className={`mb-1 block text-xs ${labelCls}`}>Institution</label>
                                            <Select placeholder="All institutions" value={institutionId || undefined} allowClear showSearch optionFilterProp="label" options={institutionOptions} onChange={(v) => { isLiveFilterEnabled.current = true; setInstitutionId(v ?? ''); }} style={{ width: '100%' }} size="middle" />
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <label className={`mb-1 block text-xs ${labelCls}`}>Category</label>
                                            <Select placeholder="All categories" value={category || undefined} allowClear options={categoryOptions} onChange={(v) => { isLiveFilterEnabled.current = true; setCategory(v ?? ''); }} style={{ width: '100%' }} size="middle" />
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <label className={`mb-1 block text-xs ${labelCls}`}>Discipline</label>
                                            <Select placeholder="All disciplines" value={disciplineCode || undefined} allowClear showSearch optionFilterProp="label" options={disciplineOptions} onChange={(v) => { isLiveFilterEnabled.current = true; setDisciplineCode(v ?? ''); }} style={{ width: '100%' }} size="middle" />
                                        </Col>
                                        <Col xs={24}>
                                            <label className={`mb-1 block text-xs ${labelCls}`}>Sort By</label>
                                            <Select
                                                value={sort}
                                                options={[
                                                    { value: 'recent', label: 'Recently approved' },
                                                    { value: 'oldest', label: 'Oldest approved' },
                                                    { value: 'year_desc', label: 'Year: newest first' },
                                                    { value: 'year_asc', label: 'Year: oldest first' },
                                                    { value: 'title_asc', label: 'Title: A → Z' },
                                                    { value: 'title_desc', label: 'Title: Z → A' },
                                                ]}
                                                onChange={(v) => { isLiveFilterEnabled.current = true; setSort(v); }}
                                                style={{ width: '100%' }}
                                                size="middle"
                                            />
                                        </Col>
                                    </Row>
                                    <div className="mt-3 flex justify-end gap-2 border-t border-slate-100/10 pt-3">
                                        <button type="button" onClick={clearAll} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${D ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
                                            Clear All
                                        </button>
                                        <button type="button" onClick={() => { applyFilters(); setAdvancedOpen(false); }} className="rounded-lg bg-[#0033a0] px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
                                            Apply Filters
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── Popular topics ─────────────────────────── */}
                            <div className={`mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm ${D ? 'text-blue-100/70' : 'text-slate-400'}`}>
                                <span className="font-medium">Popular:</span>
                                {POPULAR_TOPICS.map((topic) => (
                                    <button
                                        key={topic}
                                        type="button"
                                        onClick={() => { isLiveFilterEnabled.current = true; setSearch(topic); applyFilters(); }}
                                        className="transition-colors hover:text-white"
                                    >
                                        {topic}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Results area ────────────────────────────────────────── */}
                <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

                    {/* active filter chips + summary */}
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <p className={`text-sm ${textSecond}`}>
                            Showing{' '}
                            <span className={`font-semibold ${textPrim}`}>{proposals.data.length}</span> of{' '}
                            <span className={`font-semibold ${textPrim}`}>{proposals.total}</span> approved papers
                        </p>
                        {hasActiveFilters && (
                            <div className="flex flex-wrap gap-1.5">
                                {search && <Tag color="blue" closable onClose={() => { setSearch(''); applyFilters(); }}>Query: {search}</Tag>}
                                {yearFrom && <Tag color="gold" closable onClose={() => { setYearFrom(''); applyFilters(); }}>From: {yearFrom}</Tag>}
                                {yearTo && <Tag color="gold" closable onClose={() => { setYearTo(''); applyFilters(); }}>To: {yearTo}</Tag>}
                                {school && <Tag color="geekblue" closable onClose={() => { setSchool(''); applyFilters(); }}>School: {school}</Tag>}
                                {institutionId && selectedInstitutionLabel && <Tag color="cyan" closable onClose={() => { setInstitutionId(''); applyFilters(); }}>Inst: {selectedInstitutionLabel}</Tag>}
                                {category && selectedCategoryLabel && <Tag color="geekblue" closable onClose={() => { setCategory(''); applyFilters(); }}>Category: {selectedCategoryLabel}</Tag>}
                                {disciplineCode && selectedDisciplineLabel && <Tag color="cyan" closable onClose={() => { setDisciplineCode(''); applyFilters(); }}>Discipline: {selectedDisciplineLabel}</Tag>}
                                {sort && sort !== 'recent' && <Tag color="purple" closable onClose={() => { setSort('recent'); applyFilters(); }}>Sort: {sortLabelMap[sort]}</Tag>}
                                <button type="button" onClick={clearAll} className={`text-xs underline ${textSecond} hover:text-red-400`}>Clear all</button>
                            </div>
                        )}
                    </div>

                    {/* results list */}
                    <div className="space-y-3">
                        {proposals.data.length === 0 ? (
                            <div className={`rounded-2xl border px-6 py-16 text-center ${cardBg} ${cardBorder}`}>
                                <SearchOutlined className={`block mx-auto mb-3 ${textSecond}`} style={{ fontSize: 40 }} />
                                <p className={textSecond}>No approved papers found for this search.</p>
                            </div>
                        ) : (
                            proposals.data.map((row) => {
                                const rawCategory = row.research_category || row.category;
                                const categoryLabel = rawCategory ? (categoryLabelMap[rawCategory] ?? rawCategory) : null;
                                const disciplineLabel = row.discipline_label ? formatDisciplineLabel(row.discipline_label) : null;

                                return (
                                    <div
                                        key={row.id}
                                        className={`rounded-2xl border px-5 py-4 transition-all ${cardBg} ${cardBorder} ${hoverCard} hover:shadow-lg`}
                                    >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0 flex-1 space-y-2">
                                                <Link
                                                    href={route('research.public.show', row.id)}
                                                    className={`block text-base font-semibold leading-snug transition-colors hover:text-blue-500 ${textPrim}`}
                                                >
                                                    {row.title}
                                                </Link>

                                                {(categoryLabel || disciplineLabel) && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {categoryLabel && <Tag color="geekblue" style={{ margin: 0 }}>{categoryLabel}</Tag>}
                                                        {disciplineLabel && <Tag color="cyan" style={{ margin: 0 }}>{disciplineLabel}</Tag>}
                                                    </div>
                                                )}

                                                <div className={`flex flex-wrap gap-x-4 gap-y-0.5 text-xs ${textSecond}`}>
                                                    {row.authors && (
                                                        <span><span className={`font-medium ${textMeta}`}>Author:</span> {row.authors}</span>
                                                    )}
                                                    {row.school && (
                                                        <span><span className={`font-medium ${textMeta}`}>School:</span> {row.school}</span>
                                                    )}
                                                    {row.institution?.name && <span>{row.institution.name}</span>}
                                                    {row.year && (
                                                        <span><span className={`font-medium ${textMeta}`}>Year:</span> {row.year}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex-shrink-0 sm:pl-4">
                                                <Link href={route('research.public.show', row.id)}>
                                                    <button
                                                        type="button"
                                                        className="rounded-lg bg-[#0033a0] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 active:scale-95"
                                                    >
                                                        View Paper
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* pagination */}
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
                        CRIS is the official public-facing archive for approved CALABARZON research submissions.
                    </p>
                </div>
            </div>
        </>
    );
}
