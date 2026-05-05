import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import { Head, Link } from '@inertiajs/react';
import { formatDate } from '@/utils/date';
import { Alert, Button, Card, Col, Progress, Row, Space, Statistic, Table, Tag, Typography } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, FileAddOutlined, FileTextOutlined, StopOutlined } from '@ant-design/icons';
import { StatusBadge } from '@/Components/StatusBadge';

const statItems = [
    { key: 'total', label: 'Total Papers', color: '#0033a0', icon: <FileTextOutlined /> },
    { key: 'pending', label: 'Pending', color: '#d97706', icon: <ClockCircleOutlined /> },
    { key: 'approved', label: 'Approved', color: '#0033a0', icon: <CheckCircleOutlined /> },
    { key: 'rejected', label: 'Rejected', color: '#dc2626', icon: <StopOutlined /> },
];

export default function StudentDashboard({ stats, stageCounts = {}, recentUploads, pendingQueue }) {
    const recentColumns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (value, row) => <Link href={route('research.show', row.id)}>{value}</Link>,
        },
        { title: 'Year', dataIndex: 'year', key: 'year', width: 100 },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (value) => <StatusBadge status={value} />,
        },
        {
            title: 'Remarks',
            dataIndex: 'remarks',
            key: 'remarks',
            render: (value) => value || '—',
        },
        {
            title: 'Updated',
            dataIndex: 'updated_at',
            key: 'updated_at',
            render: (value) => formatDate(value),
        },
    ];

    const pendingColumns = [
        {
            title: 'Submission',
            dataIndex: 'title',
            key: 'title',
            render: (value, row) => <Link href={route('research.show', row.id)}>{value}</Link>,
        },
        {
            title: 'Submitted',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 160,
            render: (value) => formatDate(value),
        },
    ];

    return (
        <AuthenticatedLayout header={<AdminPageHeader title="Student Dashboard" />}>
            <Head title="Student Dashboard" />

            <div className="space-y-8">
                <Card bordered={false} className="admin-dashboard-hero" styles={{ body: { padding: 32 } }}>
                    <Row gutter={[24, 24]} align="middle">
                        <Col xs={24} lg={16}>
                            <Space direction="vertical" size={10}>
                                <Tag style={{ alignSelf: 'flex-start', borderRadius: 999, paddingInline: 12, paddingBlock: 4, backgroundColor: '#0033a0', color: '#fff', border: 'none' }}>
                                    Student Workspace
                                </Tag>
                                <Typography.Title level={2} style={{ margin: 0, color: '#ffffff' }}>
                                    Upload and track your research status
                                </Typography.Title>
                                <Typography.Paragraph style={{ margin: 0, color: 'rgba(255,255,255,0.82)', fontSize: 16 }}>
                                    Submit papers, monitor approval progress, and review remarks from Faculty, HEI, and CHED.
                                </Typography.Paragraph>
                            </Space>
                        </Col>
                        <Col xs={24} lg={8}>
                            <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                <Link href={route('research.create')}>
                                    <Button type="primary" size="large" block icon={<FileAddOutlined />}>
                                        Upload New Paper
                                    </Button>
                                </Link>
                                <Link href={route('research.index')}>
                                    <Button size="large" block>
                                        View My Submissions
                                    </Button>
                                </Link>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                <Row gutter={[16, 16]}>
                    {statItems.map((item) => (
                        <Col xs={24} sm={12} xl={24 / statItems.length} key={item.key}>
                            <Card className="admin-dashboard-shell" hoverable>
                                <Statistic title={item.label} value={stats[item.key]} prefix={<span style={{ color: item.color }}>{item.icon}</span>} valueStyle={{ color: '#0f172a' }} />
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Card className="admin-dashboard-shell" bordered={false} title="Quick Filters">
                    <Space wrap>
                        <Link href={route('research.index', { status: 'under_review_faculty' })}>
                            <Button>Under Review (Faculty)</Button>
                        </Link>
                        <Link href={route('research.index', { status: 'rejected' })}>
                            <Button>Rejected (Needs Resubmit)</Button>
                        </Link>
                        <Link href={route('research.index', { status: 'approved' })}>
                            <Button>Approved</Button>
                        </Link>
                    </Space>
                </Card>

                <Card className="admin-dashboard-shell" bordered={false} title="Stage Counters">
                    <Space wrap>
                        <Tag color="gold">Faculty: {stageCounts.under_review_faculty ?? 0}</Tag>
                        <Tag color="blue">HEI: {stageCounts.under_review_hei ?? 0}</Tag>
                        <Tag color="cyan">CHED: {stageCounts.under_review_ched ?? 0}</Tag>
                        <Tag color="green">Approved: {stageCounts.approved ?? 0}</Tag>
                        <Tag color="red">Rejected: {stageCounts.rejected ?? 0}</Tag>
                    </Space>
                </Card>

                <Row gutter={[16, 16]}>
                    <Col xs={24} xl={12}>
                        <Card className="admin-dashboard-shell" title="Submission Health" bordered={false}>
                            <Space direction="vertical" size={14} style={{ width: '100%' }}>
                                <Statistic title="Uploaded This Month" value={stats.uploadedThisMonth} />
                                <div>
                                    <Typography.Text type="secondary">Approval Rate</Typography.Text>
                                    <Progress percent={Number(stats.approvalRate)} status="active" strokeColor="#0033a0" />
                                </div>
                            </Space>
                        </Card>
                    </Col>
                    <Col xs={24} xl={12}>
                        <Card className="admin-dashboard-shell" title="Pending Queue" bordered={false}>
                            {pendingQueue.length === 0 ? (
                                <Alert type="success" showIcon message="No submissions currently pending review." />
                            ) : (
                                <Table rowKey="id" columns={pendingColumns} dataSource={pendingQueue} pagination={false} size="small" />
                            )}
                        </Card>
                    </Col>
                </Row>



                <Card title="Recent Uploads" className="admin-dashboard-shell">
                    {recentUploads.length === 0 ? (
                        <Alert type="info" showIcon message="No papers yet. Upload your first research paper." />
                    ) : (
                        <Table rowKey="id" columns={recentColumns} dataSource={recentUploads} pagination={false} scroll={{ x: 920 }} />
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
