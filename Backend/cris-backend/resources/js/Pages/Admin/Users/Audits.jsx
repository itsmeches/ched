import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminFilterCard from '@/Components/Admin/AdminFilterCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import AdminTableCard from '@/Components/Admin/AdminTableCard';
import EmptyState from '@/Components/EmptyState';
import { Head, Link, router } from '@inertiajs/react';
import { formatDateTime } from '@/utils/date';
import { ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Input, Modal, Row, Select, Space, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

function prettifyAction(action) {
    return String(action || '')
        .split('_')
        .join(' ')
        .replace(/\b\w/g, (s) => s.toUpperCase());
}

export default function UserAudits({ audits, filters, actionOptions = [] }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [action, setAction] = useState(filters.action ?? '');
    const [range, setRange] = useState(
        filters.from && filters.to ? [dayjs(filters.from), dayjs(filters.to)] : null,
    );
    const [selectedAudit, setSelectedAudit] = useState(null);

    const columns = useMemo(() => [
        {
            title: 'When',
            dataIndex: 'performed_at',
            key: 'performed_at',
            width: 190,
            render: (value) => formatDateTime(value) || '—',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            width: 230,
            render: (value) => <Tag color="blue">{prettifyAction(value)}</Tag>,
        },
        {
            title: 'Actor',
            key: 'actor',
            responsive: ['sm'],
            render: (_, row) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{row.actor?.name ?? 'System/Unknown'}</div>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {row.actor?.email ?? '—'}
                    </Typography.Text>
                </div>
            ),
        },
        {
            title: 'Target',
            key: 'target',
            render: (_, row) => (
                <div>
                    <div style={{ fontWeight: 600 }}>
                        {row.target?.name ?? `User #${row.target_user_id}`}
                        {row.target?.deleted_at ? <Tag color="red" style={{ marginLeft: 6 }}>Deactivated</Tag> : null}
                    </div>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {row.target?.email ?? '—'}
                    </Typography.Text>
                </div>
            ),
        },
        {
            title: 'Details',
            key: 'details',
            responsive: ['md'],
            render: (_, row) => (
                <Space direction="vertical" size={2}>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        IP: {row.ip_address || '—'}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        Changes: {Object.keys(row.new_values || {}).length || Object.keys(row.old_values || {}).length ? 'Yes' : 'No'}
                    </Typography.Text>
                    <Button size="small" type="link" style={{ padding: 0 }} onClick={() => setSelectedAudit(row)}>
                        View JSON
                    </Button>
                </Space>
            ),
        },
    ], []);

    function applyFilters(page = 1) {
        router.get(route('admin.users.audits'), {
            search,
            action,
            from: range?.[0]?.format('YYYY-MM-DD') ?? '',
            to: range?.[1]?.format('YYYY-MM-DD') ?? '',
            page,
        }, { preserveState: true, replace: true });
    }

    function clearFilters() {
        setSearch('');
        setAction('');
        setRange(null);

        router.get(route('admin.users.audits'), {
            search: '',
            action: '',
            from: '',
            to: '',
        }, { preserveState: true, replace: true });
    }

    return (
        <AuthenticatedLayout
            header={(
                <AdminPageHeader
                    title="User Management Audits"
                    actions={(
                        <Link href={route('admin.users.index')}>
                            <Button icon={<ArrowLeftOutlined />}>Back to Users</Button>
                        </Link>
                    )}
                />
            )}
        >
            <Head title="User Management Audits" />

            <Modal
                title={selectedAudit ? `Audit Details #${selectedAudit.id}` : 'Audit Details'}
                open={!!selectedAudit}
                onCancel={() => setSelectedAudit(null)}
                footer={null}
                width={860}
                destroyOnClose
            >
                {selectedAudit ? (
                    <Space direction="vertical" size={12} style={{ width: '100%' }}>
                        <Typography.Text>
                            <strong>Action:</strong> {prettifyAction(selectedAudit.action)}
                        </Typography.Text>
                        <Typography.Text>
                            <strong>When:</strong> {formatDateTime(selectedAudit.performed_at) || '—'}
                        </Typography.Text>
                        <Typography.Text>
                            <strong>Actor:</strong> {selectedAudit.actor?.name ?? 'System/Unknown'}
                        </Typography.Text>
                        <Typography.Text>
                            <strong>Target:</strong> {selectedAudit.target?.name ?? `User #${selectedAudit.target_user_id}`}
                        </Typography.Text>

                        <div>
                            <Typography.Title level={5} style={{ marginBottom: 8 }}>Old Values</Typography.Title>
                            <pre style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: 12, maxHeight: 220, overflow: 'auto' }}>
                                {JSON.stringify(selectedAudit.old_values ?? {}, null, 2)}
                            </pre>
                        </div>

                        <div>
                            <Typography.Title level={5} style={{ marginBottom: 8 }}>New Values</Typography.Title>
                            <pre style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: 12, maxHeight: 220, overflow: 'auto' }}>
                                {JSON.stringify(selectedAudit.new_values ?? {}, null, 2)}
                            </pre>
                        </div>
                    </Space>
                ) : null}
            </Modal>

            <div className="space-y-4">
                <AdminFilterCard
                    title="Audit trail filters"
                    description="Search by actor or target, and narrow by action/date."
                    controls={(
                        <Row gutter={[12, 12]}>
                            <Col xs={24} md={10}>
                                <Input
                                    size="large"
                                    value={search}
                                    placeholder="Search actor/target name or email"
                                    prefix={<SearchOutlined />}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onPressEnter={() => applyFilters(1)}
                                />
                            </Col>
                            <Col xs={24} md={6}>
                                <Select
                                    size="large"
                                    value={action || undefined}
                                    placeholder="All actions"
                                    allowClear
                                    options={actionOptions}
                                    onChange={(value) => setAction(value ?? '')}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col xs={24} md={8}>
                                <DatePicker.RangePicker
                                    size="large"
                                    value={range}
                                    onChange={(value) => setRange(value)}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col xs={24} md={4}>
                                <Button size="large" block type="primary" onClick={() => applyFilters(1)}>Apply</Button>
                            </Col>
                            <Col xs={24} md={4}>
                                <Button size="large" block onClick={clearFilters}>Clear</Button>
                            </Col>
                        </Row>
                    )}
                />

                <AdminTableCard
                    title="Audit Entries"
                    summary={`${audits.total} event${audits.total === 1 ? '' : 's'} logged`}
                >
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={audits.data || []}
                        pagination={{
                            current: audits.current_page,
                            pageSize: audits.per_page,
                            total: audits.total,
                            onChange: (page) => applyFilters(page),
                        }}
                        scroll={{ x: 1100 }}
                        locale={{ emptyText: <EmptyState title="No audit events found" description="Try another date range, action, or search query." /> }}
                    />
                </AdminTableCard>
            </div>
        </AuthenticatedLayout>
    );
}
