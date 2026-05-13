import { Head, Link, router } from '@inertiajs/react';
import { Button, Card, Pagination, Space, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, BankOutlined, CalendarOutlined, EnvironmentOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useTheme } from '@/utils/ThemeContext';
import PublicSectionCard from '@/Components/Public/PublicSectionCard';
import PublicNav from '@/Components/Public/PublicNav';
import EmptyState from '@/Components/EmptyState';
import { StatusBadge } from '@/Components/StatusBadge';

export default function PublicInstitution({ institution, papers, stats, canLogin, canRegister }) {
    const { dark } = useTheme();

    return (
        <>
            <Head title={`${institution.name} — CRIS`} />

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

                    <Card className="admin-dashboard-shell" bordered={false} style={{ borderRadius: 14, boxShadow: '0 7px 20px rgba(0, 51, 160, 0.08)' }} styles={{ body: { padding: 20 } }}>
                        <div className="space-y-5">
                            <div className={`rounded-2xl border p-4 ${dark ? 'border-[#1e2d47] bg-[#0d1526]' : 'border-slate-200 bg-white'}`}>
                                <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
                                    <div className="min-w-0 lg:col-span-2">
                                        <Space wrap size={[8, 8]} style={{ marginBottom: 10 }}>
                                            <Tag style={{ borderRadius: 999, paddingInline: 12, paddingBlock: 4, backgroundColor: '#0033a0', color: '#fff', border: 'none', marginInlineEnd: 0 }}>
                                                Institution Profile
                                            </Tag>
                                            {institution.code && <Tag color="blue">{institution.code}</Tag>}
                                        </Space>
                                        <Typography.Title level={2} className="!mb-1 dark:!text-slate-100">{institution.name}</Typography.Title>
                                        <Typography.Paragraph className="!mb-0 dark:!text-slate-400" style={{ color: '#475569', maxWidth: 760 }}>
                                            Approved research outputs, publication trends, and discovery links for this institution in the CRIS public archive.
                                        </Typography.Paragraph>

                                        {stats.top_categories?.length > 0 && (
                                            <div className="mt-4">
                                                <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 8 }}>
                                                    Top Research Categories
                                                </Typography.Text>
                                                <div className="flex flex-wrap gap-2">
                                                    {stats.top_categories.map((item) => (
                                                        <span key={item.label} className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${dark ? 'border-blue-800/60 bg-blue-950/35 text-blue-100' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
                                                            {item.label} ({item.total})
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {(institution.contact_email || institution.contact_phone) && (
                                        <div className={`self-start rounded-2xl border px-4 py-3 text-sm ${dark ? 'border-[#2a3a5c] bg-[#111827] text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                                            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Get in Touch</div>
                                            {institution.contact_email && (
                                                <div className="mb-1 flex items-center gap-2 break-all">
                                                    <MailOutlined className="text-slate-400" />
                                                    <span>{institution.contact_email}</span>
                                                </div>
                                            )}
                                            {institution.contact_phone && (
                                                <div className="flex items-center gap-2">
                                                    <PhoneOutlined className="text-slate-400" />
                                                    <span>{institution.contact_phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <div className={`rounded-2xl border px-4 py-3 ${dark ? 'border-blue-900/40 bg-blue-950/20' : 'border-blue-200/80 bg-blue-50/70'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Approved Papers</div>
                                        <BankOutlined className="text-slate-400" />
                                    </div>
                                    <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.approved_count}</div>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-[#1e2d47] dark:bg-[#111827]">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Latest Year</div>
                                        <CalendarOutlined className="text-slate-400" />
                                    </div>
                                    <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.latest_year || '—'}</div>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-[#1e2d47] dark:bg-[#111827]">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Address</div>
                                        <EnvironmentOutlined className="text-slate-400" />
                                    </div>
                                    <div className="mt-1 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-200">{institution.address || 'Not provided'}</div>
                                </div>
                            </div>

                        </div>
                    </Card>

                    <PublicSectionCard
                        className="mt-6"
                        title="Published Research"
                        subtitle="Browse approved papers linked to this institution."
                        extra={<Tag color="geekblue" style={{ marginInlineEnd: 0 }}>{papers.total} total</Tag>}
                    >
                        {papers.data.length === 0 ? (
                            <EmptyState
                                title="No published research yet"
                                description="This institution does not have approved papers in the archive yet."
                                action={(
                                    <Link href={route('research.public.index')}>
                                        <Button type="primary" size="small">Browse Archive</Button>
                                    </Link>
                                )}
                            />
                        ) : (
                            <div className="space-y-3">
                                {papers.data.map((paper) => (
                                    <Card key={paper.id} className="admin-dashboard-shell border border-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-[#1e2d47]" bordered={false} styles={{ body: { padding: 18 } }}>
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0 flex-1 space-y-2">
                                                <Link href={route('research.public.show', paper.id)} className="block text-base font-semibold text-[#0033a0] hover:underline dark:text-blue-300">
                                                    {paper.title}
                                                </Link>
                                                <div className="text-sm text-slate-600 dark:text-slate-300">
                                                    {paper.authors || 'Unknown author'}
                                                    {paper.school && <> · {paper.school}</>}
                                                    {paper.year && <> · {paper.year}</>}
                                                </div>
                                                <Space wrap size={[6, 6]}>
                                                    {(paper.research_category || paper.category) && <Tag color="geekblue">{paper.research_category || paper.category}</Tag>}
                                                    <StatusBadge status={paper.status || 'approved'} />
                                                </Space>
                                            </div>
                                            <Link href={route('research.public.show', paper.id)}>
                                                <Button type="primary">Open Paper</Button>
                                            </Link>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </PublicSectionCard>

                    {papers.last_page > 1 && (
                        <div className="mt-8 flex justify-center">
                            <Pagination
                                current={papers.current_page}
                                pageSize={papers.per_page}
                                total={papers.total}
                                onChange={(page) => router.get(route('research.public.institution', institution.id), { page }, { preserveScroll: true, preserveState: true, replace: true })}
                                showSizeChanger={false}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}