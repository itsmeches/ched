import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { StatusBadge } from '@/Components/StatusBadge';
import { formatDate } from '@/utils/date';
import { Alert, Button, Card, Col, Progress, Row, Space, Statistic, Table, Tag, Typography } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, FileSearchOutlined, InboxOutlined, StopOutlined } from '@ant-design/icons';

const statItems = [
    { key: 'pending', label: 'Pending Review', color: '#d97706', icon: <ClockCircleOutlined /> },
    { key: 'approved', label: 'Approved', color: '#15803d', icon: <CheckCircleOutlined /> },
    { key: 'rejected', label: 'Rejected', color: '#dc2626', icon: <StopOutlined /> },
    { key: 'total', label: 'Total Papers', color: '#0f766e', icon: <InboxOutlined /> },
];

export default function CHEDDashboard({ stats, forReview, recentDecisions }) {
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

    const decisionsColumns = [
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
        {
            title: 'Decision',
            dataIndex: 'status',
            key: 'status',
            render: (value) => <StatusBadge status={value} />,
        },
        {
            title: 'Reviewed At',
            dataIndex: 'reviewed_at',
            key: 'reviewed_at',
            render: (value) => formatDate(value),
        },
    ];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">CHED Review Dashboard</h2>}>
            <Head title="CHED Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
                    <Card bordered={false} className="admin-dashboard-hero" styles={{ body: { padding: 32 } }}>
                        <Row gutter={[24, 24]} align="middle">
                            <Col xs={24} lg={16}>
                                <Space direction="vertical" size={10}>
                                    <Tag color="geekblue" style={{ alignSelf: 'flex-start', borderRadius: 999, paddingInline: 12, paddingBlock: 4 }}>
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
                                        <Progress percent={Number(stats.approvalRate)} strokeColor="#2563eb" />
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
                            />
                        )}
                    </Card>

                    <Card title="Recent Decisions" className="admin-dashboard-shell">
                        {recentDecisions.length === 0 ? (
                            <Alert type="info" showIcon message="No approved/rejected decisions yet." />
                        ) : (
                            <Table
                                rowKey="id"
                                columns={decisionsColumns}
                                dataSource={recentDecisions}
                                pagination={false}
                                scroll={{ x: 820 }}
                            />
                        )}
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
