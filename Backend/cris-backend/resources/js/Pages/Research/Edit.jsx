import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Alert, Card, message, Typography } from 'antd';
import { useEffect } from 'react';
import ResearchProposalForm from './Partials/ResearchProposalForm';

function parseKeywordItems(value) {
    return String(value ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

export default function ResearchEdit({ proposal, keywordOptions = [], disciplineOptions = [], researchCategoryGroups = [] }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        _method:           'PUT',
        title:             proposal.title             ?? '',
        authors:           proposal.authors           ?? '',
        author_email:      proposal.author_email      ?? '',
        author_phone:      proposal.author_phone      ?? '',
        co_authors:        proposal.co_authors        ?? '',
        co_author_emails:  proposal.co_author_emails  ?? '',
        co_author_phones:  proposal.co_author_phones  ?? '',
        school:            proposal.school            ?? '',
        year:       proposal.year       ?? new Date().getFullYear(),
        research_category: proposal.research_category ?? proposal.category ?? '',
        category_type: proposal.category_type ?? '',
        discipline: proposal.discipline_code ?? '',
        keywords:   proposal.keywords   ?? '',
        keyword_items: parseKeywordItems(proposal.keywords),
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
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-slate-900">Edit Research Paper</h2>}>
            <Head title="Edit Research Paper" />
            <div className="space-y-6">
                    {flash?.success && <Alert type="success" showIcon message={flash.success} />}
                    {flash?.error && <Alert type="error" showIcon message={flash.error} />}
                    <Card className="admin-dashboard-shell" bordered={false}>
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
                            keywordOptions={keywordOptions}
                            disciplineOptions={disciplineOptions}
                            researchCategoryGroups={researchCategoryGroups}
                            submitLabel="Update Paper"
                            showCurrentFile={true}
                            currentFileName={proposal.file_path ? proposal.file_path.split('/').pop() : ''}
                            cancelHref={route('research.show', proposal.id)}
                            cancelLabel="Back to Record"
                        />
                    </Card>
            </div>
        </AuthenticatedLayout>
    );
}
