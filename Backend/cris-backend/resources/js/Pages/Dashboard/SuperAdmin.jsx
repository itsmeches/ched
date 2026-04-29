import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Alert,
    Button,
    Card,
    Skeleton,
    Space,
} from 'antd';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { lazy, Suspense } from 'react';

const SuperAdminHero = lazy(() => import('./Partials/SuperAdminHero'));
const SuperAdminStats = lazy(() => import('./Partials/SuperAdminStats'));
const SuperAdminAccountPanel = lazy(() => import('./Partials/SuperAdminAccountPanel'));
const SuperAdminUsersTable = lazy(() => import('./Partials/SuperAdminUsersTable'));

export default function SuperAdminDashboard({ stats, recentUsers, recentProposals, institutionOverview, institutions, roles, notifications = [] }) {
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

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-slate-900">Super Admin Dashboard</h2>}>
            <Head title="Super Admin Dashboard" />

            <div className="space-y-8">
                    <Suspense fallback={sectionFallback}>
                        <SuperAdminHero stats={stats} />
                    </Suspense>

                    {flash?.success && <Alert message={flash.success} type="success" showIcon />}
                    {flash?.error && <Alert message={flash.error} type="error" showIcon />}

                    <Suspense fallback={sectionFallback}>
                        <SuperAdminStats stats={stats} />
                    </Suspense>

                    <Card title="Unread Notifications" className="admin-dashboard-shell">
                        <div style={{ marginBottom: 12 }}>
                            <Button size="small" onClick={() => router.post(route('notifications.read-all'))}>Mark all as read</Button>
                        </div>
                        {notifications.length === 0 ? (
                            <Alert type="info" showIcon message="No new notifications." />
                        ) : (
                            <Space direction="vertical" size={10} style={{ width: '100%' }}>
                                {notifications.map((item) => (
                                    <Alert
                                        key={item.id}
                                        type="info"
                                        showIcon
                                        message={item.message}
                                    />
                                ))}
                            </Space>
                        )}
                    </Card>

                    <Suspense fallback={sectionFallback}>
                        <SuperAdminAccountPanel data={data} setData={setData} postSubmit={submit} processing={processing} errors={errors} institutions={institutions} roles={roles} />
                    </Suspense>

                    <Suspense fallback={sectionFallback}>
                        <SuperAdminUsersTable recentUsers={recentUsers} recentProposals={recentProposals} institutionOverview={institutionOverview} />
                    </Suspense>
            </div>
        </AuthenticatedLayout>
    );
}
