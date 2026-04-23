import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Alert, Card, message, Typography } from 'antd';
import { useEffect } from 'react';
import ResearchProposalForm from './Partials/ResearchProposalForm';

export default function ResearchCreate({ keywordOptions = [] }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        title: '', authors: '', author_email: '', author_phone: '',
        co_authors: '', co_author_emails: '', co_author_phones: '',
        school: '', year: new Date().getFullYear(),
        category: '', keywords: '', keyword_items: [], abstract: '', pdf_file: null,
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
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-slate-900">Submit Research Paper</h2>}>
            <Head title="Submit Research Paper" />
            <div className="space-y-6">
                    {flash?.success && <Alert type="success" showIcon message={flash.success} />}
                    {flash?.error && <Alert type="error" showIcon message={flash.error} />}
                    <Card className="admin-dashboard-shell" bordered={false}>
                        <Typography.Text type="secondary">
                            Complete all required fields and upload your research paper in PDF format.
                        </Typography.Text>
                    </Card>

                    <Card className="admin-dashboard-shell" bordered={false}>
                        <ResearchProposalForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            onSubmit={submit}
                            keywordOptions={keywordOptions}
                            submitLabel="Submit Paper"
                            cancelHref={route('research.index')}
                            cancelLabel="Back to Papers"
                        />
                    </Card>
            </div>
        </AuthenticatedLayout>
    );
}
