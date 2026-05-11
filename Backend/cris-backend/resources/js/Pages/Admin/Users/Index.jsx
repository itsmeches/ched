import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminFilterCard from '@/Components/Admin/AdminFilterCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import AdminStatCardGrid from '@/Components/Admin/AdminStatCardGrid';
import AdminTableCard from '@/Components/Admin/AdminTableCard';
import EmptyState from '@/Components/EmptyState';
import { confirmAction } from '@/utils/confirmAction';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { formatDate } from '@/utils/date';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Avatar, Button, Col, DatePicker, Input, Row, Select, Space, Table, Tag, Typography, message } from 'antd';
import { PlusOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTheme } from '@/utils/ThemeContext';

const roleLabelMap = {
    all: 'All Users',
    pending: 'Pending Approval',
    super_admin: 'Super Admin',
    ched: 'CHED',
    hei: 'HEI',
    faculty: 'Faculty',
    student: 'Student',
};

export default function UsersIndex({ users, filters, roleCounts, institutions }) {
    const { flash } = usePage().props;
    const { dark } = useTheme();
    const accentPrimary = dark ? '#93c5fd' : '#0033a0';
    const roleColorMap = {
        pending: 'orange',
        super_admin: 'purple',
        ched: dark ? '#60a5fa' : '#0033a0',
        hei: dark ? '#60a5fa' : '#0047d4',
        faculty: 'cyan',
        student: 'geekblue',
    };
    const [search, setSearch] = useState(filters.search ?? '');
    const [role, setRole] = useState(filters.role ?? '');
    const [institutionId, setInstitutionId] = useState(filters.institution_id ?? '');
    const [deactivated, setDeactivated] = useState(Boolean(filters.deactivated));
    const [joinedDateRange, setJoinedDateRange] = useState(
        filters.from && filters.to ? [dayjs(filters.from), dayjs(filters.to)] : null,
    );
    const [tableData, setTableData] = useState(users.data ?? []);

    const categoryItems = useMemo(() => [
        { key: 'all', label: roleLabelMap.all, count: roleCounts?.all ?? 0, color: accentPrimary },
        { key: 'pending', label: roleLabelMap.pending, count: roleCounts?.pending ?? 0, color: '#d97706' },
        { key: 'super_admin', label: roleLabelMap.super_admin, count: roleCounts?.super_admin ?? 0, color: '#7c3aed' },
        { key: 'ched', label: roleLabelMap.ched, count: roleCounts?.ched ?? 0, color: dark ? '#60a5fa' : '#0033a0' },
        { key: 'hei', label: roleLabelMap.hei, count: roleCounts?.hei ?? 0, color: dark ? '#60a5fa' : '#0047d4' },
        { key: 'faculty', label: roleLabelMap.faculty, count: roleCounts?.faculty ?? 0, color: '#0891b2' },
        { key: 'student', label: roleLabelMap.student, count: roleCounts?.student ?? 0, color: '#1d4ed8' },
    ], [roleCounts, dark, accentPrimary]);

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
                    <Avatar style={{ backgroundColor: accentPrimary }}>{user.name?.charAt(0)?.toUpperCase() ?? 'U'}</Avatar>
                    <div>
                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
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
            responsive: ['sm'],
            render: (_, user) => user.institution?.name ?? 'Global account',
        },
        {
            title: 'Joined',
            dataIndex: 'created_at',
            key: 'created_at',
            responsive: ['md'],
            render: (value) => formatDate(value),
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            onHeaderCell: () => ({ style: { textAlign: 'center' } }),
            render: (_, user) => (
                <Space>
                    {deactivated ? (
                        <Button type="link" onClick={() => restoreUser(user.id)}>Restore</Button>
                    ) : (
                        <>
                            <Button type="link" className="edit-action-btn" onClick={() => router.visit(route('admin.users.edit', user.id))}>Edit</Button>
                            <Button danger type="link" onClick={() => deleteUser(user.id)}>Deactivate</Button>
                        </>
                    )}
                </Space>
            ),
        },
    ], [deactivated]);

    function applyFilter() {
        router.get(route('admin.users.index'), {
            search,
            role,
            institution_id: institutionId,
            from: joinedDateRange?.[0]?.format('YYYY-MM-DD') ?? '',
            to: joinedDateRange?.[1]?.format('YYYY-MM-DD') ?? '',
            deactivated: deactivated ? 1 : 0,
        }, { preserveState: true, replace: true });
    }

    function applyRoleCategory(nextRole) {
        const normalizedRole = nextRole === 'all' ? '' : nextRole;
        setRole(normalizedRole);
        router.get(route('admin.users.index'), {
            search,
            role: normalizedRole,
            institution_id: institutionId,
            from: joinedDateRange?.[0]?.format('YYYY-MM-DD') ?? '',
            to: joinedDateRange?.[1]?.format('YYYY-MM-DD') ?? '',
            deactivated: deactivated ? 1 : 0,
        }, { preserveState: true, replace: true });
    }

    function clearFilters() {
        setSearch('');
        setRole('');
        setInstitutionId('');
        setDeactivated(false);
        setJoinedDateRange(null);

        router.get(route('admin.users.index'), {
            search: '',
            role: '',
            institution_id: '',
            from: '',
            to: '',
            deactivated: 0,
        }, { preserveState: true, replace: true });
    }

    function deleteUser(id) {
        confirmAction({
            title: 'Deactivate this user?',
            content: 'The account will be soft-deleted and can be restored later.',
            okText: 'Deactivate',
            danger: true,
            onOk: () => {
                const previous = tableData;
                setTableData((current) => current.filter((item) => item.id !== id));

                router.delete(route('admin.users.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        message.success('User deactivated.');
                        router.reload({ only: ['users'] });
                    },
                    onError: () => {
                        setTableData(previous);
                        message.error('Deactivate failed. Restored previous table state.');
                    },
                });
            },
        });
    }

    function restoreUser(id) {
        router.post(route('admin.users.restore', id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                message.success('User reactivated.');
                router.reload({ only: ['users'] });
            },
            onError: () => {
                message.error('Restore failed.');
            },
        });
    }

    return (
        <AuthenticatedLayout
            header={(
                <AdminPageHeader
                    title="User Management"
                    actions={(
                        <Space>
                            <Link href={route('admin.users.audits')}>
                                <Button size="large">View Audits</Button>
                            </Link>
                            <Link href={route('admin.users.create')}>
                                <Button size="large" type="primary" icon={<PlusOutlined />}>
                                    Create User
                                </Button>
                            </Link>
                        </Space>
                    )}
                />
            )}
        >
            <Head title="Users" />

            <div className="space-y-4">
                    {flash?.success && <Alert type="success" showIcon message={flash.success} />}
                    {flash?.error && <Alert type="error" showIcon message={flash.error} />}

                    <AdminStatCardGrid
                        items={categoryItems}
                        activeKey={role || 'all'}
                        onSelect={applyRoleCategory}
                    />

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
                                            { value: 'faculty', label: 'Faculty' },
                                            { value: 'student', label: 'Student' },
                                        ]}
                                        onChange={(value) => setRole(value ?? '')}
                                        style={{ width: '100%' }}
                                    />
                                </Col>
                                <Col xs={24} md={8}>
                                    <Select
                                        size="large"
                                        aria-label="Filter users by institution"
                                        value={institutionId || undefined}
                                        placeholder="All institutions"
                                        allowClear
                                        options={(institutions ?? []).map((institution) => ({
                                            value: institution.id,
                                            label: institution.name,
                                        }))}
                                        onChange={(value) => setInstitutionId(value ?? '')}
                                        style={{ width: '100%' }}
                                    />
                                </Col>
                                <Col xs={24} md={8}>
                                    <Select
                                        size="large"
                                        aria-label="Filter active or deactivated users"
                                        value={deactivated ? 'deactivated' : 'active'}
                                        options={[
                                            { value: 'active', label: 'Active users' },
                                            { value: 'deactivated', label: 'Deactivated users' },
                                        ]}
                                        onChange={(value) => setDeactivated(value === 'deactivated')}
                                        style={{ width: '100%' }}
                                    />
                                </Col>
                                <Col xs={24} md={8}>
                                    <DatePicker.RangePicker
                                        size="large"
                                        aria-label="Filter users by join date"
                                        value={joinedDateRange}
                                        onChange={(value) => setJoinedDateRange(value)}
                                        style={{ width: '100%' }}
                                    />
                                </Col>
                                <Col xs={24} md={4}>
                                    <Button size="large" block type="primary" onClick={applyFilter} icon={<TeamOutlined />}>
                                        Apply
                                    </Button>
                                </Col>
                                <Col xs={24} md={4}>
                                    <Button size="large" block onClick={clearFilters}>
                                        Clear
                                    </Button>
                                </Col>
                            </Row>
                        )}
                    />

                    <AdminTableCard
                        title={roleLabelMap[role || 'all']}
                        summary={`${users.total} ${deactivated ? 'deactivated' : 'active'} user${users.total === 1 ? '' : 's'} in this category`}
                    >
                        <Table rowKey="id" size="middle" columns={columns} dataSource={tableData} pagination={{ current: users.current_page, pageSize: users.per_page, total: users.total, onChange: (page) => router.get(route('admin.users.index'), { ...filters, search, role, institution_id: institutionId, from: joinedDateRange?.[0]?.format('YYYY-MM-DD') ?? '', to: joinedDateRange?.[1]?.format('YYYY-MM-DD') ?? '', deactivated: deactivated ? 1 : 0, page }, { preserveState: true, replace: true }) }} scroll={{ x: 880 }} locale={{ emptyText: <EmptyState title="No users matched your filters" description="Adjust role, institution, date, or search terms to find users." /> }} />
                    </AdminTableCard>
            </div>
        </AuthenticatedLayout>
    );
}

