import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Input, Row, Select, Space, Table, Tag, Typography, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { StatusBadge } from '@/Components/StatusBadge';
import { formatDateTime } from '@/utils/date';

export default function ResearchIndex({ proposals, filters, canCreate, tab = '' }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [editability, setEditability] = useState(filters.editability ?? '');
    const [year, setYear] = useState(filters.year ?? '');
    const [school, setSchool] = useState(filters.school ?? '');

    useEffect(() => {
        if (flash?.success) {
            message.success(flash.success);
        }
        if (flash?.error) {
            message.error(flash.error);
        }
    }, [flash?.success, flash?.error]);

    const columns = useMemo(() => [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (value, row) => <Link href={route('research.show', row.id)}>{value}</Link>,
        },
        {
            title: 'Authors',
            dataIndex: 'authors',
            key: 'authors',
            render: (value) => <span style={{ color: '#475569' }}>{value}</span>,
        },
        { title: 'Year', dataIndex: 'year', key: 'year', width: 100 },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (value) => <StatusBadge status={value} />,
        },
        {
            title: 'Editability',
            key: 'editability',
            render: (_, row) => {
                const isLocked = row.status !== 'rejected';

                if (!isLocked) {
                    return <Tag color="blue">Editable</Tag>;
                }

                if (row.status === 'under_review_ched' && row.viewed_at) {
                    return (
                        <Space direction="vertical" size={2}>
                            <Tag color="volcano" style={{ marginInlineEnd: 0 }}>Locked (Viewed by CHED)</Tag>
                            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                {formatDateTime(row.viewed_at) || 'Viewed'}
                            </Typography.Text>
                        </Space>
                    );
                }

                return <Tag color="default">Locked ({row.status})</Tag>;
            },
        },
        {
            title: 'Institution',
            key: 'institution',
            render: (_, row) => row.institution?.name ?? '—',
        },
        {
            title: 'Action',
            key: 'action',
            align: 'right',
            render: (_, row) => <Link href={route('research.show', row.id)}>View</Link>,
        },
    ], []);

    function applyFilters() {
        router.get(route('research.index'), { search, status, editability, year, school, tab }, { preserveState: true });
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-slate-900">Research Papers</h2>}>
            <Head title="Research Papers" />

            <div className="space-y-4">
                    {flash?.success && <Alert type="success" showIcon message={flash.success} />}
                    {flash?.error && <Alert type="error" showIcon message={flash.error} />}

                    <Card className="admin-dashboard-shell" bordered={false}>
                        <Row gutter={[12, 12]} align="middle">
                            <Col xs={24} xl={10}>
                                <Typography.Title level={4} style={{ margin: 0 }}>Research Registry</Typography.Title>
                            </Col>
                            <Col xs={24} xl={14}>
                                <Row gutter={[12, 12]}>
                                    <Col xs={24} md={10}>
                                        <Input
                                            size="large"
                                            aria-label="Search research by title, author, or keyword"
                                            placeholder="Search title, author, keyword"
                                            value={search}
                                            prefix={<SearchOutlined />}
                                            onChange={(event) => setSearch(event.target.value)}
                                            onPressEnter={applyFilters}
                                        />
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Select
                                            size="large"
                                            aria-label="Filter research by status"
                                            style={{ width: '100%' }}
                                            value={status || undefined}
                                            placeholder="All statuses"
                                            allowClear
                                            options={[
                                                { value: 'draft', label: 'Draft' },
                                                { value: 'submitted', label: 'Submitted' },
                                                { value: 'under_review_faculty', label: 'Under Review (Faculty)' },
                                                { value: 'under_review_hei', label: 'Under Review (HEI)' },
                                                { value: 'under_review_ched', label: 'Under Review (CHED)' },
                                                { value: 'approved', label: 'Approved' },
                                                { value: 'rejected', label: 'Rejected' },
                                            ]}
                                            onChange={(value) => setStatus(value ?? '')}
                                        />
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Select
                                            size="large"
                                            aria-label="Filter research by editability"
                                            style={{ width: '100%' }}
                                            value={editability || undefined}
                                            placeholder="All editability"
                                            allowClear
                                            options={[
                                                { value: 'editable', label: 'Editable' },
                                                { value: 'locked', label: 'Locked' },
                                            ]}
                                            onChange={(value) => setEditability(value ?? '')}
                                        />
                                    </Col>
                                    <Col xs={24} md={6}>
                                        <Input
                                            size="large"
                                            aria-label="Filter research by year"
                                            placeholder="Filter by year"
                                            value={year}
                                            onChange={(event) => setYear(event.target.value.replace(/\D/g, ''))}
                                            onPressEnter={applyFilters}
                                        />
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Input
                                            size="large"
                                            aria-label="Filter research by school"
                                            placeholder="Filter by school"
                                            value={school}
                                            onChange={(event) => setSchool(event.target.value)}
                                            onPressEnter={applyFilters}
                                        />
                                    </Col>
                                    <Col xs={12} md={3}>
                                        <Button size="large" block type="primary" onClick={applyFilters}>Search</Button>
                                    </Col>
                                    <Col xs={12} md={3}>
                                        <Button size="large" block onClick={() => {
                                            setSearch(''); setStatus(''); setEditability(''); setYear(''); setSchool('');
                                            router.get(route('research.index'), { tab }, { replace: true });
                                        }}>Clear</Button>
                                    </Col>
                                    {canCreate && (
                                        <Col xs={12} md={3}>
                                            <Link href={route('research.create')}>
                                                <Button size="large" block icon={<PlusOutlined />}>New</Button>
                                            </Link>
                                        </Col>
                                    )}
                                </Row>
                            </Col>
                        </Row>
                    </Card>

                    <Card className="admin-dashboard-shell" bordered={false}>
                        <Table
                            rowKey="id"
                            columns={columns}
                            dataSource={proposals.data}
                            pagination={{
                                current: proposals.current_page,
                                pageSize: proposals.per_page,
                                total: proposals.total,
                                onChange: (page) => router.get(route('research.index'), { search, status, editability, year, school, tab, page }, { preserveState: true }),
                            }}
                            scroll={{ x: 920 }}
                            locale={{ emptyText: 'No research papers found for the selected filters.' }}
                        />
                    </Card>
            </div>
        </AuthenticatedLayout>
    );
}

