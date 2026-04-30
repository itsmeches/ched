import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button, Card, Col, Input, Row, Select, Space, Statistic, Table, Tag, Typography } from 'antd';
import { BookOutlined, FileSearchOutlined, FilterOutlined, ReadOutlined, SearchOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function PublicResearchIndex({ proposals, filters, institutions = [], categories = [], disciplines = [], canLogin, canRegister }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [yearFrom, setYearFrom] = useState(filters.year_from ?? '');
    const [yearTo, setYearTo] = useState(filters.year_to ?? '');
    const [school, setSchool] = useState(filters.school ?? '');
    const [institutionId, setInstitutionId] = useState(filters.institution_id ?? '');
    const [category, setCategory] = useState(filters.category ?? '');
    const [disciplineCode, setDisciplineCode] = useState(filters.discipline_code ?? '');
    const [sort, setSort] = useState(filters.sort ?? 'recent');
    const hasActiveFilters = Boolean(search || yearFrom || yearTo || school || institutionId || category || disciplineCode || (sort && sort !== 'recent'));
    const isLiveFilterEnabled = useRef(false);

    const institutionOptions = useMemo(
        () => institutions.map((institution) => ({ value: institution.id, label: institution.name })),
        [institutions],
    );

    const categoryOptions = useMemo(
        () => categories.map((item) => ({ value: item.value, label: item.label })),
        [categories],
    );

    const categoryLabelMap = useMemo(
        () => Object.fromEntries(categories.map((item) => [item.value, item.label])),
        [categories],
    );

    const disciplineOptions = useMemo(
        () => disciplines.map((item) => ({ value: item.code, label: item.name })),
        [disciplines],
    );

    const disciplineLabelMap = useMemo(
        () => Object.fromEntries(disciplines.map((item) => [item.code, item.name])),
        [disciplines],
    );

    const selectedInstitutionLabel = useMemo(() => {
        const selected = institutions.find((institution) => String(institution.id) === String(institutionId));
        return selected?.name ?? '';
    }, [institutions, institutionId]);

    const selectedCategoryLabel = useMemo(() => {
        const selected = categories.find((item) => item.value === category);
        return selected?.label ?? '';
    }, [categories, category]);

    const selectedDisciplineLabel = useMemo(() => {
        const selected = disciplines.find((item) => item.code === disciplineCode);
        return selected?.name ?? '';
    }, [disciplines, disciplineCode]);

    const sortLabelMap = {
        recent: 'Recently approved',
        oldest: 'Oldest approved',
        year_desc: 'Year: newest first',
        year_asc: 'Year: oldest first',
        title_asc: 'Title: A to Z',
        title_desc: 'Title: Z to A',
    };

    function formatDisciplineLabel(value) {
        if (!value) return '';
        const normalized = disciplineLabelMap[value] ?? value;
        return String(normalized).replace(/^\s*\d+\s*-\s*/, '');
    }

    const columns = useMemo(() => [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (value, row) => (
                <Space direction="vertical" size={2} style={{ width: '100%' }}>
                    <Link href={route('research.public.show', row.id)} style={{ fontWeight: 600 }}>
                        {value}
                    </Link>
                    <Space size={[6, 6]} wrap>
                        {(row.research_category || row.category) && <Tag color="geekblue">{categoryLabelMap[row.research_category ?? row.category] ?? row.research_category ?? row.category}</Tag>}
                        {row.discipline_label && <Tag color="cyan">{formatDisciplineLabel(row.discipline_label)}</Tag>}
                    </Space>
                    {row.keywords && (
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            {row.keywords}
                        </Typography.Text>
                    )}
                </Space>
            ),
        },
        {
            title: 'Authors',
            dataIndex: 'authors',
            key: 'authors',
        },
        {
            title: 'Category',
            key: 'category',
            render: (_, row) => {
                const raw = row.research_category || row.category;
                return raw ? (categoryLabelMap[raw] ?? raw) : '—';
            },
        },
        {
            title: 'Discipline',
            dataIndex: 'discipline_label',
            key: 'discipline_label',
            render: (value) => {
                if (!value) return '—';
                return formatDisciplineLabel(value);
            },
        },
        {
            title: 'School',
            dataIndex: 'school',
            key: 'school',
            render: (value, row) => (
                <Space direction="vertical" size={0} style={{ width: '100%' }}>
                    <Typography.Text>{value}</Typography.Text>
                    {row.institution?.name && (
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            {row.institution.name}
                        </Typography.Text>
                    )}
                </Space>
            ),
        },
        {
            title: 'Year',
            dataIndex: 'year',
            key: 'year',
            width: 100,
        },
        {
            title: 'Action',
            key: 'action',
            align: 'right',
            render: (_, row) => (
                <Link href={route('research.public.show', row.id)}>
                    <Button type="link" icon={<ReadOutlined />} style={{ paddingInline: 0 }}>
                        Open
                    </Button>
                </Link>
            ),
        },
    ], [categoryLabelMap, disciplineLabelMap]);

    function applyFilters(page = 1) {
        router.get(route('research.public.index'), {
            search,
            year_from: yearFrom,
            year_to: yearTo,
            school,
            institution_id: institutionId,
            category,
            discipline_code: disciplineCode,
            sort,
            page,
        }, { preserveState: true, replace: true });
    }

    useEffect(() => {
        if (!isLiveFilterEnabled.current) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            applyFilters(1);
        }, 450);

        return () => window.clearTimeout(timeoutId);
    }, [search, yearFrom, yearTo, school, institutionId, category, disciplineCode, sort]);

    return (
        <>
            <Head title="CRIS - CALABARZON Research Information System">
                <meta
                    head-key="description"
                    name="description"
                    content="Search approved research papers in CRIS, the CALABARZON Research Information System public archive for Region IV-A institutions."
                />
            </Head>

            <div
                style={{
                    minHeight: '100vh',
                    background:
                        'radial-gradient(circle at 0% 0%, rgba(0, 51, 160, 0.10), transparent 28%), radial-gradient(circle at 100% 0%, rgba(217, 119, 6, 0.14), transparent 30%), linear-gradient(180deg, #f8fafc 0%, #eef4f9 100%)',
                }}
            >
                <div className="mx-auto max-w-7xl px-4 pb-6 pt-3 sm:px-6 lg:px-8">
                    <header style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <div>
                                <Space size={10} align="center" style={{ marginBottom: 2 }}>
                                    <img src="/cris-mark.svg" alt="CRIS" style={{ width: 38, height: 38, borderRadius: 10 }} />
                                    <Typography.Title level={4} style={{ margin: 0, color: '#0f172a' }}>
                                        CALABARZON Research Information System
                                    </Typography.Title>
                                </Space>
                                <Typography.Paragraph style={{ color: '#475569', margin: '4px 0 0', display: 'block' }}>
                                    Public catalog of approved research papers for Region IV-A institutions.
                                </Typography.Paragraph>
                            </div>
                            <Space style={{ marginLeft: 'auto' }}>
                                {auth?.user ? (
                                    <Link href={route('dashboard')}>
                                        <Button type="primary">Dashboard</Button>
                                    </Link>
                                ) : (
                                    <>
                                        {canLogin && (
                                            <Link href={route('login')}>
                                                <Button>Log in</Button>
                                            </Link>
                                        )}
                                        {canRegister && (
                                            <Link href={route('register')}>
                                                <Button type="primary">Register</Button>
                                            </Link>
                                        )}
                                    </>
                                )}
                            </Space>
                        </div>
                    </header>

                    <Card
                        bordered={false}
                        className="admin-dashboard-hero"
                        style={{ marginBottom: 12, borderRadius: 14 }}
                        bodyStyle={{ padding: 16 }}
                    >
                        <Row gutter={[12, 12]} align="middle" justify="space-between">
                            <Col xs={24} lg={17}>
                                <Typography.Title level={3} style={{ margin: 0, color: '#ffffff' }}>
                                    Explore Approved Research Papers
                                </Typography.Title>
                                <Typography.Paragraph style={{ marginTop: 6, marginBottom: 8, color: 'rgba(255,255,255,0.9)' }}>
                                    Search by title, author, keyword, school, or institution and narrow results with year range and sort options.
                                </Typography.Paragraph>
                                <Space.Compact style={{ width: '100%' }}>
                                    <Input
                                        size="middle"
                                        placeholder="Try: digital education, climate adaptation, public health"
                                        value={search}
                                        prefix={<SearchOutlined />}
                                        onChange={(event) => {
                                            isLiveFilterEnabled.current = true;
                                            setSearch(event.target.value);
                                        }}
                                        onPressEnter={() => applyFilters()}
                                    />
                                    <Button size="middle" type="primary" onClick={() => applyFilters()}>
                                        Search
                                    </Button>
                                </Space.Compact>
                            </Col>
                            <Col xs={24} lg={7}>
                                <Row gutter={[8, 8]}>
                                    <Col xs={12} lg={12}>
                                        <Card bordered={false} bodyStyle={{ padding: '10px 12px' }} style={{ borderRadius: 12, background: 'rgba(255,255,255,0.12)' }}>
                                            <Statistic title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Approved papers</span>} value={proposals.total} prefix={<BookOutlined style={{ color: '#ffffff' }} />} valueStyle={{ color: '#ffffff' }} />
                                        </Card>
                                    </Col>
                                    <Col xs={12} lg={12}>
                                        <Card bordered={false} bodyStyle={{ padding: '10px 12px' }} style={{ borderRadius: 12, background: 'rgba(255,255,255,0.12)' }}>
                                            <Statistic title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Current results</span>} value={proposals.data.length} prefix={<FileSearchOutlined style={{ color: '#ffffff' }} />} valueStyle={{ color: '#ffffff' }} />
                                        </Card>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Card>

                    <Card
                        bordered={false}
                        className="admin-dashboard-shell"
                        style={{ marginBottom: 10, borderRadius: 14 }}
                        bodyStyle={{ padding: 14 }}
                        title={
                            <Space>
                                <FilterOutlined style={{ color: '#0033a0' }} />
                                <Typography.Text strong style={{ color: '#0033a0' }}>Refine Results</Typography.Text>
                            </Space>
                        }
                    >
                        <Row gutter={[12, 8]}>
                            <Col xs={12} sm={8} lg={5}>
                                <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Year From</Typography.Text>
                                <Input
                                    placeholder="e.g. 2020"
                                    value={yearFrom}
                                    onChange={(event) => {
                                        isLiveFilterEnabled.current = true;
                                        setYearFrom(event.target.value.replace(/\D/g, ''));
                                    }}
                                    onPressEnter={() => applyFilters()}
                                />
                            </Col>
                            <Col xs={12} sm={8} lg={5}>
                                <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Year To</Typography.Text>
                                <Input
                                    placeholder="e.g. 2024"
                                    value={yearTo}
                                    onChange={(event) => {
                                        isLiveFilterEnabled.current = true;
                                        setYearTo(event.target.value.replace(/\D/g, ''));
                                    }}
                                    onPressEnter={() => applyFilters()}
                                />
                            </Col>
                            <Col xs={24} sm={8} lg={7}>
                                <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>School</Typography.Text>
                                <Input
                                    placeholder="School name"
                                    value={school}
                                    onChange={(event) => {
                                        isLiveFilterEnabled.current = true;
                                        setSchool(event.target.value);
                                    }}
                                    onPressEnter={() => applyFilters()}
                                />
                            </Col>
                            <Col xs={24} sm={8} lg={7}>
                                <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Sort By</Typography.Text>
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
                                    onChange={(value) => {
                                        isLiveFilterEnabled.current = true;
                                        setSort(value);
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col xs={24} sm={12} lg={8}>
                                <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Institution</Typography.Text>
                                <Select
                                    placeholder="All institutions"
                                    value={institutionId || undefined}
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    options={institutionOptions}
                                    onChange={(value) => {
                                        isLiveFilterEnabled.current = true;
                                        setInstitutionId(value ?? '');
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col xs={24} sm={12} lg={8}>
                                <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Category</Typography.Text>
                                <Select
                                    placeholder="All categories"
                                    value={category || undefined}
                                    allowClear
                                    options={categoryOptions}
                                    onChange={(value) => {
                                        isLiveFilterEnabled.current = true;
                                        setCategory(value ?? '');
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col xs={24} sm={12} lg={8}>
                                <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Discipline</Typography.Text>
                                <Select
                                    placeholder="All disciplines"
                                    value={disciplineCode || undefined}
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
                        </Row>

                        {hasActiveFilters && (
                            <Space size={[6, 6]} wrap style={{ marginTop: 8 }}>
                                <Typography.Text type="secondary" style={{ fontSize: 12 }}>Active:</Typography.Text>
                                {search && <Tag color="blue">Query: {search}</Tag>}
                                {yearFrom && <Tag color="gold">From: {yearFrom}</Tag>}
                                {yearTo && <Tag color="gold">To: {yearTo}</Tag>}
                                {school && <Tag color="geekblue">School: {school}</Tag>}
                                {institutionId && selectedInstitutionLabel && <Tag color="cyan">Institution: {selectedInstitutionLabel}</Tag>}
                                {category && selectedCategoryLabel && <Tag color="geekblue">Category: {selectedCategoryLabel}</Tag>}
                                {disciplineCode && selectedDisciplineLabel && <Tag color="cyan">Discipline: {selectedDisciplineLabel}</Tag>}
                                {sort && sort !== 'recent' && <Tag color="purple">Sort: {sortLabelMap[sort] ?? sort}</Tag>}
                            </Space>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
                            <Button onClick={() => {
                                setSearch('');
                                setYearFrom('');
                                setYearTo('');
                                setSchool('');
                                setInstitutionId('');
                                setCategory('');
                                setDisciplineCode('');
                                setSort('recent');
                                router.get(route('research.public.index'), {}, { replace: true });
                            }}>
                                Clear
                            </Button>
                            <Button type="primary" style={{ background: '#0033a0', borderColor: '#0033a0' }} onClick={() => applyFilters()}>
                                Apply Filters
                            </Button>
                        </div>
                    </Card>

                    <Card
                        bordered={false}
                        className="admin-dashboard-shell"
                        style={{
                            borderRadius: 16,
                            border: '1px solid #dbe7ff',
                            boxShadow: '0 10px 28px rgba(0, 51, 160, 0.08)',
                            background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
                        }}
                        bodyStyle={{ padding: 14 }}
                    >
                        <Table
                            rowKey="id"
                            columns={columns}
                            dataSource={proposals.data}
                            size="middle"
                            title={() => (
                                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                                    <Space size={10}>
                                        <div style={{ width: 8, height: 28, borderRadius: 999, background: '#0033a0' }} />
                                        <Typography.Title level={5} style={{ margin: 0, color: '#0f172a' }}>
                                            Approved Research Archive
                                        </Typography.Title>
                                    </Space>
                                    <Typography.Text type="secondary">
                                        Page {proposals.current_page} of {proposals.last_page || 1}
                                    </Typography.Text>
                                </Space>
                            )}
                            onRow={(_, index) => ({
                                style: { background: index % 2 === 0 ? '#ffffff' : '#fbfdff' },
                            })}
                            pagination={{
                                current: proposals.current_page,
                                pageSize: proposals.per_page,
                                total: proposals.total,
                                onChange: (page) => applyFilters(page),
                            }}
                            locale={{ emptyText: 'No approved papers found for this search.' }}
                            scroll={{ x: 900 }}
                        />
                    </Card>

                    <Typography.Paragraph style={{ textAlign: 'center', color: '#64748b', marginTop: 16, marginBottom: 0 }}>
                        CRIS is the official public-facing archive for approved CALABARZON research submissions.
                    </Typography.Paragraph>
                </div>
            </div>
        </>
    );
}
