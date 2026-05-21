import { Head, Link, router } from '@inertiajs/react';
import { Button, Card, Col, Input, Pagination, Row, Select, Space, Tag, Typography } from 'antd';
import {
    ArrowLeftOutlined,
    BankOutlined,
    CalendarOutlined,
    ControlOutlined,
    DownOutlined,
    EnvironmentOutlined,
    MailOutlined,
    PhoneOutlined,
    UpOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@/utils/ThemeContext';
import PublicSectionCard from '@/Components/Public/PublicSectionCard';
import PublicNav from '@/Components/Public/PublicNav';
import EmptyState from '@/Components/EmptyState';
import { StatusBadge } from '@/Components/StatusBadge';

export default function PublicInstitution({
    institution,
    papers,
    stats,
    filters = {},
    categories = [],
    disciplines = [],
    years = [],
    canLogin,
    canRegister,
}) {
    const { dark } = useTheme();
    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
    const [category, setCategory] = useState(filters.category ?? '');
    const [disciplineCode, setDisciplineCode] = useState(filters.discipline_code ?? '');
    const [year, setYear] = useState(filters.year ? String(filters.year) : '');
    const [tag, setTag] = useState(filters.tag ?? '');
    const [advancedOpen, setAdvancedOpen] = useState(
        Boolean(
            filters.search ||
            filters.category ||
            filters.discipline_code ||
            filters.year ||
            filters.tag
        )
    );
    const isLiveFilterEnabled = useRef(false);
    const liveDebounceTimeoutRef = useRef(null);

    const categoryOptions = useMemo(
        () => categories.map((item) => ({ value: item.value, label: item.label })),
        [categories]
    );
    const categoryLabelMap = useMemo(
        () => Object.fromEntries(categories.map((item) => [item.value, item.label])),
        [categories]
    );
    const disciplineOptions = useMemo(
        () => disciplines.map((item) => ({ value: item.code, label: item.name })),
        [disciplines]
    );
    const disciplineLabelMap = useMemo(
        () => Object.fromEntries(disciplines.map((item) => [item.code, item.name])),
        [disciplines]
    );
    const yearOptions = useMemo(
        () => years.map((item) => ({ value: String(item), label: String(item) })),
        [years]
    );

    const hasActiveFilters = Boolean(searchTerm || category || disciplineCode || year || tag);
    const visibleCount = Array.isArray(papers?.data) ? papers.data.length : 0;
    const resultStart =
        papers?.from ??
        (visibleCount > 0 ? ((papers?.current_page || 1) - 1) * (papers?.per_page || 0) + 1 : 0);
    const resultEnd = papers?.to ?? (visibleCount > 0 ? resultStart + visibleCount - 1 : 0);
    const [countFlash, setCountFlash] = useState(false);

    useEffect(() => {
        setCountFlash(true);
        const timeoutId = window.setTimeout(() => setCountFlash(false), 420);
        return () => window.clearTimeout(timeoutId);
    }, [papers.total, papers.current_page, papers.from, papers.to, hasActiveFilters]);

    useEffect(() => {
        if (!isLiveFilterEnabled.current) {
            return undefined;
        }

        if (liveDebounceTimeoutRef.current) {
            window.clearTimeout(liveDebounceTimeoutRef.current);
        }

        liveDebounceTimeoutRef.current = window.setTimeout(() => {
            runInstitutionFilters({ searchTerm, category, disciplineCode, year, tag }, 1);
        }, 375);

        return () => {
            if (liveDebounceTimeoutRef.current) {
                window.clearTimeout(liveDebounceTimeoutRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, category, disciplineCode, year, tag]);

    function runInstitutionFilters(nextState, page = 1) {
        const payload = {
            search: String(nextState.searchTerm || '').trim(),
            category: String(nextState.category || '').trim(),
            discipline_code: String(nextState.disciplineCode || '').trim(),
            year: String(nextState.year || '').trim(),
            tag: String(nextState.tag || '').trim(),
            page,
        };

        Object.keys(payload).forEach((key) => {
            if (payload[key] === '') {
                delete payload[key];
            }
        });

        router.get(route('research.public.institution', institution.id), payload, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }

    function applyInstitutionFilters(page = 1) {
        if (liveDebounceTimeoutRef.current) {
            window.clearTimeout(liveDebounceTimeoutRef.current);
        }
        runInstitutionFilters({ searchTerm, category, disciplineCode, year, tag }, page);
    }

    function removeSingleFilter(key) {
        isLiveFilterEnabled.current = true;

        if (key === 'search') {
            setSearchTerm('');
        } else if (key === 'category') {
            setCategory('');
        } else if (key === 'discipline') {
            setDisciplineCode('');
        } else if (key === 'year') {
            setYear('');
        } else if (key === 'tag') {
            setTag('');
        }
    }

    function clearFilters() {
        isLiveFilterEnabled.current = true;
        setSearchTerm('');
        setCategory('');
        setDisciplineCode('');
        setYear('');
        setTag('');
    }

    return (
        <>
            <Head title={`${institution.name} — CRIS`} />

            <div
                className={`min-h-screen transition-colors duration-300 ${dark ? 'bg-[#0a0f1e]' : ''}`}
                style={
                    dark
                        ? undefined
                        : {
                              background:
                                  'radial-gradient(circle at 0% 0%, rgba(14, 116, 144, 0.18), transparent 28%), radial-gradient(circle at 100% 0%, rgba(217, 119, 6, 0.16), transparent 30%), linear-gradient(180deg, #f8fbfd 0%, #edf4f7 100%)',
                          }
                }
            >
                <PublicNav canLogin={canLogin} canRegister={canRegister} />

                <div className="mx-auto max-w-5xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
                    <div style={{ marginBottom: 8 }}>
                        <Link href={route('research.public.index')}>
                            <Button size="small" icon={<ArrowLeftOutlined />}>
                                Back to Archive
                            </Button>
                        </Link>
                    </div>

                    <Card
                        className="admin-dashboard-shell"
                        bordered={false}
                        style={{ borderRadius: 14, boxShadow: '0 7px 20px rgba(0, 51, 160, 0.08)' }}
                        styles={{ body: { padding: 20 } }}
                    >
                        <div className="space-y-5">
                            <div
                                className={`rounded-2xl border p-4 ${dark ? 'border-[#1e2d47] bg-[#0d1526]' : 'border-slate-200 bg-white'}`}
                            >
                                <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
                                    <div className="min-w-0 lg:col-span-2">
                                        <Space wrap size={[8, 8]} style={{ marginBottom: 10 }}>
                                            <Tag
                                                style={{
                                                    borderRadius: 999,
                                                    paddingInline: 12,
                                                    paddingBlock: 4,
                                                    backgroundColor: '#0033a0',
                                                    color: '#fff',
                                                    border: 'none',
                                                    marginInlineEnd: 0,
                                                }}
                                            >
                                                Institution Profile
                                            </Tag>
                                            {institution.code && (
                                                <Tag color="blue">{institution.code}</Tag>
                                            )}
                                        </Space>
                                        <Typography.Title
                                            level={2}
                                            className="!mb-1 dark:!text-slate-100"
                                        >
                                            {institution.name}
                                        </Typography.Title>
                                        <Typography.Paragraph
                                            className="!mb-0 dark:!text-slate-400"
                                            style={{ color: '#475569', maxWidth: 760 }}
                                        >
                                            Approved research outputs, publication trends, and
                                            discovery links for this institution in the CRIS public
                                            archive.
                                        </Typography.Paragraph>

                                        {stats.top_categories?.length > 0 && (
                                            <div className="mt-4">
                                                <Typography.Text
                                                    type="secondary"
                                                    style={{
                                                        display: 'block',
                                                        fontSize: 12,
                                                        marginBottom: 8,
                                                    }}
                                                >
                                                    Top Research Categories
                                                </Typography.Text>
                                                <div className="flex flex-wrap gap-2">
                                                    {stats.top_categories.map((item) => (
                                                        <span
                                                            key={item.label}
                                                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${dark ? 'border-blue-800/60 bg-blue-950/35 text-blue-100' : 'border-blue-200 bg-blue-50 text-blue-700'}`}
                                                        >
                                                            {item.label} ({item.total})
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {(institution.contact_email || institution.contact_phone) && (
                                        <div
                                            className={`self-start rounded-2xl border px-4 py-3 text-sm ${dark ? 'border-[#2a3a5c] bg-[#111827] text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
                                        >
                                            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                Get in Touch
                                            </div>
                                            {institution.contact_email && (
                                                <div className="mb-1 flex items-center gap-2 break-all">
                                                    <MailOutlined className="text-slate-400" />
                                                    <span>{institution.contact_email}</span>
                                                </div>
                                            )}
                                            {institution.contact_phone && (
                                                <div className="flex items-center gap-2">
                                                    <PhoneOutlined className="text-slate-400" />
                                                    <span>{institution.contact_phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <div
                                    className={`rounded-2xl border px-4 py-3 ${dark ? 'border-blue-900/40 bg-blue-950/20' : 'border-blue-200/80 bg-blue-50/70'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Approved Papers
                                        </div>
                                        <BankOutlined className="text-slate-400" />
                                    </div>
                                    <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        {stats.approved_count}
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-[#1e2d47] dark:bg-[#111827]">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Latest Year
                                        </div>
                                        <CalendarOutlined className="text-slate-400" />
                                    </div>
                                    <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        {stats.latest_year || '—'}
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-[#1e2d47] dark:bg-[#111827]">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Address
                                        </div>
                                        <EnvironmentOutlined className="text-slate-400" />
                                    </div>
                                    <div className="mt-1 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-200">
                                        {institution.address || 'Not provided'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <PublicSectionCard
                        className="mt-6"
                        title="Published Research"
                        subtitle="Search approved papers by title, type, discipline, tags, and year."
                        extra={
                            <Tag color="geekblue" style={{ marginInlineEnd: 0 }}>
                                {papers.total} total
                            </Tag>
                        }
                    >
                        <div className="mb-4">
                            <button
                                type="button"
                                onClick={() => setAdvancedOpen((value) => !value)}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                    hasActiveFilters
                                        ? dark
                                            ? 'bg-blue-500/30 text-blue-200 ring-1 ring-blue-400/40'
                                            : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                        : dark
                                          ? 'bg-white/10 text-blue-100 hover:bg-white/20'
                                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                <ControlOutlined />
                                Advanced Search
                                {advancedOpen ? (
                                    <UpOutlined style={{ fontSize: 10 }} />
                                ) : (
                                    <DownOutlined style={{ fontSize: 10 }} />
                                )}
                            </button>

                            {advancedOpen && (
                                <div
                                    className={`mt-2 rounded-2xl border p-4 ${dark ? 'border-[#1e2d47] bg-[#0d1526]' : 'border-slate-200 bg-slate-50'}`}
                                >
                                    <Row gutter={[12, 12]}>
                                        <Col xs={24} md={12}>
                                            <label
                                                htmlFor="inst-search"
                                                className="mb-1 block text-xs text-slate-500 dark:text-slate-400"
                                            >
                                                Search Research
                                            </label>
                                            <Input
                                                id="inst-search"
                                                placeholder="Title, author, school, or keyword"
                                                value={searchTerm}
                                                onChange={(event) => {
                                                    isLiveFilterEnabled.current = true;
                                                    setSearchTerm(event.target.value);
                                                }}
                                                onPressEnter={() => applyInstitutionFilters(1)}
                                            />
                                        </Col>
                                        <Col xs={24} md={6}>
                                            <label
                                                htmlFor="inst-category"
                                                className="mb-1 block text-xs text-slate-500 dark:text-slate-400"
                                            >
                                                Type of Research
                                            </label>
                                            <Select
                                                id="inst-category"
                                                value={category || undefined}
                                                placeholder="All types"
                                                allowClear
                                                options={categoryOptions}
                                                onChange={(value) => {
                                                    isLiveFilterEnabled.current = true;
                                                    setCategory(value ?? '');
                                                }}
                                                style={{ width: '100%' }}
                                            />
                                        </Col>
                                        <Col xs={24} md={6}>
                                            <label
                                                htmlFor="inst-discipline"
                                                className="mb-1 block text-xs text-slate-500 dark:text-slate-400"
                                            >
                                                Discipline
                                            </label>
                                            <Select
                                                id="inst-discipline"
                                                value={disciplineCode || undefined}
                                                placeholder="All disciplines"
                                                allowClear
                                                showSearch
                                                optionFilterProp="label"
                                                options={disciplineOptions}
                                                onChange={(value) => {
                                                    isLiveFilterEnabled.current = true;
                                                    setDisciplineCode(value ?? '');
                                                }}
                                                style={{ width: '100%' }}
                                            />
                                        </Col>
                                        <Col xs={24} md={6}>
                                            <label
                                                htmlFor="inst-year"
                                                className="mb-1 block text-xs text-slate-500 dark:text-slate-400"
                                            >
                                                Year
                                            </label>
                                            <Select
                                                id="inst-year"
                                                value={year || undefined}
                                                placeholder="All years"
                                                allowClear
                                                options={yearOptions}
                                                onChange={(value) => {
                                                    isLiveFilterEnabled.current = true;
                                                    setYear(value ?? '');
                                                }}
                                                style={{ width: '100%' }}
                                            />
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <label
                                                htmlFor="inst-tag"
                                                className="mb-1 block text-xs text-slate-500 dark:text-slate-400"
                                            >
                                                Tags
                                            </label>
                                            <Input
                                                id="inst-tag"
                                                placeholder="Enter a keyword tag"
                                                value={tag}
                                                onChange={(event) => {
                                                    isLiveFilterEnabled.current = true;
                                                    setTag(event.target.value);
                                                }}
                                                onPressEnter={() => applyInstitutionFilters(1)}
                                            />
                                        </Col>
                                        <Col xs={24}>
                                            <div className="flex justify-end">
                                                <Space>
                                                    <Button
                                                        onClick={clearFilters}
                                                        disabled={!hasActiveFilters}
                                                    >
                                                        Clear All
                                                    </Button>
                                                </Space>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            {hasActiveFilters && (
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    {searchTerm && (
                                        <Tag
                                            closable
                                            color="blue"
                                            onClose={() => removeSingleFilter('search')}
                                        >
                                            Search: {searchTerm}
                                        </Tag>
                                    )}
                                    {category && (
                                        <Tag
                                            closable
                                            color="geekblue"
                                            onClose={() => removeSingleFilter('category')}
                                        >
                                            Type: {categoryLabelMap[category] || category}
                                        </Tag>
                                    )}
                                    {disciplineCode && (
                                        <Tag
                                            closable
                                            color="cyan"
                                            onClose={() => removeSingleFilter('discipline')}
                                        >
                                            Discipline:{' '}
                                            {disciplineLabelMap[disciplineCode] || disciplineCode}
                                        </Tag>
                                    )}
                                    {year && (
                                        <Tag
                                            closable
                                            color="gold"
                                            onClose={() => removeSingleFilter('year')}
                                        >
                                            Year: {year}
                                        </Tag>
                                    )}
                                    {tag && (
                                        <Tag
                                            closable
                                            color="purple"
                                            onClose={() => removeSingleFilter('tag')}
                                        >
                                            Tag: {tag}
                                        </Tag>
                                    )}
                                </div>
                            )}

                            <div
                                className={`mt-2 text-xs transition-all duration-300 ${countFlash ? 'translate-y-[-1px] font-medium text-blue-700 dark:text-blue-200' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                {papers.total > 0
                                    ? `Showing ${resultStart}-${resultEnd} of ${papers.total} ${hasActiveFilters ? 'filtered papers' : 'papers'}`
                                    : `Showing 0 of 0 ${hasActiveFilters ? 'filtered papers' : 'papers'}`}
                            </div>
                        </div>

                        {papers.data.length === 0 ? (
                            <EmptyState
                                title="No published research yet"
                                description={
                                    hasActiveFilters
                                        ? 'No results matched your institution filters. Try broadening your search.'
                                        : 'This institution does not have approved papers in the archive yet.'
                                }
                                action={
                                    <Link href={route('research.public.index')}>
                                        <Button type="primary" size="small">
                                            Browse Archive
                                        </Button>
                                    </Link>
                                }
                            />
                        ) : (
                            <div className="space-y-3">
                                {papers.data.map((paper) => {
                                    const disciplineText = paper.discipline_code
                                        ? disciplineLabelMap[paper.discipline_code] ||
                                          paper.discipline_code
                                        : null;
                                    const paperTags = String(paper.keywords || '')
                                        .split(',')
                                        .map((item) => item.trim())
                                        .filter((item) => item.length > 0)
                                        .slice(0, 6);
                                    const abstractSnippet = paper.abstract
                                        ? paper.abstract.length > 240
                                            ? `${paper.abstract.slice(0, 240)}...`
                                            : paper.abstract
                                        : null;

                                    return (
                                        <Card
                                            key={paper.id}
                                            className="admin-dashboard-shell border border-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-[#1e2d47]"
                                            bordered={false}
                                            styles={{ body: { padding: 18 } }}
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <Link
                                                        href={route(
                                                            'research.public.show',
                                                            paper.id
                                                        )}
                                                        className="block text-base font-semibold text-[#0b3ea9] hover:text-[#001f66] hover:underline dark:text-blue-300 dark:hover:text-blue-100 dark:hover:underline"
                                                    >
                                                        {paper.title}
                                                    </Link>
                                                    <div className="text-sm text-slate-600 dark:text-slate-300">
                                                        {paper.authors || 'Unknown author'}
                                                        {paper.school && <> · {paper.school}</>}
                                                        {paper.year && <> · {paper.year}</>}
                                                    </div>
                                                    {disciplineText && (
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                                            <span className="font-medium">
                                                                Discipline:
                                                            </span>{' '}
                                                            {disciplineText}
                                                        </div>
                                                    )}
                                                    <Space wrap size={[6, 6]}>
                                                        {(paper.research_category ||
                                                            paper.category) && (
                                                            <Tag color="geekblue">
                                                                {paper.research_category ||
                                                                    paper.category}
                                                            </Tag>
                                                        )}
                                                        {paperTags.map((item) => (
                                                            <Tag
                                                                key={`${paper.id}-tag-${item}`}
                                                                color="cyan"
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => {
                                                                    isLiveFilterEnabled.current = true;
                                                                    setAdvancedOpen(true);
                                                                    setTag(item);
                                                                }}
                                                            >
                                                                #{item}
                                                            </Tag>
                                                        ))}
                                                        <StatusBadge
                                                            status={paper.status || 'approved'}
                                                        />
                                                    </Space>
                                                    <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                                        <span className="font-medium text-slate-700 dark:text-slate-200">
                                                            Abstract:
                                                        </span>{' '}
                                                        {abstractSnippet || 'No abstract provided.'}
                                                    </div>
                                                </div>
                                                <Link
                                                    href={route('research.public.show', paper.id)}
                                                >
                                                    <Button type="primary">Open Paper</Button>
                                                </Link>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </PublicSectionCard>

                    {papers.last_page > 1 && (
                        <div className="mt-8 flex justify-center">
                            <Pagination
                                current={papers.current_page}
                                pageSize={papers.per_page}
                                total={papers.total}
                                onChange={(page) => applyInstitutionFilters(page)}
                                showSizeChanger={false}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
