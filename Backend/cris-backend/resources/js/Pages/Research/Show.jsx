import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { StatusBadge } from '@/Components/StatusBadge';
import { formatDateTime } from '@/utils/date';
import { Alert, Button, Card, Descriptions, Divider, Input, Popconfirm, Space, Typography, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useEffect } from 'react';

export default function ResearchShow({ proposal, canEdit, canReview }) {
    const { flash } = usePage().props;
    const reviewForm = useForm({ action: '', comments: '' });

    useEffect(() => {
        if (flash?.success) {
            message.success(flash.success);
        }
        if (flash?.error) {
            message.error(flash.error);
        }
    }, [flash?.success, flash?.error]);

    function submitReview(action) {
        reviewForm.setData('action', action);
        reviewForm.post(route('research.review', proposal.id));
    }

    return (
        <AuthenticatedLayout header={
            <div className="flex items-center gap-3">
                <Link href={route('research.index')} className="text-sm text-gray-500 hover:text-gray-700">Back</Link>
                <h2 className="text-xl font-semibold text-gray-800 truncate">{proposal.title}</h2>
                <StatusBadge status={proposal.status} />
            </div>
        }>
            <Head title={proposal.title} />

            <div className="py-8">
                <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {flash?.success && <Alert type="success" showIcon message={flash.success} />}
                    {flash?.error && <Alert type="error" showIcon message={flash.error} />}

                    <Card className="admin-dashboard-shell" bordered={false}>
                        <Descriptions column={{ xs: 1, md: 2 }}>
                            <Descriptions.Item label="Authors">{proposal.authors}</Descriptions.Item>
                            <Descriptions.Item label="Co-Authors">{proposal.co_authors || '—'}</Descriptions.Item>
                            <Descriptions.Item label="School">{proposal.school}</Descriptions.Item>
                            <Descriptions.Item label="Year">{proposal.year}</Descriptions.Item>
                            <Descriptions.Item label="Category">{proposal.category}</Descriptions.Item>
                            <Descriptions.Item label="Keywords">{proposal.keywords || '—'}</Descriptions.Item>
                            <Descriptions.Item label="Institution">{proposal.institution?.name ?? '—'}</Descriptions.Item>
                            <Descriptions.Item label="Submitted By">{proposal.submitter?.name ?? '—'}</Descriptions.Item>
                            <Descriptions.Item label="Approved By">{proposal.approver?.name ?? '—'}</Descriptions.Item>
                            <Descriptions.Item label="Approved At">{formatDateTime(proposal.approved_at)}</Descriptions.Item>
                        </Descriptions>

                        <Divider />
                        <Typography.Title level={5}>Abstract</Typography.Title>
                        <Typography.Paragraph style={{ whiteSpace: 'pre-line' }}>{proposal.abstract}</Typography.Paragraph>

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
                        </Space>
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
                                        <Button type="primary" loading={reviewForm.processing}>
                                            Approve
                                        </Button>
                                    </Popconfirm>
                                    <Popconfirm
                                        title="Reject this submission?"
                                        onConfirm={() => submitReview('reject')}
                                        okText="Reject"
                                    >
                                        <Button danger loading={reviewForm.processing}>
                                            Reject
                                        </Button>
                                    </Popconfirm>
                                </Space>
                            </Space>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
