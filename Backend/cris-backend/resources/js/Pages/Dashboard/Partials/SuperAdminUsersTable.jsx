import { Avatar, Button, Card, Col, Row, Space, Table, Tag } from 'antd';
import { router } from '@inertiajs/react';

const roleColorMap = { super_admin: 'purple', ched: 'blue', hei: 'green' };

export default function SuperAdminUsersTable({ recentUsers, recentProposals, institutionOverview }) {
    const userColumns = [
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

    const proposalColumns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (value, row) => <Button type="link" style={{ paddingInline: 0 }} onClick={() => router.visit(route('research.show', row.id))}>{value}</Button>,
        },
        {
            title: 'Institution',
            key: 'institution',
            render: (_, row) => row.institution?.name ?? '—',
        },
        {
            title: 'Submitted By',
            key: 'submitter',
            render: (_, row) => row.submitter?.name ?? '—',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={status === 'approved' ? 'green' : status === 'pending' ? 'gold' : 'red'}>{status.toUpperCase()}</Tag>,
        },
    ];

    const institutionColumns = [
        {
            title: 'Institution',
            key: 'institution',
            render: (_, row) => row.code ? `${row.name} (${row.code})` : row.name,
        },
        {
            title: 'HEI Users',
            dataIndex: 'hei_users_count',
            key: 'hei_users_count',
            width: 110,
        },
        {
            title: 'Proposals',
            dataIndex: 'proposals_count',
            key: 'proposals_count',
            width: 100,
        },
        {
            title: 'Approved',
            dataIndex: 'approved_count',
            key: 'approved_count',
            width: 100,
        },
        {
            title: 'Pending',
            dataIndex: 'pending_count',
            key: 'pending_count',
            width: 100,
        },
        {
            title: 'Last Submission',
            dataIndex: 'proposals_max_created_at',
            key: 'proposals_max_created_at',
            render: (value) => value ? new Date(value).toLocaleDateString() : '—',
        },
    ];

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24}>
                <Card title="Recently Added Users" extra={<Button type="link" onClick={() => router.visit(route('admin.users.index'))}>View all</Button>} className="admin-dashboard-shell">
                    <Table columns={userColumns} dataSource={recentUsers} rowKey="id" pagination={false} scroll={{ x: 760 }} />
                </Card>
            </Col>
            <Col xs={24} xl={12}>
                <Card title="Recent Research Activity" extra={<Button type="link" onClick={() => router.visit(route('research.index'))}>Open research</Button>} className="admin-dashboard-shell">
                    <Table columns={proposalColumns} dataSource={recentProposals} rowKey="id" pagination={false} scroll={{ x: 760 }} size="small" />
                </Card>
            </Col>
            <Col xs={24} xl={12}>
                <Card title="Institution Performance" extra={<Button type="link" onClick={() => router.visit(route('admin.institutions.index'))}>View institutions</Button>} className="admin-dashboard-shell">
                    <Table columns={institutionColumns} dataSource={institutionOverview} rowKey="id" pagination={false} scroll={{ x: 760 }} size="small" />
                </Card>
            </Col>
        </Row>
    );
}