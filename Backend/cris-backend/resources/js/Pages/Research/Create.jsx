import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Alert, Card, message, Typography } from 'antd';
import { useEffect } from 'react';
import ResearchProposalForm from './Partials/ResearchProposalForm';

export default function ResearchCreate() {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        title: '', authors: '', co_authors: '', school: '', year: new Date().getFullYear(),
        category: '', keywords: '', abstract: '', pdf_file: null,
    });

    function submit(e) {
        e.preventDefault();
        post(route('research.store'));
    }

    useEffect(() => {
        if (flash?.success) {
            message.success(flash.success);
        }
        if (flash?.error) {
            message.error(flash.error);
        }
    }, [flash?.success, flash?.error]);

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Submit Research Paper</h2>}>
            <Head title="Submit Research Paper" />
            <div className="py-8">
                <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {flash?.success && <Alert type="success" showIcon message={flash.success} />}
                    {flash?.error && <Alert type="error" showIcon message={flash.error} />}
                    <Card className="admin-dashboard-shell" bordered={false}>
                        <Typography.Title level={3} style={{ marginTop: 0 }}>
                            New Research Proposal
                        </Typography.Title>
                        <Typography.Text type="secondary">
                            Complete all required fields and upload your research paper in PDF format.
                        </Typography.Text>
                    </Card>

                    <Card className="admin-dashboard-shell" bordered={false}>
                        <ResearchProposalForm data={data} setData={setData} errors={errors} processing={processing} onSubmit={submit} submitLabel="Submit Paper" />
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
