import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button, Card, Col, Input, Row, Space, Statistic, Table, Tag, Typography } from 'antd';
import { BookOutlined, FileSearchOutlined, ReadOutlined, SearchOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';

export default function PublicResearchIndex({ proposals, filters, canLogin, canRegister }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [year, setYear] = useState(filters.year ?? '');
    const [school, setSchool] = useState(filters.school ?? '');
    const hasActiveFilters = Boolean(search || year || school);

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
    ], []);

    function applyFilters(page = 1) {
        router.get(route('research.public.index'), { search, year, school, page }, { preserveState: true, replace: true });
    }

    return (
        <>
            <Head title="CRIS - Calabarzon Research Information System" />

            <div
                style={{
                    minHeight: '100vh',
                    background:
                        'radial-gradient(circle at 0% 0%, rgba(14, 116, 144, 0.18), transparent 28%), radial-gradient(circle at 100% 0%, rgba(217, 119, 6, 0.16), transparent 30%), linear-gradient(180deg, #f8fbfd 0%, #edf4f7 100%)',
                }}
            >
                <div className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
                    <header style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <div>
                                <Space size={10} align="center" style={{ marginBottom: 2 }}>
                                    <Tag color="cyan" style={{ borderRadius: 999, fontWeight: 700, marginInlineEnd: 0 }}>
                                        CRIS
                                    </Tag>
                                    <Typography.Title level={4} style={{ margin: 0, color: '#0f172a' }}>
                                        Calabarzon Research Information System
                                    </Typography.Title>
                                </Space>
                                <Typography.Paragraph style={{ color: '#475569', margin: '4px 0 0', display: 'block' }}>
                                    Public catalog of approved research papers for Region IV-A institutions.
                                </Typography.Paragraph>
                            </div>
                            <Space>
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
                        style={{ marginBottom: 18, borderRadius: 16 }}
                    >
                        <Row gutter={[20, 20]} align="middle" justify="space-between">
                            <Col xs={24} lg={15}>
                                <Typography.Title level={2} style={{ margin: 0, color: '#ffffff' }}>
                                    Explore Approved Research Papers
                                </Typography.Title>
                                <Typography.Paragraph style={{ marginTop: 10, marginBottom: 16, color: 'rgba(255,255,255,0.9)' }}>
                                    Search by title, author, keyword, school, or publication year and open full records instantly.
                                </Typography.Paragraph>
                                <Space.Compact style={{ width: '100%' }}>
                                    <Input
                                        size="large"
                                        placeholder="Try: digital education, climate adaptation, public health"
                                        value={search}
                                        prefix={<SearchOutlined />}
                                        onChange={(event) => setSearch(event.target.value)}
                                        onPressEnter={() => applyFilters()}
                                    />
                                    <Button size="large" type="primary" onClick={() => applyFilters()}>
                                        Search
                                    </Button>
                                </Space.Compact>
                            </Col>
                            <Col xs={24} md={12} lg={8}>
                                <Row gutter={[10, 10]}>
                                    <Col span={24}>
                                        <Card bordered={false} style={{ borderRadius: 12, background: 'rgba(255,255,255,0.12)' }}>
                                            <Statistic title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Approved papers</span>} value={proposals.total} prefix={<BookOutlined style={{ color: '#ffffff' }} />} valueStyle={{ color: '#ffffff' }} />
                                        </Card>
                                    </Col>
                                    <Col span={24}>
                                        <Card bordered={false} style={{ borderRadius: 12, background: 'rgba(255,255,255,0.12)' }}>
                                            <Statistic title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Current results</span>} value={proposals.data.length} prefix={<FileSearchOutlined style={{ color: '#ffffff' }} />} valueStyle={{ color: '#ffffff' }} />
                                        </Card>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Card>

                    <Card bordered={false} className="admin-dashboard-shell" style={{ marginBottom: 18, borderRadius: 14 }}>
                        <Row gutter={[12, 12]} align="middle">
                            <Col xs={24} md={8} lg={6}>
                                <Input
                                    placeholder="Year"
                                    value={year}
                                    onChange={(event) => setYear(event.target.value.replace(/\D/g, ''))}
                                    onPressEnter={() => applyFilters()}
                                />
                            </Col>
                            <Col xs={24} md={16} lg={12}>
                                <Input
                                    placeholder="School or institution"
                                    value={school}
                                    onChange={(event) => setSchool(event.target.value)}
                                    onPressEnter={() => applyFilters()}
                                />
                            </Col>
                            <Col xs={24} lg={6}>
                                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                                    <Button onClick={() => { setSearch(''); setYear(''); setSchool(''); router.get(route('research.public.index')); }}>
                                        Clear
                                    </Button>
                                    <Button type="primary" onClick={() => applyFilters()}>
                                        Apply Filters
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                        {hasActiveFilters && (
                            <Space size={[8, 8]} wrap style={{ marginTop: 12 }}>
                                <Typography.Text type="secondary">Active filters:</Typography.Text>
                                {search && <Tag color="blue">Query: {search}</Tag>}
                                {year && <Tag color="gold">Year: {year}</Tag>}
                                {school && <Tag color="geekblue">School: {school}</Tag>}
                            </Space>
                        )}
                    </Card>

                    <Card bordered={false} className="admin-dashboard-shell" style={{ borderRadius: 14 }}>
                        <Table
                            rowKey="id"
                            columns={columns}
                            dataSource={proposals.data}
                            title={() => (
                                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                                    <Typography.Title level={5} style={{ margin: 0 }}>
                                        Approved Research Archive
                                    </Typography.Title>
                                    <Typography.Text type="secondary">
                                        Page {proposals.current_page} of {proposals.last_page || 1}
                                    </Typography.Text>
                                </Space>
                            )}
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
                        CRIS is the official public-facing archive for approved Calabarzon research submissions.
                    </Typography.Paragraph>
                </div>
            </div>
        </>
    );
}
