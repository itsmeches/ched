import { Head, Link, usePage } from '@inertiajs/react';
import { formatDate } from '@/utils/date';
import { Button, Card, Divider, Space, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, FilePdfOutlined } from '@ant-design/icons';

export default function PublicResearchShow({ proposal, canLogin, canRegister }) {
    const { auth } = usePage().props;
    const metadataItems = [
        { label: 'Authors', value: proposal.authors },
        { label: 'Co-Authors', value: proposal.co_authors || '—' },
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
                <div className="mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
                    <header style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <div>
                                <Space size={10} align="center" style={{ marginBottom: 2 }}>
                                    <Tag color="cyan" style={{ borderRadius: 999, fontWeight: 700, marginInlineEnd: 0 }}>
                                        CRIS
                                    </Tag>
                                    <Typography.Title level={4} style={{ margin: 0, color: '#0f172a' }}>
                                        Calabarzon Research Information System
                                    </Typography.Title>
                                </Space>
                                <Typography.Paragraph style={{ color: '#475569', margin: '4px 0 0', display: 'block' }}>
                                    Public catalog of approved research papers for Region IV-A institutions.
                                </Typography.Paragraph>
                            </div>
                            <Space>
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

                    <div style={{ marginBottom: 16 }}>
                        <Link href={route('research.public.index')}>
                            <Button icon={<ArrowLeftOutlined />}>Back to Archive</Button>
                        </Link>
                    </div>

                    <Card className="admin-dashboard-shell" bordered={false}>
                        <div className="space-y-5">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="min-w-0 space-y-2">
                                    <Typography.Title level={3} style={{ margin: 0 }}>
                                        {proposal.title}
                                    </Typography.Title>
                                    <Space wrap size={[8, 8]}>
                                        {proposal.year && <Tag color="blue">Year {proposal.year}</Tag>}
                                        {proposal.category && <Tag color="geekblue">{proposal.category}</Tag>}
                                        <Tag color="green">Approved</Tag>
                                    </Space>
                                </div>

                                {proposal.file_path && (
                                    <Space wrap>
                                        <a href={route('research.public.file', proposal.id)} target="_blank" rel="noreferrer">
                                            <Button type="primary" icon={<FilePdfOutlined />}>Open PDF</Button>
                                        </a>
                                        <a href={route('research.public.file', { proposal: proposal.id, download: 1 })}>
                                            <Button icon={<FilePdfOutlined />}>Download PDF</Button>
                                        </a>
                                    </Space>
                                )}
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
                </div>
            </div>
        </>
    );
}
