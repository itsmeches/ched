import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/EmptyState';
import { Head, Link, router } from '@inertiajs/react';
import { formatDate } from '@/utils/date';
import { Alert, Button, Card, Col, Input, Modal, Popconfirm, Progress, Row, Select, Space, Statistic, Table, Tag, Typography } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, DatabaseOutlined, FileSearchOutlined, InboxOutlined, KeyOutlined, OrderedListOutlined, StopOutlined } from '@ant-design/icons';
import { StatusBadge } from '@/Components/StatusBadge';
import DashboardFilters from '@/Components/DashboardFilters';
import { useState } from 'react';
import { useTheme } from '@/utils/ThemeContext';
import CHEDCharts from './Partials/CHEDCharts';
import { getReviewRemarkTemplates } from '@/utils/reviewRemarkTemplates';

export default function CHEDDashboard({ stats, stageCounts = {}, forReview, editRequests, monthlyTrends = [], disciplineBreakdown = [], approvalFunnel = [], filters = {}, filterOptions = {} }) {
    const { dark } = useTheme();
    const accentPrimary = dark ? '#93c5fd' : '#0033a0';
    const metricTextColor = dark ? '#e2e8f0' : '#0f172a';
    const statItems = [
        { key: 'pending', label: 'Pending Review', color: '#d97706', icon: <ClockCircleOutlined /> },
        { key: 'total', label: 'Total Papers', color: accentPrimary, icon: <InboxOutlined /> },
        { key: 'approved', label: 'Approved', color: accentPrimary, icon: <CheckCircleOutlined /> },
        { key: 'rejected', label: 'Rejected', color: '#dc2626', icon: <StopOutlined /> },
    ];

    const DEFAULT_REJECT_REMARK = 'CHED final review: Please revise and resubmit with required corrections.';
    const remarkTemplateOptions = getReviewRemarkTemplates('under_review_ched').map((template) => ({ value: template, label: template }));

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
        { title: 'Year', dataIndex: 'year', key: 'year', width: 100 },
        {
            title: 'Submitted',
            dataIndex: 'submitted_at',
            key: 'submitted_at',
            width: 150,
            render: (_, row) => formatDate(row.submitted_at || row.created_at),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, row) => (
                <Space>
                    <Popconfirm title="Final approve this submission?" okText="Approve" onConfirm={() => router.post(route('research.review', row.id), { action: 'approve' })}>
                        <Button type="primary" size="small">Approve</Button>
                    </Popconfirm>
                    <Button danger size="small" onClick={() => openRejectModal(row.id)}>Reject</Button>
                </Space>
            ),
        },
    ];

    return (
        <AuthenticatedLayout header={<AdminPageHeader title="CHED Review Dashboard" />}>
            <Head title="CHED Dashboard" />

            <div className="space-y-6">
                    <Card bordered={false} className="admin-dashboard-hero" styles={{ body: { padding: 32 } }}>
                        <Row gutter={[24, 24]} align="middle">
                            <Col xs={24} lg={16}>
                                <Space direction="vertical" size={10}>
                                    <Tag style={{ alignSelf: 'flex-start', borderRadius: 999, paddingInline: 12, paddingBlock: 4, backgroundColor: accentPrimary, color: '#fff', border: 'none' }}>
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
                                    <Link href={route('research.index', { status: 'under_review_ched' })}>
                                        <Button type="primary" size="large" block icon={<FileSearchOutlined />} className="quick-action-primary">
                                            Open Review Queue
                                        </Button>
                                    </Link>
                                    <Link href={route('ched.decisions')}>
                                        <Button size="large" block icon={<OrderedListOutlined />} className="quick-action-secondary">
                                            Open Decision History
                                        </Button>
                                    </Link>
                                    <Link href={route('research.index')}>
                                        <Button size="large" block icon={<DatabaseOutlined />} className="quick-action-secondary">
                                            Open All Research
                                        </Button>
                                    </Link>
                                </Space>
                            </Col>
                        </Row>
                    </Card>

                    <DashboardFilters
                        routeName="ched.dashboard"
                        filters={filters}
                        years={filterOptions.years ?? []}
                        institutions={filterOptions.institutions ?? []}
                        disciplines={filterOptions.disciplines ?? []}
                    />

                    <Card title="Review Queue" extra={<Link href={route('research.index', { status: 'under_review_ched' })}>View all</Link>} className="admin-dashboard-shell dashboard-table-card" bordered={false}>
                        {forReview.length === 0 ? (
                            <Alert type="success" showIcon message="No papers pending review. The current queue is clear." />
                        ) : (
                            <Table
                                rowKey="id"
                                columns={pendingColumns}
                                dataSource={forReview}
                                pagination={false}
                                scroll={{ x: 820 }}
                                locale={{ emptyText: <EmptyState title="Review queue is clear" description="No papers are currently waiting for CHED final review." /> }}
                            />
                        )}
                    </Card>



                    {editRequests?.length > 0 && (
                        <Card
                            className="admin-dashboard-shell dashboard-table-card"
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
                                                <Typography.Text strong style={{ color: accentPrimary }}>
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

                    <Row gutter={[16, 16]}>
                        {statItems.map((item, index) => (
                            <Col xs={24} sm={12} xl={6} key={item.key}>
                                <Card className="admin-dashboard-shell kpi-stat-card dashboard-reveal" hoverable style={{ animationDelay: `${index * 55}ms` }}>
                                    <Statistic title={item.label} value={stats[item.key]} prefix={<span style={{ color: item.color }}>{item.icon}</span>} valueStyle={{ color: metricTextColor }} />
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <CHEDCharts stats={stats} monthlyTrends={monthlyTrends} disciplineBreakdown={disciplineBreakdown} approvalFunnel={approvalFunnel} />

                    <Modal
                        title="Reject Submission"
                        open={rejectModal.open}
                        onCancel={closeRejectModal}
                        onOk={submitReject}
                        okText="Reject"
                        okButtonProps={{ danger: true, loading: rejectModal.loading }}
                    >
                        <Space direction="vertical" size={10} style={{ width: '100%' }}>
                            <div>
                                <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                                    Quick templates
                                </Typography.Text>
                                <Space wrap size={[6, 6]}>
                                    {remarkTemplateOptions.map((item) => (
                                        <Tag.CheckableTag
                                            key={item.value}
                                            checked={rejectModal.comments === item.value}
                                            onChange={() => setRejectModal((prev) => ({ ...prev, comments: item.value, error: '' }))}
                                        >
                                            {item.label.length > 58 ? `${item.label.slice(0, 58)}...` : item.label}
                                        </Tag.CheckableTag>
                                    ))}
                                </Space>
                            </div>
                            <Select
                                placeholder="Apply remark template"
                                options={remarkTemplateOptions}
                                onChange={(value) => setRejectModal((prev) => ({ ...prev, comments: value, error: '' }))}
                            />
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
