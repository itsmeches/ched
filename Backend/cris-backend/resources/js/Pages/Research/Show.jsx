import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { StatusBadge } from '@/Components/StatusBadge';
import { formatDateTime } from '@/utils/date';
import { Alert, Button, Card, Divider, Input, Modal, Popconfirm, Space, Tag, Typography, message } from 'antd';
import { DownloadOutlined, FilePdfOutlined, KeyOutlined, LockOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';

export default function ResearchShow({ proposal, canEdit, canReview, canDelete, editPermission, pendingEditRequests }) {
    const { flash, auth } = usePage().props;
    const deleteForm = useForm({});
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [rejectModal, setRejectModal] = useState({
        open: false,
        comments: '',
        starter: '',
        error: '',
    });
    const [pdfOpen, setPdfOpen] = useState(false);
    const pdfCardRef = useRef(null);
    const editPermForm = useForm({ reason: '' });

    function handleViewPdf() {
        const opening = !pdfOpen;
        setPdfOpen(opening);
        if (opening) {
            // Wait one tick for the card to mount, then scroll to it
            setTimeout(() => {
                pdfCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
        }
    }

    useEffect(() => {
        if (flash?.success) {
            message.success(flash.success);
        }
        if (flash?.error) {
            message.error(flash.error);
        }
    }, [flash?.success, flash?.error]);

    function openRejectModal() {
        const starter = proposal.status === 'under_review_faculty'
            ? 'Faculty review: Please revise and improve the submission based on stage requirements.'
            : proposal.status === 'under_review_hei'
                ? 'HEI review: Please revise and improve the submission based on institutional requirements.'
                : 'CHED final review: Please revise and resubmit with required corrections.';

        setRejectModal({
            open: true,
            comments: starter,
            starter,
            error: '',
        });
    }

    function closeRejectModal() {
        setRejectModal({
            open: false,
            comments: '',
            starter: '',
            error: '',
        });
    }

    function submitApprove() {
        setIsSubmittingReview(true);

        router.post(route('research.review', proposal.id), {
            action: 'approve',
        }, {
            onFinish: () => setIsSubmittingReview(false),
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

        setIsSubmittingReview(true);

        router.post(
            route('research.review', proposal.id),
            {
                action: 'reject',
                comments: remarks,
            },
            {
                onSuccess: () => closeRejectModal(),
                onFinish: () => setIsSubmittingReview(false),
            },
        );
    }

    const metadataItems = [
        { label: 'Author', value: proposal.authors },
        { label: 'Author Email', value: proposal.author_email || '—' },
        { label: 'Author Phone', value: proposal.author_phone || '—' },
        { label: 'Co-Authors', value: proposal.co_authors || '—' },
        { label: 'Co-Author Emails', value: proposal.co_author_emails || '—' },
        { label: 'Co-Author Phones', value: proposal.co_author_phones || '—' },
        { label: 'School', value: proposal.school || '—' },
        { label: 'Keywords', value: proposal.keywords || '—' },
        { label: 'Institution', value: proposal.institution?.name ?? '—' },
        { label: 'Submitted By', value: proposal.submitter?.name ?? '—' },
        { label: 'Viewed By CHED', value: proposal.viewer?.name ?? 'Not viewed yet' },
        { label: 'Viewed At', value: formatDateTime(proposal.viewed_at) || 'Not viewed yet' },
        { label: 'Last Action By', value: proposal.last_action_by || '—' },
        { label: 'Last Action At', value: formatDateTime(proposal.last_action_at) || '—' },
        { label: 'Approved By', value: proposal.approver?.name ?? '—' },
        { label: 'Approved At', value: formatDateTime(proposal.approved_at) || '—' },
    ];

    const auditSummaryItems = [
        { label: 'Current Stage', value: proposal.current_stage || '—' },
        { label: 'Last Reviewer', value: proposal.last_reviewer || '—' },
        { label: 'Last Decision Time', value: formatDateTime(proposal.last_decision_time) || '—' },
        { label: 'Remarks', value: proposal.remarks || '—' },
    ];

    const isLockedForEditing =
        proposal.status !== 'rejected';

    const reviewTitle = proposal.status === 'under_review_faculty' || proposal.status === 'submitted'
        ? 'Faculty Review Decision'
        : proposal.status === 'under_review_hei'
            ? 'HEI Review Decision'
            : proposal.status === 'under_review_ched'
                ? 'CHED Final Review Decision'
                : 'Review Decision';

    const role = auth?.user?.role;
    const showReviewActions = (() => {
        if (role === 'faculty') {
            return ['submitted', 'under_review_faculty'].includes(proposal.status);
        }

        if (role === 'hei') {
            return proposal.status === 'under_review_hei';
        }

        if (role === 'ched') {
            return proposal.status === 'under_review_ched';
        }

        if (role === 'super_admin') {
            return ['submitted', 'under_review_faculty', 'under_review_hei', 'under_review_ched'].includes(proposal.status);
        }

        return false;
    })();

    const rejectModalTitle = proposal.status === 'under_review_faculty' || proposal.status === 'submitted'
        ? 'Faculty Reject Submission'
        : proposal.status === 'under_review_hei'
            ? 'HEI Reject Submission'
            : proposal.status === 'under_review_ched'
                ? 'CHED Reject Submission'
                : 'Reject Submission';

    return (
        <AuthenticatedLayout header={
            <div className="flex items-center gap-3">
                <Link href={route('research.index')} className="text-sm text-slate-500 hover:text-slate-700">Back</Link>
                <h2 className="text-xl font-semibold text-slate-900 truncate">Research Record</h2>
            </div>
        }>
            <Head title={proposal.title} />

            <div className="space-y-4">
                    {flash?.success && <Alert type="success" showIcon message={flash.success} />}
                    {flash?.error && <Alert type="error" showIcon message={flash.error} />}

                    <Card className="admin-dashboard-shell" bordered={false}>
                        <div className="space-y-5">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="min-w-0 space-y-2">
                                    <Typography.Title level={3} style={{ margin: 0 }}>
                                        {proposal.title}
                                    </Typography.Title>
                                    <Space wrap size={[8, 8]}>
                                        <StatusBadge status={proposal.status} />
                                        {proposal.year && <Tag color="blue">Year {proposal.year}</Tag>}
                                        {proposal.category && <Tag color="geekblue">{proposal.category}</Tag>}
                                    </Space>
                                </div>

                                <Space wrap>
                                    {proposal.file_path && (
                                        <Button
                                            icon={<FilePdfOutlined />}
                                            type={pdfOpen ? 'primary' : 'default'}
                                            onClick={handleViewPdf}
                                        >
                                            {pdfOpen ? 'Hide PDF' : 'View PDF'}
                                        </Button>
                                    )}

                                    {proposal.file_path && (
                                        <a href={route('research.file', { proposal: proposal.id, download: 1 })}>
                                            <Button icon={<DownloadOutlined />}>Download PDF</Button>
                                        </a>
                                    )}

                                    {canEdit && (
                                        <Link href={route('research.edit', proposal.id)}>
                                            <Button>Edit</Button>
                                        </Link>
                                    )}

                                    {canDelete && (
                                        <Popconfirm
                                            title="Delete this research record?"
                                            description="This action cannot be undone."
                                            okText="Delete"
                                            okButtonProps={{ danger: true, loading: deleteForm.processing }}
                                            onConfirm={() => deleteForm.delete(route('research.destroy', proposal.id))}
                                        >
                                            <Button danger loading={deleteForm.processing}>Delete</Button>
                                        </Popconfirm>
                                    )}

                                    {showReviewActions && (
                                        <>
                                            <Popconfirm
                                                title="Approve this submission?"
                                                onConfirm={submitApprove}
                                                okText="Approve"
                                            >
                                                <Button type="primary" loading={isSubmittingReview}>
                                                    Approve
                                                </Button>
                                            </Popconfirm>
                                            <Button danger loading={isSubmittingReview} onClick={openRejectModal}>
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                </Space>
                            </div>

                            <div className="rounded-2xl border border-blue-200 bg-blue-50/65 p-3.5">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">Audit Summary</p>
                                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                                    {auditSummaryItems.map((item) => (
                                        <div key={item.label} className="rounded-xl border border-blue-200/80 bg-white/80 px-3 py-2">
                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                                            <p className="mt-0.5 break-words text-[13px] leading-snug text-slate-800">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                                {metadataItems.map((item) => (
                                    <div key={item.label} className="rounded-xl border border-slate-200/80 bg-white/65 px-3.5 py-2.5">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                                        <p className="mt-0.5 break-words text-[13px] leading-snug text-slate-800">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Divider />
                        <Typography.Title level={5} style={{ marginBottom: 6 }}>Abstract</Typography.Title>
                        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 14 }}>
                            Research summary and key findings
                        </Typography.Text>
                        <Typography.Paragraph
                            className="max-w-4xl"
                            style={{
                                whiteSpace: 'pre-line',
                                fontSize: 17,
                                lineHeight: 1.9,
                                color: '#334155',
                                marginBottom: 0,
                            }}
                        >
                            {proposal.abstract}
                        </Typography.Paragraph>
                    </Card>

                    {pdfOpen && proposal.file_path && (
                        <Card
                            ref={pdfCardRef}
                            className="admin-dashboard-shell"
                            bordered={false}
                            title={
                                <Space>
                                    <FilePdfOutlined style={{ color: '#0033a0' }} />
                                    <span>PDF Viewer</span>
                                </Space>
                            }
                            extra={
                                <Button size="small" onClick={() => setPdfOpen(false)}>Close</Button>
                            }
                        >
                            <iframe
                                src={route('research.file', proposal.id)}
                                title="Research PDF"
                                style={{ width: '100%', height: '80vh', border: 'none', borderRadius: 8 }}
                            />
                        </Card>
                    )}

                    {proposal.comments && (
                        <Alert
                            type="warning"
                            showIcon
                            message="Reviewer Comments"
                            description={
                                <div>
                                    <div style={{ whiteSpace: 'pre-line' }}>{proposal.comments}</div>
                                    {proposal.reviewer && (
                                        <div style={{ marginTop: 8, color: '#854d0e' }}>- {proposal.reviewer.name}</div>
                                    )}
                                </div>
                            }
                        />
                    )}

                    {/* Student: lock details + revision guidance */}
                    {!canEdit && isLockedForEditing && (
                        <Card
                            className="admin-dashboard-shell"
                            bordered={false}
                            title={
                                <Space>
                                    <LockOutlined style={{ color: '#d97706' }} />
                                    <span>Editing Locked</span>
                                </Space>
                            }
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                <Typography.Text type="secondary">
                                    {proposal.status === 'approved' &&
                                        'This research has been approved. If you need to make corrections, you can request edit permission from CHED.'}
                                    {proposal.status === 'rejected' &&
                                        'This research was rejected. You can edit it, then resubmit to restart the review from Faculty.'}
                                    {proposal.status === 'needs_revision' &&
                                        'Revision is required. Update your research and resubmit for review.'}
                                    {proposal.status === 'under_review_ched' && proposal.viewed_at &&
                                        'This submission is locked because CHED has already viewed it. You may request permission to edit from the reviewing CHED officer.'}
                                    {proposal.status === 'under_review_hei' &&
                                        'This submission is awaiting HEI review and is currently locked for editing.'}
                                    {proposal.status === 'under_review_faculty' &&
                                        'This submission is currently under Faculty review and cannot be edited.'}
                                </Typography.Text>

                                {/* No request yet, or previous was denied → show form */}
                                {(!editPermission || editPermission.status === 'denied') && (
                                    <Space direction="vertical" style={{ width: '100%' }} size={8}>
                                        {editPermission?.status === 'denied' && (
                                            <Alert
                                                type="error"
                                                showIcon
                                                message="Request Denied"
                                                description="Your previous edit permission request was denied. You may submit a new request below."
                                                style={{ marginBottom: 4 }}
                                            />
                                        )}
                                        <Input.TextArea
                                            rows={3}
                                            placeholder="Reason for edit request (optional)"
                                            value={editPermForm.data.reason}
                                            onChange={(e) => editPermForm.setData('reason', e.target.value)}
                                            maxLength={500}
                                            showCount
                                        />
                                        <Button
                                            type="primary"
                                            icon={<KeyOutlined />}
                                            loading={editPermForm.processing}
                                            onClick={() =>
                                                editPermForm.post(
                                                    route('research.edit-permission.store', proposal.id),
                                                    { onSuccess: () => editPermForm.reset() },
                                                )
                                            }
                                        >
                                            Request Edit Permission
                                        </Button>
                                    </Space>
                                )}

                                {/* Pending */}
                                {editPermission?.status === 'pending' && (
                                    <Alert
                                        type="info"
                                        showIcon
                                        message="Request Pending"
                                        description="Your edit permission request is awaiting CHED review."
                                    />
                                )}

                                {/* Approved — Edit button is already visible above */}
                                {editPermission?.status === 'approved' && (
                                    <Alert
                                        type="success"
                                        showIcon
                                        message="Permission Granted"
                                        description="CHED approved your request. Use the Edit button above to make your changes."
                                    />
                                )}
                            </Space>
                        </Card>
                    )}

                    {canEdit && proposal.status === 'rejected' && (
                        <Card className="admin-dashboard-shell" bordered={false} title="Revision Loop">
                            <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                <Typography.Text type="secondary">
                                    After finishing your edits, resubmit to restart the review pipeline from Faculty.
                                </Typography.Text>
                                <Popconfirm
                                    title="Resubmit this revised proposal?"
                                    description="This will reset approval trail timestamps and route it back to Faculty review."
                                    okText="Resubmit"
                                    onConfirm={() => router.post(route('research.resubmit', proposal.id))}
                                >
                                    <Button type="primary">Resubmit to Faculty</Button>
                                </Popconfirm>
                            </Space>
                        </Card>
                    )}

                    {/* CHED: pending edit permission requests */}
                    {pendingEditRequests?.length > 0 && (
                        <Card
                            className="admin-dashboard-shell"
                            bordered={false}
                            title={
                                <Space>
                                    <KeyOutlined style={{ color: '#d97706' }} />
                                    <span>Edit Permission Requests</span>
                                    <Tag color="orange">{pendingEditRequests.length}</Tag>
                                </Space>
                            }
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size={10}>
                                {pendingEditRequests.map((req) => (
                                    <div
                                        key={req.id}
                                        className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 bg-amber-50/50 px-4 py-3"
                                    >
                                        <div className="min-w-0">
                                            <Typography.Text strong>{req.requester?.name}</Typography.Text>
                                            {req.reason ? (
                                                <Typography.Paragraph
                                                    style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}
                                                >
                                                    {req.reason}
                                                </Typography.Paragraph>
                                            ) : (
                                                <Typography.Text
                                                    type="secondary"
                                                    style={{ display: 'block', fontSize: 13, marginTop: 2 }}
                                                >
                                                    No reason provided
                                                </Typography.Text>
                                            )}
                                        </div>
                                        <Space>
                                            <Popconfirm
                                                title="Approve this edit request?"
                                                description="The HEI will be able to edit this submission once."
                                                okText="Approve"
                                                onConfirm={() =>
                                                    router.post(
                                                        route('research.edit-permission.decide', {
                                                            proposal: proposal.id,
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
                                                            proposal: proposal.id,
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

                    {showReviewActions && (
                        <Card className="admin-dashboard-shell" bordered={false} title={reviewTitle}>
                            <Typography.Text type="secondary">
                                Use the Approve/Reject actions in the header area to review this submission.
                            </Typography.Text>
                        </Card>
                    )}

                    <Modal
                        title={rejectModalTitle}
                        open={rejectModal.open}
                        onCancel={closeRejectModal}
                        onOk={submitReject}
                        okText="Reject"
                        okButtonProps={{ danger: true, loading: isSubmittingReview }}
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

