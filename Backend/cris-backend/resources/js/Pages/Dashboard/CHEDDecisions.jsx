import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { StatusBadge } from '@/Components/StatusBadge';
import { formatDate } from '@/utils/date';
import { Alert, Card, Table, Typography } from 'antd';

export default function CHEDDecisions({ decisions }) {
    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (value, row) => <Link href={route('research.show', row.id)}>{value}</Link>,
        },
        {
            title: 'Institution',
            key: 'institution',
            render: (_, row) => row.institution?.name ?? 'Unknown institution',
        },
        {
            title: 'Decision',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (value) => <StatusBadge status={value} />,
        },
        {
            title: 'Reviewer',
            key: 'reviewer',
            width: 220,
            render: (_, row) => row.reviewer?.name ?? 'Unassigned',
        },
        {
            title: 'Reviewed At',
            dataIndex: 'reviewed_at',
            key: 'reviewed_at',
            width: 170,
            render: (value) => formatDate(value),
        },
    ];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-slate-900">My Decisions</h2>}>
            <Head title="My Decisions" />

            <div className="space-y-4">
                <Card className="admin-dashboard-shell" bordered={false}>
                    <Typography.Title level={4} style={{ marginBottom: 6 }}>
                        My Decisions
                    </Typography.Title>
                    <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                        View the latest approved and rejected research proposals handled by the CHED review desk.
                    </Typography.Paragraph>
                </Card>

                <Card className="admin-dashboard-shell" title="Recent Review Decisions">
                    {decisions.length === 0 ? (
                        <Alert type="info" showIcon message="No decisions available yet." />
                    ) : (
                        <Table
                            rowKey="id"
                            columns={columns}
                            dataSource={decisions}
                            pagination={{ pageSize: 10 }}
                            scroll={{ x: 980 }}
                            locale={{ emptyText: 'No decisions found.' }}
                        />
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}

