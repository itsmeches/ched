import { Link, router } from '@inertiajs/react';
import { Button, Popconfirm, Space, Tag, Typography } from 'antd';
import { DownloadOutlined, FilePdfOutlined } from '@ant-design/icons';
import { Card } from 'antd';
import { StatusBadge } from '@/Components/StatusBadge';
import { formatDateTime } from '@/utils/date';

function formatContact(email, phone) {
    const parts = [email, phone].map((v) => (v || '').trim()).filter(Boolean);
    return parts.length > 0 ? parts.join(' · ') : null;
}

function buildSidebarSections(proposal) {
    return [
        {
            title: 'Authors',
            rows: [
                {
                    label: 'Author',
                    value: proposal.authors,
                    sub: formatContact(proposal.author_email, proposal.author_phone),
                },
                {
                    label: 'Co-Authors',
                    value: proposal.co_authors || '—',
                    sub: formatContact(proposal.co_author_emails, proposal.co_author_phones),
                },
            ],
        },
        {
            title: 'Classification',
            rows: [
                { label: 'Category', value: proposal.category || '—' },
                { label: 'Year', value: proposal.year ? String(proposal.year) : '—' },
            ],
        },
        {
            title: 'Publication',
            rows: [
                { label: 'Institution', value: proposal.institution?.name ?? '—' },
                { label: 'School', value: proposal.school || '—' },
            ],
        },
        {
            title: 'Workflow',
            rows: [
                { label: 'Submitted By', value: proposal.submitter?.name ?? '—' },
                {
                    label: 'Viewed By CHED',
                    value: proposal.viewer?.name ?? 'Not viewed yet',
                    sub: formatDateTime(proposal.viewed_at) || null,
                },
                {
                    label: 'Last Action',
                    value: proposal.last_action_by || '—',
                    sub: formatDateTime(proposal.last_action_at) || null,
                },
                {
                    label: 'Approved By',
                    value: proposal.approver?.name ?? '—',
                    sub: formatDateTime(proposal.approved_at) || null,
                },
            ],
        },
    ];
}

function buildAuditSummary(proposal) {
    return [
        { label: 'Current Stage', value: proposal.current_stage || '—' },
        { label: 'Last Reviewer', value: proposal.last_reviewer || '—' },
        { label: 'Last Decision Time', value: formatDateTime(proposal.last_decision_time) || '—' },
        { label: 'Remarks', value: proposal.remarks || '—' },
    ];
}

export default function ResearchHeader({
    proposal,
    canEdit,
    canDelete,
    canShowEditButton,
    showReviewActions,
    pdfOpen,
    isSubmittingReview,
    deleteProcessing,
    onTogglePdf,
    onApprove,
    onOpenReject,
    onDelete,
}) {
    const keywordList = String(proposal.keywords || '')
        .split(/[,;]/)
        .map((k) => k.trim())
        .filter(Boolean);

    const sidebarSections = buildSidebarSections(proposal);
    const auditSummaryItems = buildAuditSummary(proposal);

    return (
        <Card id="research-actions" className="admin-dashboard-shell" bordered={false}>
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
                                onClick={onTogglePdf}
                            >
                                {pdfOpen ? 'Hide PDF' : 'View PDF'}
                            </Button>
                        )}

                        {proposal.file_path && (
                            <a
                                href={route('research.file', {
                                    proposal: proposal.id,
                                    download: 1,
                                })}
                            >
                                <Button icon={<DownloadOutlined />}>Download PDF</Button>
                            </a>
                        )}

                        {canEdit && proposal.status === 'rejected' && (
                            <Popconfirm
                                title="Resubmit this revised proposal?"
                                description="This will reset approval trail timestamps and route it back to Faculty review."
                                okText="Resubmit"
                                onConfirm={() =>
                                    router.post(route('research.resubmit', proposal.id))
                                }
                            >
                                <Button type="primary">Resubmit to Faculty</Button>
                            </Popconfirm>
                        )}

                        {canShowEditButton && (
                            <Link href={route('research.edit', proposal.id)}>
                                <Button className="edit-action-btn">Edit</Button>
                            </Link>
                        )}

                        {canDelete && (
                            <Popconfirm
                                title="Delete this research record?"
                                description="This action cannot be undone."
                                okText="Delete"
                                okButtonProps={{ danger: true, loading: deleteProcessing }}
                                onConfirm={onDelete}
                            >
                                <Button danger loading={deleteProcessing}>
                                    Delete
                                </Button>
                            </Popconfirm>
                        )}

                        {showReviewActions && (
                            <>
                                <Popconfirm
                                    title="Approve this submission?"
                                    onConfirm={onApprove}
                                    okText="Approve"
                                >
                                    <Button type="primary" loading={isSubmittingReview}>
                                        Approve
                                    </Button>
                                </Popconfirm>
                                <Button danger loading={isSubmittingReview} onClick={onOpenReject}>
                                    Reject
                                </Button>
                            </>
                        )}
                    </Space>
                </div>

                <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/65 dark:bg-blue-950/30 p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                        Audit Summary
                    </p>
                    <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                        {auditSummaryItems.map((item) => (
                            <div
                                key={item.label}
                                className="rounded-xl border border-blue-200/80 dark:border-blue-900/40 bg-white/80 dark:bg-[#111827] px-3 py-2"
                            >
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                    {item.label}
                                </p>
                                <p className="mt-0.5 break-words text-[13px] leading-snug text-slate-800 dark:text-slate-200">
                                    {item.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <section>
                            <Typography.Title level={5} style={{ marginBottom: 4 }}>
                                Abstract
                            </Typography.Title>
                            <Typography.Text
                                type="secondary"
                                style={{ display: 'block', marginBottom: 10, fontSize: 12 }}
                            >
                                Research summary and key findings
                            </Typography.Text>
                            <Typography.Paragraph
                                style={{
                                    whiteSpace: 'pre-line',
                                    fontSize: 15,
                                    lineHeight: 1.85,
                                    marginBottom: 0,
                                }}
                            >
                                {proposal.abstract || (
                                    <Typography.Text type="secondary">
                                        No abstract provided.
                                    </Typography.Text>
                                )}
                            </Typography.Paragraph>
                        </section>

                        {keywordList.length > 0 && (
                            <section>
                                <Typography.Title level={5} style={{ marginBottom: 8 }}>
                                    Keywords
                                </Typography.Title>
                                <Space wrap size={[6, 6]}>
                                    {keywordList.map((kw) => (
                                        <Tag
                                            key={kw}
                                            style={{ borderRadius: 999, padding: '2px 10px' }}
                                        >
                                            {kw}
                                        </Tag>
                                    ))}
                                </Space>
                            </section>
                        )}
                    </div>

                    <aside className="space-y-4 lg:border-l lg:border-slate-200/80 lg:pl-6 dark:lg:border-[#1e2d47]">
                        {sidebarSections.map((section) => (
                            <div key={section.title}>
                                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    {section.title}
                                </p>
                                <dl className="space-y-2">
                                    {section.rows.map((row) => (
                                        <div key={row.label}>
                                            <dt className="text-[11px] text-slate-500 dark:text-slate-400">
                                                {row.label}
                                            </dt>
                                            <dd className="break-words text-[13px] leading-snug text-slate-800 dark:text-slate-200">
                                                {row.value}
                                                {row.sub && (
                                                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                                                        {row.sub}
                                                    </span>
                                                )}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        ))}
                    </aside>
                </div>
            </div>
        </Card>
    );
}
