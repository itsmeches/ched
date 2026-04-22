import { Head, Link, usePage } from '@inertiajs/react';
import { formatDate } from '@/utils/date';
import { Button, Card, Descriptions, Divider, Space, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, FilePdfOutlined } from '@ant-design/icons';

export default function PublicResearchShow({ proposal, canLogin, canRegister }) {
    const { auth } = usePage().props;

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
                        <Typography.Title level={3} style={{ marginTop: 0 }}>
                            {proposal.title}
                        </Typography.Title>

                        <Descriptions column={{ xs: 1, md: 2 }} style={{ marginTop: 12 }}>
                            <Descriptions.Item label="Authors">{proposal.authors}</Descriptions.Item>
                            <Descriptions.Item label="Co-Authors">{proposal.co_authors || '—'}</Descriptions.Item>
                            <Descriptions.Item label="School">{proposal.school}</Descriptions.Item>
                            <Descriptions.Item label="Year">{proposal.year}</Descriptions.Item>
                            <Descriptions.Item label="Keywords">{proposal.keywords || '—'}</Descriptions.Item>
                            <Descriptions.Item label="Institution">{proposal.institution?.name ?? '—'}</Descriptions.Item>
                            <Descriptions.Item label="Approved By">{proposal.approver?.name ?? '—'}</Descriptions.Item>
                            <Descriptions.Item label="Approved At">
                                {formatDate(proposal.approved_at)}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />
                        <Typography.Title level={5}>Abstract</Typography.Title>
                        <Typography.Paragraph style={{ whiteSpace: 'pre-line' }}>{proposal.abstract}</Typography.Paragraph>

                        {proposal.file_path && (
                            <Space wrap style={{ marginTop: 8 }}>
                                <a href={route('research.public.file', proposal.id)} target="_blank" rel="noreferrer">
                                    <Button type="primary" icon={<FilePdfOutlined />}>Open PDF</Button>
                                </a>
                                <a href={route('research.public.file', { proposal: proposal.id, download: 1 })}>
                                    <Button icon={<FilePdfOutlined />}>Download PDF</Button>
                                </a>
                            </Space>
                        )}
                    </Card>
                </div>
            </div>
        </>
    );
}
