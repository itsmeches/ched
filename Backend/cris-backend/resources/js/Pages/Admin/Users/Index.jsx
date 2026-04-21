import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Alert, Avatar, Button, Card, Col, Input, Modal, Row, Select, Space, Table, Tag, Typography } from 'antd';
import { ExclamationCircleOutlined, PlusOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons';

const roleColorMap = { super_admin: 'purple', ched: 'blue', hei: 'green' };

export default function UsersIndex({ users, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [role, setRole] = useState(filters.role ?? '');

    const columns = useMemo(() => [
        {
            title: 'User',
            key: 'user',
            render: (_, user) => (
                <Space>
                    <Avatar style={{ backgroundColor: '#115e59' }}>{user.name?.charAt(0)?.toUpperCase() ?? 'U'}</Avatar>
                    <div>
                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{user.email}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (value) => <Tag color={roleColorMap[value]}>{value.replace('_', ' ').toUpperCase()}</Tag>,
        },
        {
            title: 'Institution',
            key: 'institution',
            render: (_, user) => user.institution?.name ?? 'Global account',
        },
        {
            title: 'Joined',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (value) => new Date(value).toLocaleDateString(),
        },
        {
            title: 'Action',
            key: 'action',
            align: 'right',
            render: (_, user) => (
                <Space>
                    <Button type="link" onClick={() => router.visit(route('admin.users.edit', user.id))}>Edit</Button>
                    <Button danger type="link" onClick={() => deleteUser(user.id)}>Delete</Button>
                </Space>
            ),
        },
    ], []);

    function applyFilter() {
        router.get(route('admin.users.index'), { search, role }, { preserveState: true, replace: true });
    }

    function deleteUser(id) {
        Modal.confirm({
            title: 'Delete this user?',
            icon: <ExclamationCircleOutlined />,
            content: 'This action cannot be undone.',
            okText: 'Delete',
            okButtonProps: { danger: true },
            onOk: () => router.delete(route('admin.users.destroy', id), { preserveScroll: true }),
        });
    }

    return (
        <AuthenticatedLayout header={<div className="flex items-center justify-between gap-4"><h2 className="text-xl font-semibold text-gray-800">User Management</h2><Link href={route('admin.users.create')}><Button type="primary" icon={<PlusOutlined />}>Create User</Button></Link></div>}>
            <Head title="Users" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {flash?.success && <Alert type="success" showIcon message={flash.success} />}
                    {flash?.error && <Alert type="error" showIcon message={flash.error} />}

                    <Card className="admin-dashboard-shell" bordered={false}>
                        <Row justify="space-between" align="middle" gutter={[16, 16]}>
                            <Col xs={24} xl={12}>
                                <Space direction="vertical" size={4}>
                                    <Typography.Title level={4} style={{ margin: 0 }}>Manage user accounts</Typography.Title>
                                    <Typography.Text type="secondary">Filter accounts by role, edit privileges, and remove inactive users.</Typography.Text>
                                </Space>
                            </Col>
                            <Col xs={24} xl={12}>
                                <Row gutter={[12, 12]}>
                                    <Col xs={24} md={12}><Input value={search} placeholder="Search name or email" prefix={<SearchOutlined />} onChange={(event) => setSearch(event.target.value)} onPressEnter={applyFilter} /></Col>
                                    <Col xs={24} md={8}><Select value={role || undefined} placeholder="All roles" allowClear options={[{ value: 'super_admin', label: 'Super Admin' }, { value: 'ched', label: 'CHED' }, { value: 'hei', label: 'HEI' }]} onChange={(value) => setRole(value ?? '')} style={{ width: '100%' }} /></Col>
                                    <Col xs={24} md={4}><Button block type="primary" onClick={applyFilter} icon={<TeamOutlined />}>Apply</Button></Col>
                                </Row>
                            </Col>
                        </Row>
                    </Card>

                    <Card className="admin-dashboard-shell" bordered={false}>
                        <Table rowKey="id" columns={columns} dataSource={users.data} pagination={{ current: users.current_page, pageSize: users.per_page, total: users.total, onChange: (page) => router.get(route('admin.users.index'), { ...filters, search, role, page }, { preserveState: true, replace: true }) }} scroll={{ x: 880 }} />
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
