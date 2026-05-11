import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/EmptyState';
import { Head, router, usePage } from '@inertiajs/react';
import { Alert, Button, Card, Popconfirm, Space, Table, Tabs, Tag, Typography, message } from 'antd';
import { useEffect } from 'react';
import { formatDateTime } from '@/utils/date';

function roleLabel(role) {
    return String(role || '').replace('_', ' ').toUpperCase();
}

export default function AccountsHierarchy({ viewerRole, tabs = [] }) {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) message.success(flash.success);
        if (flash?.error) message.error(flash.error);
    }, [flash?.success, flash?.error]);
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (value, row) => (
                <span style={{ opacity: row.deleted_at ? 0.45 : 1 }}>
                    {value}
                    {row.deleted_at && <Tag color="red" style={{ marginLeft: 6 }}>Deactivated</Tag>}
                </span>
            ),
        },
        {
            title: 'Linked Under (Creator)',
            dataIndex: 'parent_label',
            key: 'parent_label',
            responsive: ['md'],
            render: (value) => value || '—',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            responsive: ['sm'],
        },
        {
            title: 'Institution',
            key: 'institution',
            responsive: ['md'],
            render: (_, row) => row.institution?.name || '—',
        },
        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            responsive: ['lg'],
            render: (value) => formatDateTime(value) || '—',
        },
        {
            title: 'Action',
            key: 'actions',
            align: 'right',
            fixed: 'right',
            width: 180,
            render: (_, row) => {
                if (!row.can_manage) return null;

                if (row.deleted_at) {
                    return (
                        <Space>
                            <Button
                                type="link"
                                className="edit-action-btn"
                                onClick={() => router.get(route('accounts.edit', { user: row.id }))}
                            >
                                Edit
                            </Button>
                            <Popconfirm
                                title="Reactivate account?"
                                description="This will restore the user account and allow log in again."
                                okText="Reactivate"
                                cancelText="Cancel"
                                onConfirm={() =>
                                    router.post(route('accounts.reactivate', { user: row.id }))
                                }
                            >
                                <Button type="link">Reactivate</Button>
                            </Popconfirm>
                        </Space>
                    );
                }

                return (
                    <Space>
                        <Button
                            type="link"
                            className="edit-action-btn"
                            onClick={() => router.get(route('accounts.edit', { user: row.id }))}
                        >
                            Edit
                        </Button>
                        <Popconfirm
                            title="Deactivate account?"
                            description="This will deactivate the user. They will not be able to log in."
                            okText="Deactivate"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                            onConfirm={() =>
                                router.delete(route('accounts.deactivate', { user: row.id }))
                            }
                        >
                            <Button type="link" danger>Deactivate</Button>
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    return (
        <AuthenticatedLayout
            header={<AdminPageHeader title="Account Hierarchy" />}
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
                            You can only manage accounts you personally created.
                        </Typography.Text>
                    </Space>
                </Card>

                <Card className="admin-dashboard-shell" bordered={false}>
                    {tabs.length === 0 ? (
                        <Alert type="info" showIcon message="No hierarchy data is available for this account." />
                    ) : (
                        <Tabs
                            items={tabs.map((tab) => {
                                const rows = tab.rows || [];
                                const total = rows.length;
                                const deactivated = rows.filter((r) => r.deleted_at).length;
                                const label = deactivated > 0
                                    ? `${tab.label} (${total} · ${deactivated} deactivated)`
                                    : `${tab.label} (${total})`;
                                return {
                                    key: tab.key,
                                    label,
                                    children: (
                                    <Space direction="vertical" size={10} style={{ width: '100%' }}>
                                        <Typography.Text type="secondary">{tab.description}</Typography.Text>
                                        <Table
                                            rowKey="id"
                                            columns={columns}
                                            dataSource={tab.rows || []}
                                            pagination={tab.pagination ? {
                                                current: tab.pagination.current_page,
                                                pageSize: tab.pagination.per_page,
                                                total: tab.pagination.total,
                                                onChange: (page) => router.get(
                                                    route('accounts.hierarchy'),
                                                    { [tab.pagination.page_param]: page },
                                                    { preserveState: true, replace: true }
                                                ),
                                            } : { pageSize: 15 }}
                                            scroll={{ x: 900 }}
                                            locale={{ emptyText: <EmptyState title={`No ${tab.label.toLowerCase()} accounts found`} description="This scope has no linked records yet." /> }}
                                            rowClassName={(row) => row.deleted_at ? 'opacity-50' : ''}
                                        />
                                    </Space>
                                    ),
                                };
                            })}
                        />
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}

