import { Head, Link } from '@inertiajs/react';
import { formatDate } from '@/utils/date';
import { Alert, Button, Card, Divider, message, Space, Spin, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/utils/ThemeContext';
import { buildApa, buildBibtex, buildRis, downloadText } from '@/utils/citations';
import PublicSectionCard from '@/Components/Public/PublicSectionCard';
import PublicNav from '@/Components/Public/PublicNav';
import { StatusBadge } from '@/Components/StatusBadge';

export default function PublicResearchShow({ proposal, relatedProposals = [], canLogin, canRegister }) {
    const { dark } = useTheme();
    const [pdfOpen, setPdfOpen] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState(false);
    const [pdfViewerKey, setPdfViewerKey] = useState(0);
    const pdfSectionRef = useRef(null);

    useEffect(() => {
        if (!pdfOpen || !pdfLoading) return;

        const timeoutId = window.setTimeout(() => {
            setPdfLoading(false);
            setPdfError(true);
        }, 12000);

        return () => window.clearTimeout(timeoutId);
    }, [pdfOpen, pdfLoading]);

    useEffect(() => {
        if (!pdfOpen) return;

        // Wait for the PDF card to mount, then scroll it into view smoothly.
        const frameId = window.requestAnimationFrame(() => {
            pdfSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        return () => window.cancelAnimationFrame(frameId);
    }, [pdfOpen]);

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
                <PublicNav canLogin={canLogin} canRegister={canRegister} />

                <div className="mx-auto max-w-5xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
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
                                    <StatusBadge status={proposal.status || 'approved'} />
                                </Space>
                                <Typography.Text className="dark:!text-slate-300" style={{ display: 'block', color: '#475569', fontSize: 13 }}>
                                    by <span style={{ fontWeight: 600 }}>{proposal.authors}</span>
                                    {proposal.institution?.name && (
                                        <>
                                            {' '}·{' '}
                                            <Link href={route('research.public.institution', proposal.institution.id)} className="font-semibold text-[#0033a0] hover:underline dark:text-blue-300">
                                                {proposal.institution.name}
                                            </Link>
                                        </>
                                    )}
                                </Typography.Text>
                            </div>

                            {proposal.file_path && (
                                <Space wrap size={8}>
                                    <Button
                                        size="middle"
                                        type={pdfOpen ? 'primary' : 'default'}
                                        icon={<FilePdfOutlined />}
                                        onClick={() => {
                                            const nextOpen = !pdfOpen;
                                            setPdfOpen(nextOpen);
                                            if (nextOpen) {
                                                setPdfLoading(true);
                                                setPdfError(false);
                                                setPdfViewerKey((prev) => prev + 1);
                                            }
                                        }}
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
                                        <Typography.Title level={5} className="!mb-1 dark:!text-slate-100" style={{ color: '#0f172a' }}>Keywords</Typography.Title>
                                        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
                                            Click a keyword to browse related papers
                                        </Typography.Text>
                                        <Space wrap size={[6, 6]}>
                                            {keywordList.map((kw) => (
                                                <Link
                                                    key={kw}
                                                    href={`${route('research.public.index')}?search=${encodeURIComponent(kw)}`}
                                                >
                                                    <Tag
                                                        style={{ borderRadius: 999, padding: '2px 10px', cursor: 'pointer' }}
                                                        className="transition-colors hover:border-blue-400 hover:text-blue-600"
                                                    >
                                                        {kw}
                                                    </Tag>
                                                </Link>
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
                                                        {row.label === 'Institution' && proposal.institution?.id ? (
                                                            <Link href={route('research.public.institution', proposal.institution.id)} className="font-medium text-[#0033a0] hover:underline dark:text-blue-300">
                                                                {row.value}
                                                            </Link>
                                                        ) : row.value}
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
                        <div ref={pdfSectionRef} className="scroll-mt-24">
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
                                    <Button
                                        size="small"
                                        onClick={() => {
                                            setPdfOpen(false);
                                            setPdfLoading(false);
                                            setPdfError(false);
                                        }}
                                    >
                                        Close
                                    </Button>
                                }
                            >
                                {pdfLoading && (
                                    <div className="mb-3 flex items-center gap-2 text-slate-600 dark:text-slate-300" role="status" aria-live="polite">
                                        <Spin size="small" />
                                        <span>Loading PDF preview...</span>
                                    </div>
                                )}

                                {pdfError && (
                                    <Alert
                                        style={{ marginBottom: 12 }}
                                        type="warning"
                                        showIcon
                                        message="Preview unavailable"
                                        description="The PDF could not be displayed right now. You can retry the preview or use Download PDF."
                                        action={(
                                            <Button
                                                size="small"
                                                onClick={() => {
                                                    setPdfLoading(true);
                                                    setPdfError(false);
                                                    setPdfViewerKey((prev) => prev + 1);
                                                }}
                                            >
                                                Retry
                                            </Button>
                                        )}
                                    />
                                )}

                                <iframe
                                    key={pdfViewerKey}
                                    src={route('research.public.file', proposal.id)}
                                    title="Research PDF"
                                    onLoad={() => {
                                        setPdfLoading(false);
                                        setPdfError(false);
                                    }}
                                    onError={() => {
                                        setPdfLoading(false);
                                        setPdfError(true);
                                    }}
                                    style={{
                                        width: '100%',
                                        height: '70vh',
                                        border: 'none',
                                        borderRadius: 8,
                                        opacity: pdfLoading ? 0.55 : 1,
                                    }}
                                />
                            </Card>
                        </div>
                    )}

                    {relatedProposals.length > 0 && (
                        <PublicSectionCard
                            className="mt-2"
                            title="Related Papers"
                            subtitle="More approved research connected by institution, category, or discipline."
                        >
                            <div className="space-y-3">
                                {relatedProposals.map((item) => (
                                    <div key={item.id} className="rounded-xl border border-slate-200 px-4 py-3 dark:border-[#1e2d47]">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <Link href={route('research.public.show', item.id)} className="text-sm font-semibold text-[#0033a0] hover:underline dark:text-blue-300">
                                                    {item.title}
                                                </Link>
                                                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                    {item.authors || 'Unknown author'}
                                                    {item.institution?.name && <> · {item.institution.name}</>}
                                                    {item.year && <> · {item.year}</>}
                                                </div>
                                            </div>
                                            <Link href={route('research.public.show', item.id)}>
                                                <Button size="small">Open</Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </PublicSectionCard>
                    )}
                </div>
            </div>
        </>
    );
}
