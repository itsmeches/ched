import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, Typography } from 'antd';
import InstitutionFormDrawer from './Partials/InstitutionFormDrawer';

export default function InstitutionsEdit({ institution }) {
    const { data, setData, put, processing, errors, transform } = useForm({ name: institution.name ?? '', acronym: institution.code ?? '', address: institution.address ?? '', contact_email: institution.contact_email ?? '', contact_phone: institution.contact_phone ?? '' });

    function submit(event) {
        event.preventDefault();
        transform(({ acronym, ...formData }) => ({ ...formData, code: acronym }));
        put(route('admin.institutions.update', institution.id));
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-slate-900">Edit Institution</h2>}>
            <Head title={`Edit ${institution.name}`} />
            <div className="space-y-4">
                    <Card className="admin-dashboard-shell" bordered={false}>
                        <Typography.Text type="secondary">Update institution details without leaving the management workflow.</Typography.Text>
                    </Card>
                    <InstitutionFormDrawer title={`Edit: ${institution.name}`} subtitle="Review institution details, contact information, and acronym assignments from the drawer." open={true} onClose={() => router.visit(route('admin.institutions.index'))} onSubmit={submit} processing={processing} data={data} setData={setData} errors={errors} submitText="Save Changes" />
            </div>
        </AuthenticatedLayout>
    );
}

