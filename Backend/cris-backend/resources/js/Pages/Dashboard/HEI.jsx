import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import { Head, Link, router } from '@inertiajs/react';
import { formatDate } from '@/utils/date';
import { Alert, Button, Card, Col, Input, Modal, Popconfirm, Row, Space, Statistic, Table, Tag, Typography } from 'antd';
import { BankOutlined, CheckCircleOutlined, ClockCircleOutlined, StopOutlined } from '@ant-design/icons';
import { StatusBadge } from '@/Components/StatusBadge';
import DashboardFilters from '@/Components/DashboardFilters';
import { useState } from 'react';
import { useTheme } from '@/utils/ThemeContext';
import HEICharts from './Partials/HEICharts';

export default function HEIDashboard({ stats, stageCounts = {}, forReview, recentDecisions, monthlyTrends = [], facultyBreakdown = [], filters = {}, filterOptions = {} }) {
    const { dark } = useTheme();
    const accentPrimary = dark ? '#93c5fd' : '#0033a0';
    const statItems = [
        { key: 'total', label: 'Total Submissions', icon: <BankOutlined style={{ color: accentPrimary }} /> },
        { key: 'pending', label: 'Pending HEI Review', icon: <ClockCircleOutlined style={{ color: '#d97706' }} /> },
        { key: 'approved', label: 'Approved', icon: <CheckCircleOutlined style={{ color: accentPrimary }} /> },
        { key: 'rejected', label: 'Rejected', icon: <StopOutlined style={{ color: '#dc2626' }} /> },
    ];

    const DEFAULT_REJECT_REMARK = 'HEI review: Please revise and improve the submission based on institutional requirements.';

    const [rejectModal, setRejectModal] = useState({
        open: false,
        proposalId: null,
        comments: '',
        starter: '',
        error: '',
        loading: false,
    });

    function openRejectModal(proposalId) {
        setRejectModal({
            open: true,
            proposalId,
            comments: DEFAULT_REJECT_REMARK,
            starter: DEFAULT_REJECT_REMARK,
            error: '',
            loading: false,
        });
    }

    function closeRejectModal() {
        setRejectModal({
            open: false,
            proposalId: null,
            comments: '',
            starter: '',
            error: '',
            loading: false,
        });
    }

    function submitReject() {
        const remarks = String(rejectModal.comments || '').trim();

        if (!remarks) {
            setRejectModal((prev) => ({ ...prev, error: 'Remarks are required when rejecting a submission.' }));
            return;
        }

        if (remarks === String(rejectModal.starter || '').trim()) {
            setRejectModal((prev) => ({ ...prev, error: 'Please edit the default remarks before submitting rejection.' }));
            return;
        }

        setRejectModal((prev) => ({ ...prev, loading: true, error: '' }));

        router.post(route('research.review', rejectModal.proposalId), {
            action: 'reject',
            comments: remarks,
        }, {
            onSuccess: () => closeRejectModal(),
            onError: () => {
                setRejectModal((prev) => ({ ...prev, error: 'Unable to submit rejection. Please try again.' }));
            },
            onFinish: () => {
                setRejectModal((prev) => ({ ...prev, loading: false }));
            },
        });
    }

    const queueColumns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (value, row) => <Link href={route('research.show', row.id)}>{value}</Link>,
        },
        {
            title: 'Student',
            key: 'submitter',
            render: (_, row) => row.submitter?.name ?? '—',
        },
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
            title: 'Submitted',
            dataIndex: 'submitted_at',
            key: 'submitted_at',
            render: (_, row) => formatDate(row.submitted_at || row.created_at),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, row) => (
                <Space>
                    <Popconfirm title="Approve this submission?" okText="Approve" onConfirm={() => router.post(route('research.review', row.id), { action: 'approve' })}>
                        <Button type="primary" size="small">Approve</Button>
                    </Popconfirm>
                    <Button danger size="small" onClick={() => openRejectModal(row.id)}>Reject</Button>
                </Space>
            ),
        },
    ];

    const decisionColumns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (value, row) => <Link href={route('research.show', row.id)}>{value}</Link>,
        },
        { title: 'Status', dataIndex: 'status', key: 'status', render: (value) => <StatusBadge status={value} /> },
        { title: 'Remarks', dataIndex: 'remarks', key: 'remarks', render: (value) => value || '—' },
        { title: 'Reviewed', dataIndex: 'reviewed_at', key: 'reviewed_at', render: (value) => formatDate(value) },
    ];

    return (
        <AuthenticatedLayout header={<AdminPageHeader title="HEI Dashboard" />}>
            <Head title="HEI Dashboard" />

            <div className="space-y-6">
                <Card bordered={false} className="admin-dashboard-hero" styles={{ body: { padding: 32 } }}>
                    <Row gutter={[24, 24]} align="middle">
                        <Col xs={24} lg={16}>
                            <Space direction="vertical" size={10}>
                                <Tag style={{ alignSelf: 'flex-start', borderRadius: 999, paddingInline: 12, paddingBlock: 4, backgroundColor: accentPrimary, color: '#fff', border: 'none' }}>
                                    HEI Review Desk
                                </Tag>
                                <Typography.Title level={2} style={{ margin: 0, color: '#ffffff' }}>
                                    Prioritize institutional reviews and decisions
                                </Typography.Title>
                                <Typography.Paragraph style={{ margin: 0, color: 'rgba(255,255,255,0.82)', fontSize: 16 }}>
                                    Review pending submissions, track forwarded papers, and manage institution-level approval throughput.
                                </Typography.Paragraph>
                            </Space>
                        </Col>
                        <Col xs={24} lg={8}>
                            <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                <Link href={route('research.index', { status: 'under_review_hei' })}>
                                    <Button className="quick-action-primary" size="large" block>
                                        Open HEI Queue
                                    </Button>
                                </Link>
                                <Link href={route('accounts.hierarchy')}>
                                    <Button className="quick-action-secondary" size="large" block>
                                        Account Hierarchy
                                    </Button>
                                </Link>
                                <Link href={route('research.index', { status: 'under_review_ched' })}>
                                    <Button className="quick-action-secondary" size="large" block>
                                        Forwarded to CHED
                                    </Button>
                                </Link>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                <DashboardFilters
                    routeName="hei.dashboard"
                    filters={filters}
                    years={filterOptions.years ?? []}
                    institutions={filterOptions.institutions ?? []}
                    disciplines={filterOptions.disciplines ?? []}
                />

                <Card title="Review Queue" className="admin-dashboard-shell" bordered={false}>
                    {forReview.length === 0 ? (
                        <Alert type="success" showIcon message="No submissions waiting for HEI review." />
                    ) : (
                        <Table rowKey="id" columns={queueColumns} dataSource={forReview} pagination={false} scroll={{ x: 980 }} />
                    )}
                </Card>



                <Card title="Recent Decisions" className="admin-dashboard-shell" bordered={false}>
                    <Table rowKey="id" columns={decisionColumns} dataSource={recentDecisions} pagination={false} scroll={{ x: 840 }} />
                </Card>

                <Row gutter={[16, 16]}>
                    {statItems.map((item) => (
                        <Col xs={24} sm={12} xl={6} key={item.key}>
                            <Card className="admin-dashboard-shell" hoverable>
                                <Statistic title={item.label} value={stats[item.key]} prefix={item.icon} />
                            </Card>
                        </Col>
                    ))}
                </Row>

                <HEICharts stats={stats} stageCounts={stageCounts} monthlyTrends={monthlyTrends} facultyBreakdown={facultyBreakdown} />

                <Modal
                    title="Reject Submission"
                    open={rejectModal.open}
                    onCancel={closeRejectModal}
                    onOk={submitReject}
                    okText="Reject"
                    okButtonProps={{ danger: true, loading: rejectModal.loading }}
                >
                    <Space direction="vertical" size={10} style={{ width: '100%' }}>
                        <Input.TextArea
                            rows={4}
                            value={rejectModal.comments}
                            onChange={(event) => setRejectModal((prev) => ({ ...prev, comments: event.target.value, error: '' }))}
                            placeholder="Enter rejection remarks"
                        />
                        {rejectModal.error && <Alert type="error" showIcon message={rejectModal.error} />}
                    </Space>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
