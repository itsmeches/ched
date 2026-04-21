import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, Typography } from 'antd';
import UserFormDrawer from './Partials/UserFormDrawer';

export default function UsersEdit({ user, institutions, roles }) {
    const { data, setData, put, processing, errors } = useForm({ name: user.name, email: user.email, role: user.role, institution_id: user.institution_id ?? '', password: '', password_confirmation: '' });

    function submit(event) {
        event.preventDefault();
        put(route('admin.users.update', user.id));
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Edit User</h2>}>
            <Head title={`Edit ${user.name}`} />
            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Card className="admin-dashboard-shell" bordered={false}>
                        <Typography.Title level={4} style={{ marginTop: 0 }}>Editing {user.name}</Typography.Title>
                        <Typography.Text type="secondary">Update role assignments, institution mapping, or credentials from the drawer.</Typography.Text>
                    </Card>
                    <UserFormDrawer title={`Edit User: ${user.name}`} subtitle="Use this drawer to change account details while keeping the management workflow consistent." open={true} onClose={() => router.visit(route('admin.users.index'))} onSubmit={submit} processing={processing} data={data} setData={setData} errors={errors} roles={roles} institutions={institutions} includePasswordHint={true} submitText="Save Changes" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
