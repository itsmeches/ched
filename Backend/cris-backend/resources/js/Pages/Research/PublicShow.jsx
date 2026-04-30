import { Head, Link, usePage } from '@inertiajs/react';
import { formatDate } from '@/utils/date';
import { Button, Card, Divider, Space, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useState } from 'react';

export default function PublicResearchShow({ proposal, canLogin, canRegister }) {
    const { auth } = usePage().props;
    const [pdfOpen, setPdfOpen] = useState(false);

    function formatDisciplineLabel(value) {
        if (!value) return '—';
        return String(value).replace(/^\s*\d+\s*-\s*/, '');
    }

    const metadataItems = [
        { label: 'Author', value: proposal.authors },
        { label: 'Author Email', value: proposal.author_email || '—' },
        // { label: 'Author Phone', value: proposal.author_phone || '—' },
        { label: 'Co-Authors', value: proposal.co_authors || '—' },
        { label: 'Co-Author Emails', value: proposal.co_author_emails || '—' },
        // { label: 'Co-Author Phones', value: proposal.co_author_phones || '—' },
        { label: 'Research Category', value: proposal.research_category || proposal.category || '—' },
        { label: 'Discipline', value: formatDisciplineLabel(proposal.discipline_label) },
        { label: 'School', value: proposal.school || '—' },
        { label: 'Keywords', value: proposal.keywords || '—' },
        { label: 'Institution', value: proposal.institution?.name ?? '—' },
        { label: 'Approved By', value: proposal.approver?.name ?? '—' },
        { label: 'Approved At', value: formatDate(proposal.approved_at) || '—' },
    ];

    return (
        <>
            <Head title={`${proposal.title} — CRIS`} />

            <div
                style={{
                    minHeight: '100vh',
                    background:
                        'radial-gradient(circle at 0% 0%, rgba(14, 116, 144, 0.18), transparent 28%), radial-gradient(circle at 100% 0%, rgba(217, 119, 6, 0.16), transparent 30%), linear-gradient(180deg, #f8fbfd 0%, #edf4f7 100%)',
                }}
            >
                <div className="mx-auto max-w-5xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
                    <header style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <div>
                                <Space size={10} align="center" style={{ marginBottom: 2 }}>
                                    <Tag style={{ borderRadius: 999, fontWeight: 700, marginInlineEnd: 0, backgroundColor: '#0033a0', color: '#fff', border: 'none' }}>
                                        CRIS
                                    </Tag>
                                    <Typography.Title level={4} style={{ margin: 0, color: '#0f172a' }}>
                                        CALABARZON Research Information System
                                    </Typography.Title>
                                </Space>
                                <Typography.Paragraph style={{ color: '#475569', margin: '4px 0 0', display: 'block' }}>
                                    Public catalog of approved research papers for Region IV-A institutions.
                                </Typography.Paragraph>
                            </div>
                            <Space style={{ marginLeft: 'auto' }}>
                                {auth?.user ? (
                                    <Link href={route('dashboard')}>
                                        <Button type="primary">Dashboard</Button>
                                    </Link>
                                ) : (
                                    <>
                                        {canLogin && (
                                            <Link href={route('login')}>
                                                <Button>Log in</Button>
                                            </Link>
                                        )}
                                        {canRegister && (
                                            <Link href={route('register')}>
                                                <Button type="primary">Register</Button>
                                            </Link>
                                        )}
                                    </>
                                )}
                            </Space>
                        </div>
                    </header>

                    <div style={{ marginBottom: 8 }}>
                        <Link href={route('research.public.index')}>
                            <Button size="small" icon={<ArrowLeftOutlined />}>Back to Archive</Button>
                        </Link>
                    </div>

                    <Card
                        className="admin-dashboard-shell"
                        bordered={false}
                        style={{ borderRadius: 14, border: '1px solid #dbeafe', boxShadow: '0 7px 20px rgba(0, 51, 160, 0.08)' }}
                        bodyStyle={{ padding: 12 }}
                    >
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="min-w-0 space-y-1.5">
                                    <Typography.Title level={4} style={{ margin: 0, color: '#0f172a' }}>
                                        {proposal.title}
                                    </Typography.Title>
                                    <Space wrap size={[8, 8]}>
                                        {proposal.year && <Tag color="blue">Year {proposal.year}</Tag>}
                                        {(proposal.research_category || proposal.category) && <Tag color="geekblue">{proposal.research_category || proposal.category}</Tag>}
                                        {proposal.discipline_label && <Tag color="cyan">{formatDisciplineLabel(proposal.discipline_label)}</Tag>}
                                        <Tag style={{ backgroundColor: '#0033a0', color: '#fff', border: 'none' }}>Approved</Tag>
                                    </Space>
                                </div>

                                {proposal.file_path && (
                                    <Space wrap size={8}>
                                        <Button
                                            size="middle"
                                            type={pdfOpen ? 'primary' : 'default'}
                                            icon={<FilePdfOutlined />}
                                            onClick={() => setPdfOpen((prev) => !prev)}
                                        >
                                            {pdfOpen ? 'Hide PDF' : 'View PDF'}
                                        </Button>
                                        <a href={route('research.public.file', { proposal: proposal.id, download: 1 })}>
                                            <Button size="middle" icon={<FilePdfOutlined />}>Download PDF</Button>
                                        </a>
                                    </Space>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                                {metadataItems.map((item) => (
                                    <div key={item.label} className="rounded-lg border border-slate-200/80 bg-white/75 px-3 py-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                                        <p className="mt-0.5 break-words text-[12.5px] leading-snug text-slate-800">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Divider style={{ margin: '12px 0 10px' }} />
                        <Typography.Title level={5} style={{ marginBottom: 2, color: '#0f172a' }}>Abstract</Typography.Title>
                        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                            Research summary and key findings
                        </Typography.Text>
                        <Typography.Paragraph
                            className="max-w-4xl"
                            style={{
                                whiteSpace: 'pre-line',
                                fontSize: 15,
                                lineHeight: 1.75,
                                color: '#334155',
                                marginBottom: 0,
                            }}
                        >
                            {proposal.abstract}
                        </Typography.Paragraph>
                    </Card>

                    {pdfOpen && proposal.file_path && (
                        <Card
                            className="admin-dashboard-shell"
                            bordered={false}
                            style={{ marginTop: 10, borderRadius: 14, border: '1px solid #dbeafe' }}
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
                                src={route('research.public.file', proposal.id)}
                                title="Research PDF"
                                style={{ width: '100%', height: '70vh', border: 'none', borderRadius: 8 }}
                            />
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}
