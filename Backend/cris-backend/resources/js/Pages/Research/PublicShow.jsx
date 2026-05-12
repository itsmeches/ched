import { Head, Link, usePage } from '@inertiajs/react';
import { formatDate } from '@/utils/date';
import { Button, Card, Divider, message, Space, Tag, Tooltip, Typography } from 'antd';
import { ArrowLeftOutlined, FilePdfOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useTheme } from '@/utils/ThemeContext';
import { buildApa, buildBibtex, buildRis, downloadText } from '@/utils/citations';

export default function PublicResearchShow({ proposal, canLogin, canRegister }) {
    const { auth } = usePage().props;
    const { dark, toggleDark } = useTheme();
    const [pdfOpen, setPdfOpen] = useState(false);

    function formatDisciplineLabel(value) {
        if (!value) return '—';
        return String(value).replace(/^\s*\d+\s*-\s*/, '');
    }

    const keywordList = String(proposal.keywords || '')
        .split(/[,;]/)
        .map((k) => k.trim())
        .filter(Boolean);

    const sidebarSections = [
        {
            title: 'Authors',
            rows: [
                { label: 'Author', value: proposal.authors, sub: proposal.author_email },
                { label: 'Co-Authors', value: proposal.co_authors || '—', sub: proposal.co_author_emails },
            ],
        },
        {
            title: 'Classification',
            rows: [
                { label: 'Category', value: proposal.research_category || proposal.category || '—' },
                { label: 'Discipline', value: formatDisciplineLabel(proposal.discipline_label) },
            ],
        },
        {
            title: 'Publication',
            rows: [
                { label: 'Institution', value: proposal.institution?.name ?? '—' },
                { label: 'School', value: proposal.school || '—' },
                { label: 'Year', value: proposal.year ? String(proposal.year) : '—' },
            ],
        },
        {
            title: 'Approval',
            rows: [
                { label: 'Approved By', value: proposal.approver?.name ?? '—' },
                { label: 'Approved At', value: formatDate(proposal.approved_at) || '—' },
            ],
        },
    ];

    return (
        <>
            <Head title={`${proposal.title} — CRIS`}>
                <meta name="description" content={(proposal.abstract || '').slice(0, 200)} />
                <meta property="og:type" content="article" />
                <meta property="og:title" content={proposal.title} />
                <meta property="og:description" content={(proposal.abstract || '').slice(0, 200)} />
                <meta property="og:site_name" content="CRIS — CALABARZON Research Information System" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={proposal.title} />
                <meta name="twitter:description" content={(proposal.abstract || '').slice(0, 200)} />
                {proposal.authors && <meta name="citation_authors" content={proposal.authors} />}
                {proposal.year && <meta name="citation_publication_date" content={String(proposal.year)} />}
                {proposal.institution?.name && <meta name="citation_publisher" content={proposal.institution.name} />}
                <meta name="citation_title" content={proposal.title} />
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'ScholarlyArticle',
                        headline: proposal.title,
                        name: proposal.title,
                        abstract: proposal.abstract || undefined,
                        author: (proposal.authors || '')
                            .split(/[,;]/)
                            .map((name) => name.trim())
                            .filter(Boolean)
                            .map((name) => ({ '@type': 'Person', name })),
                        datePublished: proposal.approved_at || (proposal.year ? `${proposal.year}-01-01` : undefined),
                        publisher: proposal.institution?.name
                            ? { '@type': 'Organization', name: proposal.institution.name }
                            : undefined,
                        keywords: proposal.keywords || undefined,
                        inLanguage: 'en',
                    })}
                </script>
            </Head>

            <div className={`min-h-screen transition-colors duration-300 ${dark ? 'bg-[#0a0f1e]' : ''}`}
                style={dark ? undefined : {
                    background: 'radial-gradient(circle at 0% 0%, rgba(14, 116, 144, 0.18), transparent 28%), radial-gradient(circle at 100% 0%, rgba(217, 119, 6, 0.16), transparent 30%), linear-gradient(180deg, #f8fbfd 0%, #edf4f7 100%)',
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
                                    <Typography.Title level={4} className="!m-0 dark:!text-slate-100" style={{ color: '#0f172a' }}>
                                        CALABARZON Research Information System
                                    </Typography.Title>
                                </Space>
                                <Typography.Paragraph className="!mt-1 !mb-0 dark:!text-slate-400" style={{ color: '#475569' }}>
                                    Public catalog of approved research papers for Region IV-A institutions.
                                </Typography.Paragraph>
                            </div>
                            <Space style={{ marginLeft: 'auto' }}>
                                <Tooltip title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
                                    <Button
                                        shape="circle"
                                        icon={dark ? <SunOutlined /> : <MoonOutlined />}
                                        onClick={toggleDark}
                                        aria-label="Toggle dark mode"
                                    />
                                </Tooltip>
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
                        style={{ borderRadius: 14, boxShadow: '0 7px 20px rgba(0, 51, 160, 0.08)' }}
                        styles={{ body: { padding: 16 } }}
                    >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="min-w-0 flex-1 space-y-2">
                                <Typography.Title level={3} className="!m-0 dark:!text-slate-100" style={{ color: '#0f172a', lineHeight: 1.25 }}>
                                    {proposal.title}
                                </Typography.Title>
                                <Space wrap size={[6, 6]}>
                                    {proposal.year && <Tag color="blue">Year {proposal.year}</Tag>}
                                    {(proposal.research_category || proposal.category) && <Tag color="geekblue">{proposal.research_category || proposal.category}</Tag>}
                                    {proposal.discipline_label && <Tag color="cyan">{formatDisciplineLabel(proposal.discipline_label)}</Tag>}
                                    <Tag style={{ backgroundColor: '#0033a0', color: '#fff', border: 'none' }}>Approved</Tag>
                                </Space>
                                <Typography.Text className="dark:!text-slate-300" style={{ display: 'block', color: '#475569', fontSize: 13 }}>
                                    by <span style={{ fontWeight: 600 }}>{proposal.authors}</span>
                                    {proposal.institution?.name && <> · {proposal.institution.name}</>}
                                </Typography.Text>
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

                        <Divider style={{ margin: '16px 0' }} />

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2 space-y-6">
                                <section>
                                    <Typography.Title level={5} className="!mb-1 dark:!text-slate-100" style={{ color: '#0f172a' }}>Abstract</Typography.Title>
                                    <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 10, fontSize: 12 }}>
                                        Research summary and key findings
                                    </Typography.Text>
                                    <Typography.Paragraph
                                        className="dark:!text-slate-300"
                                        style={{
                                            whiteSpace: 'pre-line',
                                            fontSize: 15,
                                            lineHeight: 1.75,
                                            color: '#334155',
                                            marginBottom: 0,
                                        }}
                                    >
                                        {proposal.abstract || <span style={{ color: '#94a3b8' }}>No abstract provided.</span>}
                                    </Typography.Paragraph>
                                </section>

                                {keywordList.length > 0 && (
                                    <section>
                                        <Typography.Title level={5} className="!mb-2 dark:!text-slate-100" style={{ color: '#0f172a' }}>Keywords</Typography.Title>
                                        <Space wrap size={[6, 6]}>
                                            {keywordList.map((kw) => (
                                                <Tag key={kw} style={{ borderRadius: 999, padding: '2px 10px' }}>{kw}</Tag>
                                            ))}
                                        </Space>
                                    </section>
                                )}

                                <section>
                                    <Typography.Title level={5} className="!mb-1 dark:!text-slate-100" style={{ color: '#0f172a' }}>Cite this paper</Typography.Title>
                                    <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 10, fontSize: 12 }}>
                                        Copy or download the citation in your preferred format.
                                    </Typography.Text>
                                    <Space wrap>
                                        <Button
                                            onClick={async () => {
                                                await navigator.clipboard.writeText(buildApa(proposal));
                                                message.success('APA citation copied');
                                            }}
                                        >
                                            Copy APA
                                        </Button>
                                        <Button
                                            onClick={() => downloadText(`${proposal.id}.bib`, buildBibtex(proposal), 'application/x-bibtex')}
                                        >
                                            Download BibTeX
                                        </Button>
                                        <Button
                                            onClick={() => downloadText(`${proposal.id}.ris`, buildRis(proposal), 'application/x-research-info-systems')}
                                        >
                                            Download RIS
                                        </Button>
                                    </Space>
                                </section>
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
                                                    <dt className="text-[11px] text-slate-500 dark:text-slate-400">{row.label}</dt>
                                                    <dd className="break-words text-[13px] leading-snug text-slate-800 dark:text-slate-200">
                                                        {row.value}
                                                        {row.sub && (
                                                            <span className="block text-[11px] text-slate-500 dark:text-slate-400">{row.sub}</span>
                                                        )}
                                                    </dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </div>
                                ))}
                            </aside>
                        </div>
                    </Card>

                    {pdfOpen && proposal.file_path && (
                        <Card
                            className="admin-dashboard-shell"
                            bordered={false}
                            style={{ marginTop: 10, borderRadius: 14 }}
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
