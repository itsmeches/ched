import { Col, Input, Row, Select } from 'antd';
import {
    BookOutlined,
    CloseOutlined,
    ControlOutlined,
    DownOutlined,
    SearchOutlined,
    UpOutlined,
} from '@ant-design/icons';

export default function SearchHero({
    D,
    heroBg,
    labelCls,
    proposals,
    search,
    setSearch,
    applyFilters,
    isFiltering,
    advancedOpen,
    setAdvancedOpen,
    hasAdvancedFilters,
    isLiveFilterEnabled,
    yearFrom,
    setYearFrom,
    yearTo,
    setYearTo,
    school,
    setSchool,
    institutionId,
    setInstitutionId,
    institutionOptions,
    category,
    setCategory,
    categoryOptions,
    disciplineCode,
    setDisciplineCode,
    disciplineOptions,
    sort,
    setSort,
    clearAll,
    popularDisciplines,
    runIndexRequest,
}) {
    return (
        <section className={`${heroBg} relative overflow-hidden pb-16 pt-20 text-center`}>
            <div className="pointer-events-none absolute inset-0">
                <div
                    className={`absolute left-1/4 top-0 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl ${D ? 'bg-blue-500/10' : 'bg-blue-400/20'}`}
                />
                <div
                    className={`absolute right-1/4 top-10 h-64 w-64 rounded-full blur-3xl ${D ? 'bg-indigo-400/10' : 'bg-sky-300/25'}`}
                />
                <div
                    className={`absolute left-1/2 top-20 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl ${D ? 'bg-blue-900/15' : 'bg-cyan-200/30'}`}
                />
            </div>

            <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
                <div
                    className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium backdrop-blur-sm ${
                        D
                            ? 'border-white/20 bg-white/10 text-white'
                            : 'border-slate-200 bg-slate-100 text-slate-600'
                    }`}
                >
                    <BookOutlined style={{ color: D ? '#fde047' : '#0033a0' }} />
                    <span>{proposals.total.toLocaleString()} Research Papers Available</span>
                </div>

                <h1
                    className={`mb-4 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl ${D ? 'text-white' : 'text-slate-900'}`}
                >
                    Empowering Research in
                    <br />
                    <span className={D ? 'text-blue-300' : 'text-[#0033a0]'}>
                        Region 4-A CALABARZON
                    </span>
                </h1>

                <p
                    className={`mb-10 text-base sm:text-lg ${D ? 'text-blue-100/80' : 'text-slate-500'}`}
                >
                    The official Higher Education Research Information System. Discover,
                    <br className="hidden sm:block" />
                    collaborate, and innovate with academic studies from top institutions.
                </p>

                <div className="mx-auto max-w-2xl">
                    <div
                        className={`flex overflow-hidden rounded-2xl p-1.5 shadow-xl backdrop-blur-md ring-1 ${D ? 'bg-white/10 shadow-black/20 ring-white/20' : 'bg-slate-100 shadow-slate-200/80 ring-slate-200'}`}
                    >
                        <div className="flex flex-1 items-center gap-2 rounded-xl bg-white px-4 py-1">
                            <SearchOutlined
                                className="flex-shrink-0 text-slate-400"
                                style={{ fontSize: 18 }}
                            />
                            <label htmlFor="public-archive-search" className="sr-only">
                                Search approved papers
                            </label>
                            <input
                                id="public-archive-search"
                                type="text"
                                value={search}
                                aria-label="Search approved papers by title, author, or topic"
                                placeholder="Search for papers, authors, or topics..."
                                className="flex-1 border-0 bg-transparent py-2 text-sm text-slate-800 placeholder-slate-400 outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0"
                                onChange={(e) => {
                                    isLiveFilterEnabled.current = true;
                                    setSearch(e.target.value);
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        isLiveFilterEnabled.current = true;
                                    }}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <CloseOutlined style={{ fontSize: 13 }} />
                                </button>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => applyFilters()}
                            disabled={isFiltering}
                            className="ml-1.5 rounded-xl bg-[#0033a0] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:scale-95"
                        >
                            {isFiltering ? 'Searching...' : 'Search'}
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => setAdvancedOpen((v) => !v)}
                        className={`mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            hasAdvancedFilters
                                ? D
                                    ? 'bg-blue-500/30 text-blue-200 ring-1 ring-blue-400/40'
                                    : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                : D
                                  ? 'bg-white/10 text-blue-100 hover:bg-white/20'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        <ControlOutlined />
                        Advanced Search
                        {hasAdvancedFilters && (
                            <span className="rounded-full bg-blue-400 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                Active
                            </span>
                        )}
                        {advancedOpen ? (
                            <UpOutlined style={{ fontSize: 10 }} />
                        ) : (
                            <DownOutlined style={{ fontSize: 10 }} />
                        )}
                    </button>

                    {advancedOpen && (
                        <div
                            className={`mt-2 rounded-2xl border p-4 text-left shadow-2xl ${D ? 'bg-[#0d1526]/95 border-[#1e2d47]' : 'bg-white border-slate-200'} backdrop-blur-md`}
                        >
                            <Row gutter={[12, 12]}>
                                <Col xs={12} sm={6}>
                                    <label
                                        htmlFor="filter-year-from"
                                        className={`mb-1 block text-xs ${labelCls}`}
                                    >
                                        Year From
                                    </label>
                                    <Input
                                        id="filter-year-from"
                                        placeholder="2020"
                                        value={yearFrom}
                                        size="middle"
                                        onChange={(e) => {
                                            isLiveFilterEnabled.current = true;
                                            setYearFrom(e.target.value.replace(/\D/g, ''));
                                        }}
                                        onPressEnter={() => applyFilters()}
                                    />
                                </Col>
                                <Col xs={12} sm={6}>
                                    <label
                                        htmlFor="filter-year-to"
                                        className={`mb-1 block text-xs ${labelCls}`}
                                    >
                                        Year To
                                    </label>
                                    <Input
                                        id="filter-year-to"
                                        placeholder="2026"
                                        value={yearTo}
                                        size="middle"
                                        onChange={(e) => {
                                            isLiveFilterEnabled.current = true;
                                            setYearTo(e.target.value.replace(/\D/g, ''));
                                        }}
                                        onPressEnter={() => applyFilters()}
                                    />
                                </Col>
                                <Col xs={24} sm={12}>
                                    <label
                                        htmlFor="filter-school"
                                        className={`mb-1 block text-xs ${labelCls}`}
                                    >
                                        School
                                    </label>
                                    <Input
                                        id="filter-school"
                                        placeholder="School name"
                                        value={school}
                                        size="middle"
                                        onChange={(e) => {
                                            isLiveFilterEnabled.current = true;
                                            setSchool(e.target.value);
                                        }}
                                        onPressEnter={() => applyFilters()}
                                    />
                                </Col>
                                <Col xs={24} sm={12}>
                                    <label
                                        htmlFor="filter-institution"
                                        className={`mb-1 block text-xs ${labelCls}`}
                                    >
                                        Institution
                                    </label>
                                    <Select
                                        id="filter-institution"
                                        placeholder="All institutions"
                                        value={institutionId || undefined}
                                        allowClear
                                        showSearch
                                        optionFilterProp="label"
                                        options={institutionOptions}
                                        onChange={(v) => {
                                            isLiveFilterEnabled.current = true;
                                            setInstitutionId(v ?? '');
                                        }}
                                        style={{ width: '100%' }}
                                        size="middle"
                                    />
                                </Col>
                                <Col xs={24} sm={12}>
                                    <label
                                        htmlFor="filter-category"
                                        className={`mb-1 block text-xs ${labelCls}`}
                                    >
                                        Category
                                    </label>
                                    <Select
                                        id="filter-category"
                                        placeholder="All categories"
                                        value={category || undefined}
                                        allowClear
                                        options={categoryOptions}
                                        onChange={(v) => {
                                            isLiveFilterEnabled.current = true;
                                            setCategory(v ?? '');
                                        }}
                                        style={{ width: '100%' }}
                                        size="middle"
                                    />
                                </Col>
                                <Col xs={24} sm={12}>
                                    <label
                                        htmlFor="filter-discipline"
                                        className={`mb-1 block text-xs ${labelCls}`}
                                    >
                                        Discipline
                                    </label>
                                    <Select
                                        id="filter-discipline"
                                        placeholder="All disciplines"
                                        value={disciplineCode || undefined}
                                        allowClear
                                        showSearch
                                        optionFilterProp="label"
                                        options={disciplineOptions}
                                        onChange={(v) => {
                                            isLiveFilterEnabled.current = true;
                                            setDisciplineCode(v ?? '');
                                        }}
                                        style={{ width: '100%' }}
                                        size="middle"
                                    />
                                </Col>
                                <Col xs={24} sm={12}>
                                    <label
                                        htmlFor="filter-sort"
                                        className={`mb-1 block text-xs ${labelCls}`}
                                    >
                                        Sort By
                                    </label>
                                    <Select
                                        id="filter-sort"
                                        value={sort}
                                        options={[
                                            { value: 'recent', label: 'Recently approved' },
                                            { value: 'oldest', label: 'Oldest approved' },
                                            { value: 'year_desc', label: 'Year: newest first' },
                                            { value: 'year_asc', label: 'Year: oldest first' },
                                            { value: 'title_asc', label: 'Title: A → Z' },
                                            { value: 'title_desc', label: 'Title: Z → A' },
                                        ]}
                                        onChange={(v) => {
                                            isLiveFilterEnabled.current = true;
                                            setSort(v);
                                        }}
                                        style={{ width: '100%' }}
                                        size="middle"
                                    />
                                </Col>
                            </Row>
                            <div className="mt-3 flex justify-end gap-2 border-t border-slate-100/10 pt-3">
                                <button
                                    type="button"
                                    onClick={clearAll}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${D ? 'text-slate-400 hover:text-blue-100' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                    )}

                    <div
                        className={`mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm ${D ? 'text-slate-300' : 'text-slate-500'}`}
                    >
                        <span className="font-medium">Popular:</span>
                        {popularDisciplines.map((item) => (
                            <button
                                key={item.code}
                                type="button"
                                onClick={() => {
                                    isLiveFilterEnabled.current = true;
                                    setDisciplineCode(item.code);
                                    runIndexRequest({
                                        search,
                                        year_from: yearFrom,
                                        year_to: yearTo,
                                        school,
                                        institution_id: institutionId,
                                        category,
                                        discipline_code: item.code,
                                        sort,
                                        page: 1,
                                    });
                                }}
                                title={`${item.total} approved papers`}
                                className={`transition-colors ${D ? 'hover:text-blue-200' : 'hover:text-blue-600'} hover:underline`}
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
