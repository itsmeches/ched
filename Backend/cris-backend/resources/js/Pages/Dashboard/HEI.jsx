import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Alert, Button, Card, Col, List, Row, Space, Statistic, Tag, Typography } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, FileAddOutlined, FileTextOutlined, FolderOpenOutlined, StopOutlined } from '@ant-design/icons';

const statItems = [
    { key: 'total', label: 'Total Papers', color: '#0f766e', icon: <FileTextOutlined /> },
    { key: 'draft', label: 'Drafts', color: '#475569', icon: <FolderOpenOutlined /> },
    { key: 'submitted', label: 'In Review', color: '#d97706', icon: <ClockCircleOutlined /> },
    { key: 'approved', label: 'Approved', color: '#15803d', icon: <CheckCircleOutlined /> },
    { key: 'rejected', label: 'Rejected', color: '#dc2626', icon: <StopOutlined /> },
];

const statusColor = {
    approved: 'green',
    rejected: 'red',
    draft: 'default',
    submitted: 'gold',
    under_review: 'processing',
};

export default function HEIDashboard({ stats, recent }) {
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
                                        Track research submissions from draft to approval
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

                    <Card title="Recent Papers" className="admin-dashboard-shell">
                        {recent.length === 0 ? (
                            <Alert type="info" showIcon message="No papers yet. Submit your first research paper to start building your institution's record." />
                        ) : (
                            <List
                                itemLayout="horizontal"
                                dataSource={recent}
                                renderItem={(paper) => (
                                    <List.Item actions={[<Link key="open" href={route('research.show', paper.id)}>Open</Link>]}>
                                        <List.Item.Meta title={<Link href={route('research.show', paper.id)}>{paper.title}</Link>} description={`Updated ${new Date(paper.updated_at).toLocaleDateString()}`} />
                                        <Tag color={statusColor[paper.status] ?? 'default'}>{paper.status?.replace('_', ' ').toUpperCase()}</Tag>
                                    </List.Item>
                                )}
                            />
                        )}
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
