import { Avatar, Button, Card, Col, Row, Space, Table, Tag } from 'antd';
import { router } from '@inertiajs/react';
import { formatDate } from '@/utils/date';
import EmptyState from '@/Components/EmptyState';
import { useTheme } from '@/utils/ThemeContext';

function getInstitutionDisplayLabel(institution) {
    if (!institution) {
        return '—';
    }

    return institution.code ? `${institution.name} (${institution.code})` : institution.name;
}

export default function SuperAdminUsersTable({
    recentUsers,
    recentProposals,
    institutionOverview,
}) {
    const { dark } = useTheme();
    const accentPrimary = dark ? '#93c5fd' : '#0033a0';
    const balancedTableScrollY = 280;
    const roleColorMap = {
        super_admin: 'purple',
        ched: dark ? '#60a5fa' : '#0033a0',
        hei: dark ? '#60a5fa' : '#0047d4',
    };

    const userColumns = [
        {
            title: 'User',
            key: 'user',
            render: (_, user) => (
                <Space>
                    <Avatar style={{ backgroundColor: accentPrimary }}>
                        {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </Avatar>
                    <div>
                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                            {user.email}
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={roleColorMap[role]}>{role.replace('_', ' ').toUpperCase()}</Tag>
            ),
        },
        {
            title: 'Institution',
            key: 'institution',
            render: (_, row) => getInstitutionDisplayLabel(row.institution),
        },
        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (value) => formatDate(value),
        },
        {
            title: 'Action',
            key: 'action',
            align: 'right',
            render: (_, user) => (
                <Button
                    type="link"
                    className="edit-action-btn"
                    onClick={() => router.visit(route('admin.users.edit', user.id))}
                >
                    Edit
                </Button>
            ),
        },
    ];

    const proposalColumns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            width: 320,
            ellipsis: true,
            render: (value, row) => (
                <Button
                    type="link"
                    className={`recent-research-title-btn ${dark ? 'recent-research-title-link' : ''}`.trim()}
                    style={{ paddingInline: 0, width: '100%', justifyContent: 'flex-start' }}
                    onClick={() => router.visit(route('research.show', row.id))}
                >
                    {value}
                </Button>
            ),
        },
        {
            title: 'Institution',
            key: 'institution',
            width: 180,
            ellipsis: true,
            render: (_, row) => row.institution?.name ?? '—',
        },
        {
            title: 'Submitted By',
            key: 'submitter',
            width: 180,
            ellipsis: true,
            render: (_, row) => row.submitter?.name ?? '—',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <Tag
                    color={
                        status === 'approved'
                            ? accentPrimary
                            : status === 'pending'
                              ? 'orange'
                              : 'red'
                    }
                >
                    {status.toUpperCase()}
                </Tag>
            ),
        },
    ];

    const institutionColumns = [
        {
            title: 'Institution',
            key: 'institution',
            render: (_, row) => getInstitutionDisplayLabel(row),
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
            title: 'HEI Users',
            dataIndex: 'hei_users_count',
            key: 'hei_users_count',
            width: 110,
        },
        {
            title: 'Last Submission',
            dataIndex: 'proposals_max_created_at',
            key: 'proposals_max_created_at',
            render: (value) => formatDate(value),
        },
    ];

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24}>
                <Card
                    title="Recent Research Activity"
                    extra={
                        <Button
                            type="link"
                            className={dark ? 'superadmin-card-action-link' : ''}
                            onClick={() => router.visit(route('research.index'))}
                        >
                            Open research
                        </Button>
                    }
                    className="admin-dashboard-shell dashboard-table-card recent-research-activity-card"
                >
                    <Table
                        columns={proposalColumns}
                        dataSource={recentProposals}
                        rowKey="id"
                        pagination={false}
                        scroll={{ x: 900, y: balancedTableScrollY }}
                        size="small"
                        tableLayout="fixed"
                        locale={{
                            emptyText: (
                                <EmptyState
                                    title="No research activity yet"
                                    description="Recent proposal submissions and updates will appear here."
                                />
                            ),
                        }}
                    />
                </Card>
            </Col>
            <Col xs={24} xl={12}>
                <Card
                    title="Institution Performance"
                    extra={
                        <Button
                            type="link"
                            className={dark ? 'superadmin-card-action-link' : ''}
                            onClick={() => router.visit(route('admin.institutions.index'))}
                        >
                            View institutions
                        </Button>
                    }
                    className="admin-dashboard-shell dashboard-table-card"
                >
                    <Table
                        columns={institutionColumns}
                        dataSource={institutionOverview}
                        rowKey="id"
                        pagination={false}
                        scroll={{ x: 760, y: balancedTableScrollY }}
                        size="small"
                        locale={{
                            emptyText: (
                                <EmptyState
                                    title="No institution performance data"
                                    description="Institution metrics will populate after submissions are processed."
                                />
                            ),
                        }}
                    />
                </Card>
            </Col>
            <Col xs={24} xl={12}>
                <Card
                    title="Recently Added Users"
                    extra={
                        <Button
                            type="link"
                            className={dark ? 'superadmin-card-action-link' : ''}
                            onClick={() => router.visit(route('admin.users.index'))}
                        >
                            View all
                        </Button>
                    }
                    className="admin-dashboard-shell dashboard-table-card"
                >
                    <Table
                        columns={userColumns}
                        dataSource={recentUsers}
                        rowKey="id"
                        pagination={false}
                        scroll={{ x: 760, y: balancedTableScrollY }}
                        size="small"
                        locale={{
                            emptyText: (
                                <EmptyState
                                    title="No recent users"
                                    description="Newly added users will appear here."
                                />
                            ),
                        }}
                    />
                </Card>
            </Col>
        </Row>
    );
}
