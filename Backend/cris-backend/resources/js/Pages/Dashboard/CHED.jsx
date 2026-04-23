import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { formatDate } from '@/utils/date';
import { Alert, Button, Card, Col, Popconfirm, Progress, Row, Space, Statistic, Table, Tag, Typography } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, FileSearchOutlined, InboxOutlined, KeyOutlined, StopOutlined } from '@ant-design/icons';

const statItems = [
    { key: 'pending', label: 'Pending Review', color: '#d97706', icon: <ClockCircleOutlined /> },
    { key: 'approved', label: 'Approved', color: '#0033a0', icon: <CheckCircleOutlined /> },
    { key: 'rejected', label: 'Rejected', color: '#dc2626', icon: <StopOutlined /> },
    { key: 'total', label: 'Total Papers', color: '#0033a0', icon: <InboxOutlined /> },
];

export default function CHEDDashboard({ stats, forReview, editRequests }) {
    const pendingColumns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (value, row) => <Link href={route('research.show', row.id)}>{value}</Link>,
        },
        {
            title: 'Institution',
            key: 'institution',
            render: (_, row) => row.institution?.name ?? 'Unknown institution',
        },
        { title: 'Year', dataIndex: 'year', key: 'year', width: 100 },
        {
            title: 'Submitted',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            render: (value) => formatDate(value),
        },
    ];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-slate-900">CHED Review Dashboard</h2>}>
            <Head title="CHED Dashboard" />

            <div className="space-y-8">
                    <Card bordered={false} className="admin-dashboard-hero" styles={{ body: { padding: 32 } }}>
                        <Row gutter={[24, 24]} align="middle">
                            <Col xs={24} lg={16}>
                                <Space direction="vertical" size={10}>
                                    <Tag style={{ alignSelf: 'flex-start', borderRadius: 999, paddingInline: 12, paddingBlock: 4, backgroundColor: '#0033a0', color: '#fff', border: 'none' }}>
                                        CHED Review Desk
                                    </Tag>
                                    <Typography.Title level={2} style={{ margin: 0, color: '#ffffff' }}>
                                        Review queue and approval activity at a glance
                                    </Typography.Title>
                                    <Typography.Paragraph style={{ margin: 0, color: 'rgba(255,255,255,0.82)', fontSize: 16 }}>
                                        Prioritize pending studies, review institutional submissions, and move decisions through the queue faster.
                                    </Typography.Paragraph>
                                </Space>
                            </Col>
                            <Col xs={24} lg={8}>
                                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                    <Link href={route('research.index', { status: 'pending' })}>
                                        <Button type="primary" size="large" block icon={<FileSearchOutlined />}>
                                            Open Review Queue
                                        </Button>
                                    </Link>
                                    <Link href={route('ched.decisions')}>
                                        <Button size="large" block>
                                            Open My Decisions
                                        </Button>
                                    </Link>
                                    <Link href={route('research.index')}>
                                        <Button size="large" block>
                                            View All Research
                                        </Button>
                                    </Link>
                                </Space>
                            </Col>
                        </Row>
                    </Card>

                    <Row gutter={[16, 16]}>
                        {statItems.map((item) => (
                            <Col xs={24} sm={12} xl={6} key={item.key}>
                                <Card className="admin-dashboard-shell" hoverable>
                                    <Statistic title={item.label} value={stats[item.key]} prefix={<span style={{ color: item.color }}>{item.icon}</span>} valueStyle={{ color: '#0f172a' }} />
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} xl={12}>
                            <Card className="admin-dashboard-shell" title="Review Performance" bordered={false}>
                                <Space direction="vertical" style={{ width: '100%' }} size={14}>
                                    <Statistic title="Reviewed Today" value={stats.reviewedToday} />
                                    <div>
                                        <Typography.Text type="secondary">Approval Rate</Typography.Text>
                                        <Progress percent={Number(stats.approvalRate)} strokeColor="#0033a0" />
                                    </div>
                                </Space>
                            </Card>
                        </Col>
                        <Col xs={24} xl={12}>
                            <Card className="admin-dashboard-shell" title="Queue Snapshot" bordered={false}>
                                <Space direction="vertical" style={{ width: '100%' }} size={14}>
                                    <Statistic title="Papers awaiting review" value={stats.pending} prefix={<ClockCircleOutlined style={{ color: '#d97706' }} />} />
                                    <Link href={route('research.index', { status: 'pending' })}>
                                        <Button type="primary" block icon={<FileSearchOutlined />}>Open Review Queue</Button>
                                    </Link>
                                </Space>
                            </Card>
                        </Col>
                    </Row>

                    <Card title="Needs Your Review" extra={<Link href={route('research.index', { status: 'pending' })}>View all</Link>} className="admin-dashboard-shell">
                        {forReview.length === 0 ? (
                            <Alert type="success" showIcon message="No papers pending review. The current queue is clear." />
                        ) : (
                            <Table
                                rowKey="id"
                                columns={pendingColumns}
                                dataSource={forReview}
                                pagination={false}
                                scroll={{ x: 820 }}
                                locale={{ emptyText: 'No papers are currently waiting for review.' }}
                            />
                        )}
                    </Card>

                    {editRequests?.length > 0 && (
                        <Card
                            className="admin-dashboard-shell"
                            bordered={false}
                            title={
                                <Space>
                                    <KeyOutlined style={{ color: '#d97706' }} />
                                    <span>Edit Permission Requests</span>
                                    <Tag color="orange">{editRequests.length}</Tag>
                                </Space>
                            }
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size={10}>
                                {editRequests.map((req) => (
                                    <div
                                        key={req.id}
                                        className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 bg-amber-50/50 px-4 py-3"
                                    >
                                        <div className="min-w-0">
                                            <Link href={route('research.show', req.proposal?.id)}>
                                                <Typography.Text strong style={{ color: '#0033a0' }}>
                                                    {req.proposal?.title ?? 'Unknown proposal'}
                                                </Typography.Text>
                                            </Link>
                                            <Typography.Text
                                                type="secondary"
                                                style={{ display: 'block', fontSize: 13, marginTop: 2 }}
                                            >
                                                Requested by {req.requester?.name}
                                                {req.reason ? ` — ${req.reason}` : ''}
                                            </Typography.Text>
                                        </div>
                                        <Space>
                                            <Popconfirm
                                                title="Approve this edit request?"
                                                description="The HEI will be able to edit this submission once."
                                                okText="Approve"
                                                onConfirm={() =>
                                                    router.post(
                                                        route('research.edit-permission.decide', {
                                                            proposal: req.proposal?.id,
                                                            editRequest: req.id,
                                                        }),
                                                        { decision: 'approved' },
                                                    )
                                                }
                                            >
                                                <Button type="primary" size="small">Approve</Button>
                                            </Popconfirm>
                                            <Popconfirm
                                                title="Deny this edit request?"
                                                okText="Deny"
                                                okButtonProps={{ danger: true }}
                                                onConfirm={() =>
                                                    router.post(
                                                        route('research.edit-permission.decide', {
                                                            proposal: req.proposal?.id,
                                                            editRequest: req.id,
                                                        }),
                                                        { decision: 'denied' },
                                                    )
                                                }
                                            >
                                                <Button danger size="small">Deny</Button>
                                            </Popconfirm>
                                        </Space>
                                    </div>
                                ))}
                            </Space>
                        </Card>
                    )}

            </div>
        </AuthenticatedLayout>
    );
}
