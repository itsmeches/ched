import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, Typography } from 'antd';
import InstitutionFormDrawer from './Partials/InstitutionFormDrawer';

export default function InstitutionsCreate() {
    const { data, setData, post, processing, errors, transform } = useForm({ name: '', acronym: '', address: '', contact_email: '', contact_phone: '' });

    function submit(event) {
        event.preventDefault();
        transform(({ acronym, ...formData }) => ({ ...formData, code: acronym }));
        post(route('admin.institutions.store'));
    }

    return (
        <AuthenticatedLayout header={<AdminPageHeader title="Add Institution" />}>
            <Head title="Add Institution" />
            <div className="space-y-4">
                    <Card className="admin-dashboard-shell" bordered={false}>
                        <Typography.Text type="secondary">Create the school record first, then attach HEI user accounts to it.</Typography.Text>
                    </Card>
                    <InstitutionFormDrawer title="Add Institution" subtitle="Set a unique acronym and core contact details for the institution." open={true} onClose={() => router.visit(route('admin.institutions.index'))} onSubmit={submit} processing={processing} data={data} setData={setData} errors={errors} submitText="Add Institution" />
            </div>
        </AuthenticatedLayout>
    );
}

