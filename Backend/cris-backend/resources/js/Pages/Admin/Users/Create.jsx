import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, Typography } from 'antd';
import UserFormDrawer from './Partials/UserFormDrawer';

export default function UsersCreate({ institutions, roles }) {
    const { data, setData, post, processing, errors } = useForm({ name: '', email: '', password: '', password_confirmation: '', role: 'hei', institution_id: '' });

    function submit(event) {
        event.preventDefault();
        post(route('admin.users.store'));
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Create User Account</h2>}>
            <Head title="Create User" />
            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Card className="admin-dashboard-shell" bordered={false}>
                        <Typography.Title level={4} style={{ marginTop: 0 }}>Account creation workspace</Typography.Title>
                        <Typography.Text type="secondary">The creation form opens in a drawer so you can stay close to the user list workflow.</Typography.Text>
                    </Card>
                    <UserFormDrawer title="Create User Account" subtitle="Set the user role, assign an institution for HEI accounts, and save the record directly into the system." open={true} onClose={() => router.visit(route('admin.users.index'))} onSubmit={submit} processing={processing} data={data} setData={setData} errors={errors} roles={roles} institutions={institutions} submitText="Create Account" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
