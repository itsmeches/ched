import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import {
    Alert,
    Button,
    Card,
    Skeleton,
    Space,
} from 'antd';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { lazy, Suspense } from 'react';

const SuperAdminHero = lazy(() => import('./Partials/SuperAdminHero'));
const SuperAdminStats = lazy(() => import('./Partials/SuperAdminStats'));
const SuperAdminAccountPanel = lazy(() => import('./Partials/SuperAdminAccountPanel'));
const SuperAdminUsersTable = lazy(() => import('./Partials/SuperAdminUsersTable'));

export default function SuperAdminDashboard({ stats, recentUsers, recentProposals, institutionOverview, institutions, roles }) {
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
        <AuthenticatedLayout header={<AdminPageHeader title="Super Admin Dashboard" />}>
            <Head title="Super Admin Dashboard" />

            <div className="space-y-5">
                    <Suspense fallback={sectionFallback}>
                        <SuperAdminHero stats={stats} />
                    </Suspense>

                    {flash?.success && <Alert message={flash.success} type="success" showIcon />}
                    {flash?.error && <Alert message={flash.error} type="error" showIcon />}

                    <Suspense fallback={sectionFallback}>
                        <SuperAdminStats stats={stats} />
                    </Suspense>

                    <Card title="Admin Shortcuts" className="admin-dashboard-shell">
                        <Space wrap>
                            <Link href={route('admin.users.index')}>
                                <Button>User Management</Button>
                            </Link>
                            <Link href={route('admin.institutions.index')}>
                                <Button>Institutions</Button>
                            </Link>
                            <Link href={route('admin.keywords.index')}>
                                <Button>Keywords</Button>
                            </Link>
                            <Link href={route('admin.taxonomy.index')}>
                                <Button>Research Category</Button>
                            </Link>
                            
                        </Space>
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
