import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, Typography } from 'antd';
import InstitutionFormDrawer from './Partials/InstitutionFormDrawer';

export default function InstitutionsCreate() {
    const { data, setData, post, processing, errors } = useForm({ name: '', code: '', address: '', contact_email: '', contact_phone: '' });

    function submit(event) {
        event.preventDefault();
        post(route('admin.institutions.store'));
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Add Institution</h2>}>
            <Head title="Add Institution" />
            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Card className="admin-dashboard-shell" bordered={false}>
                        <Typography.Title level={4} style={{ marginTop: 0 }}>Institution setup workspace</Typography.Title>
                        <Typography.Text type="secondary">Create the school record first, then attach HEI user accounts to it.</Typography.Text>
                    </Card>
                    <InstitutionFormDrawer title="Add Institution" subtitle="Set a unique code and core contact details for the institution." open={true} onClose={() => router.visit(route('admin.institutions.index'))} onSubmit={submit} processing={processing} data={data} setData={setData} errors={errors} submitText="Add Institution" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
