import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Alert, Card, message, Typography } from 'antd';
import { useEffect } from 'react';
import ResearchProposalForm from './Partials/ResearchProposalForm';

export default function ResearchEdit({ proposal }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        _method:    'PUT',
        title:      proposal.title      ?? '',
        authors:    proposal.authors    ?? '',
        co_authors: proposal.co_authors ?? '',
        school:     proposal.school     ?? '',
        year:       proposal.year       ?? new Date().getFullYear(),
        category:   proposal.category   ?? '',
        keywords:   proposal.keywords   ?? '',
        abstract:   proposal.abstract   ?? '',
        pdf_file:   null,
    });

    function submit(e) {
        e.preventDefault();
        post(route('research.update', proposal.id));
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
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Edit Research Paper</h2>}>
            <Head title="Edit Research Paper" />
            <div className="py-8">
                <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {flash?.success && <Alert type="success" showIcon message={flash.success} />}
                    {flash?.error && <Alert type="error" showIcon message={flash.error} />}
                    <Card className="admin-dashboard-shell" bordered={false}>
                        <Typography.Title level={3} style={{ marginTop: 0 }}>
                            Edit Research Proposal
                        </Typography.Title>
                        <Typography.Text type="secondary">
                            Update metadata or replace your PDF before submitting for review.
                        </Typography.Text>
                    </Card>

                    <Card className="admin-dashboard-shell" bordered={false}>
                        <ResearchProposalForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            onSubmit={submit}
                            submitLabel="Update Paper"
                            showCurrentFile={true}
                            currentFileName={proposal.file_path ? proposal.file_path.split('/').pop() : ''}
                        />
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
