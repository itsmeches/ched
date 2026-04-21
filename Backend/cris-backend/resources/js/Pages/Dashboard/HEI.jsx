import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Alert, Button, Card, Col, Progress, Row, Space, Statistic, Table, Tag, Typography } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, FileAddOutlined, FileTextOutlined, StopOutlined } from '@ant-design/icons';

const statItems = [
    { key: 'total', label: 'Total Papers', color: '#0f766e', icon: <FileTextOutlined /> },
    { key: 'pending', label: 'Pending', color: '#d97706', icon: <ClockCircleOutlined /> },
    { key: 'approved', label: 'Approved', color: '#15803d', icon: <CheckCircleOutlined /> },
    { key: 'rejected', label: 'Rejected', color: '#dc2626', icon: <StopOutlined /> },
];

const statusColor = {
    pending: 'gold',
    approved: 'green',
    rejected: 'red',
};

export default function HEIDashboard({ stats, recentUploads, pendingQueue }) {
    const recentColumns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (value, row) => <Link href={route('research.show', row.id)}>{value}</Link>,
        },
        { title: 'Year', dataIndex: 'year', key: 'year', width: 100 },
        { title: 'School', dataIndex: 'school', key: 'school', render: (value) => value || '—' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (value) => <Tag color={statusColor[value] ?? 'default'}>{value?.toUpperCase()}</Tag>,
        },
        {
            title: 'Updated',
            dataIndex: 'updated_at',
            key: 'updated_at',
            render: (value) => new Date(value).toLocaleDateString(),
        },
    ];

    const pendingColumns = [
        {
            title: 'Pending Submission',
            dataIndex: 'title',
            key: 'title',
            render: (value, row) => <Link href={route('research.show', row.id)}>{value}</Link>,
        },
        {
            title: 'Submitted',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 160,
            render: (value) => new Date(value).toLocaleDateString(),
        },
    ];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">My Research Dashboard</h2>}>
            <Head title="HEI Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
                    <Card bordered={false} className="admin-dashboard-hero" bodyStyle={{ padding: 32 }}>
                        <Row gutter={[24, 24]} align="middle">
                            <Col xs={24} lg={16}>
                                <Space direction="vertical" size={10}>
                                    <Tag color="cyan" style={{ alignSelf: 'flex-start', borderRadius: 999, paddingInline: 12, paddingBlock: 4 }}>
                                        HEI Workspace
                                    </Tag>
                                    <Typography.Title level={2} style={{ margin: 0, color: '#ffffff' }}>
                                        Track research submissions from pending to decision
                                    </Typography.Title>
                                    <Typography.Paragraph style={{ margin: 0, color: 'rgba(255,255,255,0.82)', fontSize: 16 }}>
                                        Monitor your paper pipeline, jump into active submissions, and keep new records moving into the CHED review queue.
                                    </Typography.Paragraph>
                                </Space>
                            </Col>
                            <Col xs={24} lg={8}>
                                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                    <Link href={route('research.create')}>
                                        <Button type="primary" size="large" block icon={<FileAddOutlined />}>
                                            Submit New Paper
                                        </Button>
                                    </Link>
                                    <Link href={route('research.index')}>
                                        <Button size="large" block>
                                            Browse All Papers
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

                    <Row gutter={[16, 16]}>
                        <Col xs={24} xl={12}>
                            <Card className="admin-dashboard-shell" title="Submission Health" bordered={false}>
                                <Space direction="vertical" size={14} style={{ width: '100%' }}>
                                    <Statistic title="Uploaded This Month" value={stats.uploadedThisMonth} />
                                    <div>
                                        <Typography.Text type="secondary">Approval Rate</Typography.Text>
                                        <Progress percent={Number(stats.approvalRate)} status="active" strokeColor="#15803d" />
                                    </div>
                                </Space>
                            </Card>
                        </Col>
                        <Col xs={24} xl={12}>
                            <Card className="admin-dashboard-shell" title="Pending Queue" bordered={false}>
                                {pendingQueue.length === 0 ? (
                                    <Alert type="success" showIcon message="No pending submissions. Your queue is clear." />
                                ) : (
                                    <Table
                                        rowKey="id"
                                        columns={pendingColumns}
                                        dataSource={pendingQueue}
                                        pagination={false}
                                        size="small"
                                    />
                                )}
                            </Card>
                        </Col>
                    </Row>

                    <Card title="Recent Uploads" className="admin-dashboard-shell">
                        {recentUploads.length === 0 ? (
                            <Alert type="info" showIcon message="No papers yet. Submit your first research paper to start building your institution's record." />
                        ) : (
                            <Table
                                rowKey="id"
                                columns={recentColumns}
                                dataSource={recentUploads}
                                pagination={false}
                                scroll={{ x: 840 }}
                            />
                        )}
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
