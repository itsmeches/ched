import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import { Head, Link, router } from '@inertiajs/react';
import { formatDate } from '@/utils/date';
import { Alert, Button, Card, Col, Input, Modal, Popconfirm, Row, Space, Statistic, Table, Tag } from 'antd';
import { BankOutlined, CheckCircleOutlined, ClockCircleOutlined, StopOutlined } from '@ant-design/icons';
import { StatusBadge } from '@/Components/StatusBadge';
import { useState } from 'react';

const statItems = [
    { key: 'total', label: 'Total Submissions', icon: <BankOutlined style={{ color: '#0033a0' }} /> },
    { key: 'pending', label: 'Pending HEI Review', icon: <ClockCircleOutlined style={{ color: '#d97706' }} /> },
    { key: 'approved', label: 'Approved', icon: <CheckCircleOutlined style={{ color: '#0033a0' }} /> },
    { key: 'rejected', label: 'Rejected', icon: <StopOutlined style={{ color: '#dc2626' }} /> },
];

export default function HEIDashboard({ stats, stageCounts = {}, forReview, recentDecisions }) {
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

            <div className="space-y-8">
                <Row gutter={[16, 16]}>
                    {statItems.map((item) => (
                        <Col xs={24} sm={12} xl={6} key={item.key}>
                            <Card className="admin-dashboard-shell" hoverable>
                                <Statistic title={item.label} value={stats[item.key]} prefix={item.icon} />
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Card className="admin-dashboard-shell" bordered={false} title="Quick Filters">
                    <Space wrap>
                        <Link href={route('accounts.hierarchy')}>
                            <Button>Account Hierarchy</Button>
                        </Link>
                        <Link href={route('research.index', { status: 'under_review_hei' })}>
                            <Button>HEI Queue</Button>
                        </Link>
                        <Link href={route('research.index', { status: 'rejected' })}>
                            <Button>Rejected Submissions</Button>
                        </Link>
                        <Link href={route('research.index', { status: 'under_review_ched' })}>
                            <Button>Forwarded to CHED</Button>
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

                <Card title="HEI Review Queue" className="admin-dashboard-shell">
                    {forReview.length === 0 ? (
                        <Alert type="success" showIcon message="No submissions waiting for HEI review." />
                    ) : (
                        <Table rowKey="id" columns={queueColumns} dataSource={forReview} pagination={false} scroll={{ x: 980 }} />
                    )}
                </Card>



                <Card title="Recent HEI Decisions" className="admin-dashboard-shell">
                    <Table rowKey="id" columns={decisionColumns} dataSource={recentDecisions} pagination={false} scroll={{ x: 840 }} />
                </Card>

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
