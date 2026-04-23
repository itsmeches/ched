import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminFilterCard from '@/Components/Admin/AdminFilterCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import AdminStatCardGrid from '@/Components/Admin/AdminStatCardGrid';
import AdminTableCard from '@/Components/Admin/AdminTableCard';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { formatDate } from '@/utils/date';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Avatar, Button, Col, Input, Modal, Row, Select, Space, Table, Tag, Typography, message } from 'antd';
import { ExclamationCircleOutlined, PlusOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons';

const roleColorMap = { pending: 'orange', super_admin: 'purple', ched: '#0033a0', hei: '#0047d4' };
const roleLabelMap = {
    all: 'All Users',
    pending: 'Pending Approval',
    super_admin: 'Super Admin',
    ched: 'CHED',
    hei: 'HEI',
};

export default function UsersIndex({ users, filters, roleCounts }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [role, setRole] = useState(filters.role ?? '');
    const [tableData, setTableData] = useState(users.data ?? []);

    const categoryItems = useMemo(() => [
        { key: 'all', label: roleLabelMap.all, count: roleCounts?.all ?? 0, color: '#0f172a' },
        { key: 'pending', label: roleLabelMap.pending, count: roleCounts?.pending ?? 0, color: '#d97706' },
        { key: 'super_admin', label: roleLabelMap.super_admin, count: roleCounts?.super_admin ?? 0, color: '#7c3aed' },
        { key: 'ched', label: roleLabelMap.ched, count: roleCounts?.ched ?? 0, color: '#0033a0' },
        { key: 'hei', label: roleLabelMap.hei, count: roleCounts?.hei ?? 0, color: '#0047d4' },
    ], [roleCounts]);

    useEffect(() => {
        setTableData(users.data ?? []);
    }, [users.data]);

    useEffect(() => {
        if (flash?.success) {
            message.success(flash.success);
        }
        if (flash?.error) {
            message.error(flash.error);
        }
    }, [flash?.success, flash?.error]);

    const columns = useMemo(() => [
        {
            title: 'User',
            key: 'user',
            render: (_, user) => (
                <Space>
                    <Avatar style={{ backgroundColor: '#0033a0' }}>{user.name?.charAt(0)?.toUpperCase() ?? 'U'}</Avatar>
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
            render: (value) => formatDate(value),
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

    function applyRoleCategory(nextRole) {
        const normalizedRole = nextRole === 'all' ? '' : nextRole;
        setRole(normalizedRole);
        router.get(route('admin.users.index'), { search, role: normalizedRole }, { preserveState: true, replace: true });
    }

    function deleteUser(id) {
        Modal.confirm({
            title: 'Delete this user?',
            icon: <ExclamationCircleOutlined />,
            content: 'This action cannot be undone.',
            okText: 'Delete',
            okButtonProps: { danger: true },
            onOk: () => {
                const previous = tableData;
                setTableData((current) => current.filter((item) => item.id !== id));

                router.delete(route('admin.users.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        message.success('User deleted.');
                        router.reload({ only: ['users'] });
                    },
                    onError: () => {
                        setTableData(previous);
                        message.error('Delete failed. Restored previous table state.');
                    },
                });
            },
        });
    }

    return (
        <AuthenticatedLayout
            header={(
                <AdminPageHeader
                    title="User Management"
                    actions={(
                        <Link href={route('admin.users.create')}>
                            <Button size="large" type="primary" icon={<PlusOutlined />}>
                                Create User
                            </Button>
                        </Link>
                    )}
                />
            )}
        >
            <Head title="Users" />

            <div className="space-y-6">
                    {flash?.success && <Alert type="success" showIcon message={flash.success} />}
                    {flash?.error && <Alert type="error" showIcon message={flash.error} />}

                    <AdminFilterCard
                        title="Manage user accounts"
                        description="Filter accounts by role, edit privileges, and remove inactive users."
                        controls={(
                            <Row gutter={[12, 12]}>
                                <Col xs={24} md={12}>
                                    <Input
                                        size="large"
                                        aria-label="Search users by name or email"
                                        value={search}
                                        placeholder="Search name or email"
                                        prefix={<SearchOutlined />}
                                        onChange={(event) => setSearch(event.target.value)}
                                        onPressEnter={applyFilter}
                                    />
                                </Col>
                                <Col xs={24} md={8}>
                                    <Select
                                        size="large"
                                        aria-label="Filter users by role"
                                        value={role || undefined}
                                        placeholder="All roles"
                                        allowClear
                                        options={[
                                            { value: 'pending', label: 'Pending Approval' },
                                            { value: 'super_admin', label: 'Super Admin' },
                                            { value: 'ched', label: 'CHED' },
                                            { value: 'hei', label: 'HEI' },
                                        ]}
                                        onChange={(value) => setRole(value ?? '')}
                                        style={{ width: '100%' }}
                                    />
                                </Col>
                                <Col xs={24} md={4}>
                                    <Button size="large" block type="primary" onClick={applyFilter} icon={<TeamOutlined />}>
                                        Apply
                                    </Button>
                                </Col>
                            </Row>
                        )}
                    />

                    <AdminStatCardGrid
                        items={categoryItems}
                        activeKey={role || 'all'}
                        onSelect={applyRoleCategory}
                    />

                    <AdminTableCard
                        title={roleLabelMap[role || 'all']}
                        summary={`${users.total} user${users.total === 1 ? '' : 's'} in this category`}
                    >
                        <Table rowKey="id" columns={columns} dataSource={tableData} pagination={{ current: users.current_page, pageSize: users.per_page, total: users.total, onChange: (page) => router.get(route('admin.users.index'), { ...filters, search, role, page }, { preserveState: true, replace: true }) }} scroll={{ x: 880 }} locale={{ emptyText: 'No users matched your filter criteria.' }} />
                    </AdminTableCard>
            </div>
        </AuthenticatedLayout>
    );
}
