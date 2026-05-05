import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/EmptyState';
import { Head, Link, router } from '@inertiajs/react';
import { formatDate } from '@/utils/date';
import { Alert, Button, Card, Col, Input, Modal, Popconfirm, Progress, Row, Space, Statistic, Table, Tag, Typography } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, FileSearchOutlined, InboxOutlined, KeyOutlined, StopOutlined } from '@ant-design/icons';
import { StatusBadge } from '@/Components/StatusBadge';
import { useState } from 'react';

const statItems = [
    { key: 'pending', label: 'Pending Review', color: '#d97706', icon: <ClockCircleOutlined /> },
    { key: 'approved', label: 'Approved', color: '#0033a0', icon: <CheckCircleOutlined /> },
    { key: 'rejected', label: 'Rejected', color: '#dc2626', icon: <StopOutlined /> },
    { key: 'total', label: 'Total Papers', color: '#0033a0', icon: <InboxOutlined /> },
];

export default function CHEDDashboard({ stats, stageCounts = {}, forReview, editRequests }) {
    const DEFAULT_REJECT_REMARK = 'CHED final review: Please revise and resubmit with required corrections.';

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
                                    <Link href={route('research.index', { status: 'under_review_ched' })}>
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

                    <Card className="admin-dashboard-shell" bordered={false} title="Quick Filters">
                        <Space wrap>
                            <Link href={route('research.index', { status: 'under_review_ched' })}>
                                <Button>CHED Final Queue</Button>
                            </Link>
                            <Link href={route('research.index', { status: 'approved' })}>
                                <Button>Approved</Button>
                            </Link>
                            <Link href={route('research.index', { status: 'rejected' })}>
                                <Button>Rejected</Button>
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
                                    <Link href={route('research.index', { status: 'under_review_ched' })}>
                                        <Button type="primary" block icon={<FileSearchOutlined />}>Open Review Queue</Button>
                                    </Link>
                                </Space>
                            </Card>
                        </Col>
                    </Row>

                    <Card title="Needs Your Final Approval" extra={<Link href={route('research.index', { status: 'under_review_ched' })}>View all</Link>} className="admin-dashboard-shell">
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
