import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import { Head, Link } from '@inertiajs/react';
import { formatDate } from '@/utils/date';
import { Alert, Button, Card, Col, Row, Space, Statistic, Table, Tag, Typography } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, FileAddOutlined, FileTextOutlined, StopOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { StatusBadge } from '@/Components/StatusBadge';
import DashboardFilters from '@/Components/DashboardFilters';
import { useTheme } from '@/utils/ThemeContext';
import StudentCharts from './Partials/StudentCharts';

export default function StudentDashboard({ stats, stageCounts = {}, recentUploads, pendingQueue, monthlyActivity = [], filters = {}, filterOptions = {} }) {
    const { dark } = useTheme();
    const accentPrimary = dark ? '#93c5fd' : '#0033a0';
    const metricTextColor = dark ? '#e2e8f0' : '#0f172a';
    const statItems = [
        { key: 'pending', label: 'Pending', color: '#d97706', icon: <ClockCircleOutlined /> },
        { key: 'total', label: 'Total Papers', color: accentPrimary, icon: <FileTextOutlined /> },
        { key: 'approved', label: 'Approved', color: accentPrimary, icon: <CheckCircleOutlined /> },
        { key: 'rejected', label: 'Rejected', color: '#dc2626', icon: <StopOutlined /> },
    ];

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

            <div className="space-y-6">
                <Card bordered={false} className="admin-dashboard-hero" styles={{ body: { padding: 32 } }}>
                    <Row gutter={[24, 24]} align="middle">
                        <Col xs={24} lg={16}>
                            <Space direction="vertical" size={10}>
                                <Tag style={{ alignSelf: 'flex-start', borderRadius: 999, paddingInline: 12, paddingBlock: 4, backgroundColor: accentPrimary, color: '#fff', border: 'none' }}>
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
                                    <Button type="primary" size="large" block icon={<FileAddOutlined />} className="quick-action-primary">
                                        Open Submission Form
                                    </Button>
                                </Link>
                                <Link href={route('research.index')}>
                                    <Button size="large" block icon={<UnorderedListOutlined />} className="quick-action-secondary">
                                        Open My Submissions
                                    </Button>
                                </Link>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                <DashboardFilters
                    routeName="student.dashboard"
                    filters={filters}
                    years={filterOptions.years ?? []}
                    institutions={filterOptions.institutions ?? []}
                    disciplines={filterOptions.disciplines ?? []}
                />

                <Card className="admin-dashboard-shell dashboard-table-card" title="Review Queue" bordered={false}>
                    {pendingQueue.length === 0 ? (
                        <Alert type="success" showIcon message="No submissions currently pending review." />
                    ) : (
                        <Table rowKey="id" columns={pendingColumns} dataSource={pendingQueue} pagination={false} size="small" />
                    )}
                </Card>

                <Row gutter={[16, 16]}>
                    {statItems.map((item, index) => (
                        <Col xs={24} sm={12} xl={24 / statItems.length} key={item.key}>
                            <Card className="admin-dashboard-shell kpi-stat-card dashboard-reveal" hoverable style={{ animationDelay: `${index * 55}ms` }}>
                                <Statistic title={item.label} value={stats[item.key]} prefix={<span style={{ color: item.color }}>{item.icon}</span>} valueStyle={{ color: metricTextColor }} />
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Card title="Recent Uploads" className="admin-dashboard-shell dashboard-table-card">
                    {recentUploads.length === 0 ? (
                        <Alert type="info" showIcon message="No papers yet. Upload your first research paper." />
                    ) : (
                        <Table rowKey="id" columns={recentColumns} dataSource={recentUploads} pagination={false} scroll={{ x: 920 }} />
                    )}
                </Card>

                <StudentCharts stats={stats} stageCounts={stageCounts} monthlyActivity={monthlyActivity} />
            </div>
        </AuthenticatedLayout>
    );
}
