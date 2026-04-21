import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { StatusBadge } from '@/Components/StatusBadge';
import { Alert, Button, Card, Col, List, Row, Space, Statistic, Tag, Typography } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, FileSearchOutlined, InboxOutlined, StopOutlined } from '@ant-design/icons';

const statItems = [
    { key: 'pending', label: 'Pending Review', color: '#d97706', icon: <ClockCircleOutlined /> },
    { key: 'approved', label: 'Approved', color: '#15803d', icon: <CheckCircleOutlined /> },
    { key: 'rejected', label: 'Rejected', color: '#dc2626', icon: <StopOutlined /> },
    { key: 'total', label: 'Total Papers', color: '#0f766e', icon: <InboxOutlined /> },
];

export default function CHEDDashboard({ stats, forReview }) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">CHED Review Dashboard</h2>}>
            <Head title="CHED Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
                    <Card bordered={false} className="admin-dashboard-hero" bodyStyle={{ padding: 32 }}>
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
                                    <Link href={route('research.index', { status: 'submitted' })}>
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

                    <Card title="Needs Your Review" extra={<Link href={route('research.index', { status: 'submitted' })}>View all</Link>} className="admin-dashboard-shell">
                        {forReview.length === 0 ? (
                            <Alert type="success" showIcon message="No papers pending review. The current queue is clear." />
                        ) : (
                            <List
                                itemLayout="horizontal"
                                dataSource={forReview}
                                renderItem={(paper) => (
                                    <List.Item actions={[<Link key="review" href={route('research.show', paper.id)}>Review</Link>]}>
                                        <List.Item.Meta title={<Link href={route('research.show', paper.id)}>{paper.title}</Link>} description={`${paper.institution?.name ?? 'Unknown institution'} · ${new Date(paper.created_at).toLocaleDateString()}`} />
                                        <Space>
                                            <StatusBadge status={paper.status} />
                                            <Tag color="blue">CHED</Tag>
                                        </Space>
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
