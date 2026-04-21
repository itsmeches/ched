import { Head, Link } from '@inertiajs/react';
import { Button, Card, Descriptions, Divider, Space, Typography } from 'antd';

export default function PublicResearchShow({ proposal }) {
    return (
        <>
            <Head title={proposal.title} />

            <div className="py-10">
                <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <Space>
                        <Link href={route('research.public.index')}>Back to Public Archive</Link>
                        <Link href={route('login')}>
                            <Button size="small">Login</Button>
                        </Link>
                    </Space>

                    <Card className="admin-dashboard-shell" bordered={false}>
                        <Typography.Title level={3} style={{ marginTop: 0 }}>
                            {proposal.title}
                        </Typography.Title>

                        <Descriptions column={{ xs: 1, md: 2 }}>
                            <Descriptions.Item label="Authors">{proposal.authors}</Descriptions.Item>
                            <Descriptions.Item label="Co-Authors">{proposal.co_authors || '—'}</Descriptions.Item>
                            <Descriptions.Item label="School">{proposal.school}</Descriptions.Item>
                            <Descriptions.Item label="Year">{proposal.year}</Descriptions.Item>
                            <Descriptions.Item label="Keywords">{proposal.keywords || '—'}</Descriptions.Item>
                            <Descriptions.Item label="Institution">{proposal.institution?.name ?? '—'}</Descriptions.Item>
                            <Descriptions.Item label="Approved By">{proposal.approver?.name ?? '—'}</Descriptions.Item>
                            <Descriptions.Item label="Approved At">{proposal.approved_at ? new Date(proposal.approved_at).toLocaleString() : '—'}</Descriptions.Item>
                        </Descriptions>

                        <Divider />
                        <Typography.Title level={5}>Abstract</Typography.Title>
                        <Typography.Paragraph style={{ whiteSpace: 'pre-line' }}>{proposal.abstract}</Typography.Paragraph>

                        {proposal.file_path && (
                            <a href={route('research.public.file', proposal.id)} target="_blank" rel="noreferrer">
                                <Button type="primary">Open PDF</Button>
                            </a>
                        )}
                    </Card>
                </div>
            </div>
        </>
    );
}
