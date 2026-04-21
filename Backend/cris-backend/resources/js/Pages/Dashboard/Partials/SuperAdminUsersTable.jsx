import { Avatar, Button, Card, Space, Table, Tag } from 'antd';
import { router } from '@inertiajs/react';

const roleColorMap = { super_admin: 'purple', ched: 'blue', hei: 'green' };

export default function SuperAdminUsersTable({ recentUsers }) {
    const columns = [
        {
            title: 'User',
            key: 'user',
            render: (_, user) => (
                <Space>
                    <Avatar style={{ backgroundColor: '#115e59' }}>{user.name?.charAt(0)?.toUpperCase() ?? 'U'}</Avatar>
                    <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{user.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{user.email}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => <Tag color={roleColorMap[role]}>{role.replace('_', ' ').toUpperCase()}</Tag>,
        },
        {
            title: 'Institution',
            key: 'institution',
            render: (_, user) => user.institution?.name ?? 'Global account',
        },
        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (value) => new Date(value).toLocaleDateString(),
        },
        {
            title: 'Action',
            key: 'action',
            align: 'right',
            render: (_, user) => <Button type="link" onClick={() => router.visit(route('admin.users.edit', user.id))}>Edit</Button>,
        },
    ];

    return (
        <Card title="Recently Added Users" extra={<Button type="link" onClick={() => router.visit(route('admin.users.index'))}>View all</Button>} className="admin-dashboard-shell">
            <Table columns={columns} dataSource={recentUsers} rowKey="id" pagination={false} scroll={{ x: 760 }} />
        </Card>
    );
}