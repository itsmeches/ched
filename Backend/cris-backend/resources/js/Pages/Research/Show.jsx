import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { StatusBadge } from '@/Components/StatusBadge';
import { formatDateTime } from '@/utils/date';
import { Alert, Button, Card, Divider, Input, Popconfirm, Space, Tag, Typography, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

export default function ResearchShow({ proposal, canEdit, canReview, canDelete }) {
    const { flash } = usePage().props;
    const reviewForm = useForm({ action: '', comments: '' });
    const deleteForm = useForm({});
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            message.success(flash.success);
        }
        if (flash?.error) {
            message.error(flash.error);
        }
    }, [flash?.success, flash?.error]);

    function submitReview(action) {
        setIsSubmittingReview(true);

        router.post(
            route('research.review', proposal.id),
            {
                action,
                comments: reviewForm.data.comments,
            },
            {
                onFinish: () => setIsSubmittingReview(false),
            },
        );
    }

    const metadataItems = [
        { label: 'Authors', value: proposal.authors },
        { label: 'Co-Authors', value: proposal.co_authors || '—' },
        { label: 'School', value: proposal.school || '—' },
        { label: 'Keywords', value: proposal.keywords || '—' },
        { label: 'Institution', value: proposal.institution?.name ?? '—' },
        { label: 'Submitted By', value: proposal.submitter?.name ?? '—' },
        { label: 'Viewed By CHED', value: proposal.viewer?.name ?? 'Not viewed yet' },
        { label: 'Viewed At', value: formatDateTime(proposal.viewed_at) || 'Not viewed yet' },
        { label: 'Approved By', value: proposal.approver?.name ?? '—' },
        { label: 'Approved At', value: formatDateTime(proposal.approved_at) || '—' },
    ];

    return (
        <AuthenticatedLayout header={
            <div className="flex items-center gap-3">
                <Link href={route('research.index')} className="text-sm text-slate-500 hover:text-slate-700">Back</Link>
                <h2 className="text-xl font-semibold text-slate-900 truncate">Research Record</h2>
            </div>
        }>
            <Head title={proposal.title} />

            <div className="space-y-6">
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
                                        <a href={route('research.file', proposal.id)} target="_blank" rel="noreferrer">
                                            <Button>View PDF</Button>
                                        </a>
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
                                </Space>
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

                    {!canEdit && proposal.status === 'pending' && proposal.viewed_at && (
                        <Alert
                            type="info"
                            showIcon
                            message="Editing Locked"
                            description="This submission can no longer be edited because CHED has already viewed it."
                        />
                    )}

                    {canReview && proposal.status === 'pending' && (
                        <Card className="admin-dashboard-shell" bordered={false} title="Review Decision">
                            <Space direction="vertical" style={{ width: '100%' }} size={16}>
                                <Input.TextArea
                                    rows={4}
                                    value={reviewForm.data.comments}
                                    onChange={(event) => reviewForm.setData('comments', event.target.value)}
                                    placeholder="Provide feedback to the researcher"
                                />
                                <Space>
                                    <Popconfirm
                                        title="Approve this submission?"
                                        onConfirm={() => submitReview('approve')}
                                        okText="Approve"
                                    >
                                        <Button type="primary" loading={isSubmittingReview}>
                                            Approve
                                        </Button>
                                    </Popconfirm>
                                    <Popconfirm
                                        title="Reject this submission?"
                                        onConfirm={() => submitReview('reject')}
                                        okText="Reject"
                                    >
                                        <Button danger loading={isSubmittingReview}>
                                            Reject
                                        </Button>
                                    </Popconfirm>
                                </Space>
                            </Space>
                        </Card>
                    )}
            </div>
        </AuthenticatedLayout>
    );
}
