import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Alert, Card, Space, Table, Tabs, Tag, Typography } from 'antd';
import { formatDateTime } from '@/utils/date';

function roleLabel(role) {
    return String(role || '').replace('_', ' ').toUpperCase();
}

export default function AccountsHierarchy({ viewerRole, tabs = [] }) {
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Linked Under',
            dataIndex: 'parent_label',
            key: 'parent_label',
            render: (value) => value || '—',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Institution',
            key: 'institution',
            render: (_, row) => row.institution?.name || '—',
        },
        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (value) => formatDateTime(value) || '—',
        },
    ];

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-slate-900">Account Hierarchy</h2>}
        >
            <Head title="Account Hierarchy" />

            <div className="space-y-4">
                <Card className="admin-dashboard-shell" bordered={false}>
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        <Space wrap>
                            <Tag color="blue">Viewer Role: {roleLabel(viewerRole)}</Tag>
                            <Tag color="geekblue">Track who is under who</Tag>
                        </Space>
                        <Typography.Text type="secondary">
                            Use these tabs to audit HEI, Faculty, and Student linkages for your account scope.
                        </Typography.Text>
                    </Space>
                </Card>

                <Card className="admin-dashboard-shell" bordered={false}>
                    {tabs.length === 0 ? (
                        <Alert type="info" showIcon message="No hierarchy data is available for this account." />
                    ) : (
                        <Tabs
                            items={tabs.map((tab) => ({
                                key: tab.key,
                                label: `${tab.label} (${tab.rows?.length || 0})`,
                                children: (
                                    <Space direction="vertical" size={10} style={{ width: '100%' }}>
                                        <Typography.Text type="secondary">{tab.description}</Typography.Text>
                                        <Table
                                            rowKey="id"
                                            columns={columns}
                                            dataSource={tab.rows || []}
                                            pagination={{ pageSize: 10 }}
                                            scroll={{ x: 760 }}
                                        />
                                    </Space>
                                ),
                            }))}
                        />
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}

