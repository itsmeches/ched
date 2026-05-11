import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import {
    Alert,
    Button,
    Card,
    Skeleton,
    Space,
} from 'antd';
import { AppstoreOutlined, BankOutlined, BookOutlined, TeamOutlined } from '@ant-design/icons';
import DashboardFilters from '@/Components/DashboardFilters';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { lazy, Suspense } from 'react';

const SuperAdminHero = lazy(() => import('./Partials/SuperAdminHero'));
const SuperAdminStats = lazy(() => import('./Partials/SuperAdminStats'));
const SuperAdminCharts = lazy(() => import('./Partials/SuperAdminCharts'));
const SuperAdminAccountPanel = lazy(() => import('./Partials/SuperAdminAccountPanel'));
const SuperAdminUsersTable = lazy(() => import('./Partials/SuperAdminUsersTable'));

export default function SuperAdminDashboard({
    stats,
    recentUsers,
    recentProposals,
    institutionOverview,
    monthlyTrends = [],
    roleDistribution = [],
    disciplineBreakdown = [],
    institutionPerformance = [],
    institutions,
    roles,
    filters = {},
    filterOptions = {},
}) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'hei',
        institution_id: '',
        redirect_to: 'dashboard',
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('admin.users.store'), {
            preserveScroll: true,
            onSuccess: () => reset('name', 'email', 'password', 'password_confirmation', 'institution_id'),
        });
    };

    const sectionFallback = <Skeleton active paragraph={{ rows: 4 }} />;

    const renderAdminShortcuts = () => (
        <Card title="Admin Shortcuts" className="admin-dashboard-shell dashboard-table-card" bordered={false}>
            <Space wrap className="quick-action-cluster">
                <Link href={route('admin.users.index')}>
                    <Button className="quick-action-primary" icon={<TeamOutlined />}>Open User Management</Button>
                </Link>
                <Link href={route('admin.institutions.index')}>
                    <Button className="quick-action-secondary" icon={<BankOutlined />}>Open Institutions</Button>
                </Link>
                <Link href={route('admin.keywords.index')}>
                    <Button className="quick-action-secondary" icon={<BookOutlined />}>Open Keywords</Button>
                </Link>
                <Link href={route('admin.taxonomy.index')}>
                    <Button className="quick-action-secondary" icon={<AppstoreOutlined />}>Open Taxonomy</Button>
                </Link>
            </Space>
        </Card>
    );

    return (
        <AuthenticatedLayout header={<AdminPageHeader title="Super Admin Dashboard" />}>
            <Head title="Super Admin Dashboard" />

            <div className="space-y-5">
                    <Suspense fallback={sectionFallback}>
                        <SuperAdminHero stats={stats} />
                    </Suspense>

                    <DashboardFilters
                        routeName="admin.dashboard"
                        filters={filters}
                        years={filterOptions.years ?? []}
                        institutions={filterOptions.institutions ?? []}
                        disciplines={filterOptions.disciplines ?? []}
                    />

                    {flash?.success && <Alert message={flash.success} type="success" showIcon />}
                    {flash?.error && <Alert message={flash.error} type="error" showIcon />}

                    <div className="sm:hidden">
                        {renderAdminShortcuts()}
                    </div>

                    <Suspense fallback={sectionFallback}>
                        <SuperAdminStats stats={stats} />
                    </Suspense>

                    <div className="hidden sm:block">
                        {renderAdminShortcuts()}
                    </div>

                    <Suspense fallback={sectionFallback}>
                        <SuperAdminUsersTable recentUsers={recentUsers} recentProposals={recentProposals} institutionOverview={institutionOverview} />
                    </Suspense>

                    <Suspense fallback={sectionFallback}>
                        <SuperAdminCharts
                            stats={stats}
                            monthlyTrends={monthlyTrends}
                            roleDistribution={roleDistribution}
                            disciplineBreakdown={disciplineBreakdown}
                            institutionPerformance={institutionPerformance}
                        />
                    </Suspense>

                    <Suspense fallback={sectionFallback}>
                        <SuperAdminAccountPanel data={data} setData={setData} postSubmit={submit} processing={processing} errors={errors} institutions={institutions} roles={roles} />
                    </Suspense>
            </div>
        </AuthenticatedLayout>
    );
}
