import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

function ProposalForm({ data, setData, errors, processing, onSubmit, submitLabel = 'Save Draft' }) {
    return (
        <form onSubmit={onSubmit} encType="multipart/form-data" className="space-y-5">
            <div>
                <InputLabel htmlFor="title" value="Title *" />
                <TextInput id="title" className="mt-1 w-full" value={data.title} onChange={e => setData('title', e.target.value)} required />
                <InputError message={errors.title} />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                    <InputLabel htmlFor="authors" value="Authors *" />
                    <TextInput id="authors" className="mt-1 w-full" value={data.authors} onChange={e => setData('authors', e.target.value)} placeholder="Dr. Juan dela Cruz, Prof. Maria Santos" required />
                    <InputError message={errors.authors} />
                </div>
                <div>
                    <InputLabel htmlFor="co_authors" value="Co-Authors" />
                    <TextInput id="co_authors" className="mt-1 w-full" value={data.co_authors} onChange={e => setData('co_authors', e.target.value)} placeholder="Optional" />
                    <InputError message={errors.co_authors} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                    <InputLabel htmlFor="school" value="School / University *" />
                    <TextInput id="school" className="mt-1 w-full" value={data.school} onChange={e => setData('school', e.target.value)} required />
                    <InputError message={errors.school} />
                </div>
                <div>
                    <InputLabel htmlFor="year" value="Year *" />
                    <TextInput id="year" type="number" className="mt-1 w-full" value={data.year} onChange={e => setData('year', e.target.value)} min="1900" max={new Date().getFullYear() + 1} required />
                    <InputError message={errors.year} />
                </div>
            </div>

            <div>
                <InputLabel htmlFor="category" value="Category *" />
                <TextInput id="category" className="mt-1 w-full" value={data.category} onChange={e => setData('category', e.target.value)} placeholder="e.g. Education, Environment, Health" required />
                <InputError message={errors.category} />
            </div>

            <div>
                <InputLabel htmlFor="keywords" value="Keywords" />
                <TextInput id="keywords" className="mt-1 w-full" value={data.keywords} onChange={e => setData('keywords', e.target.value)} placeholder="Comma-separated" />
                <InputError message={errors.keywords} />
            </div>

            <div>
                <InputLabel htmlFor="abstract" value="Abstract *" />
                <textarea
                    id="abstract"
                    rows={6}
                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
                    value={data.abstract}
                    onChange={e => setData('abstract', e.target.value)}
                    required
                />
                <InputError message={errors.abstract} />
            </div>

            <div>
                <InputLabel htmlFor="pdf_file" value="PDF File (max 10 MB)" />
                <input
                    id="pdf_file"
                    type="file"
                    accept=".pdf"
                    className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={e => setData('pdf_file', e.target.files[0])}
                />
                <InputError message={errors.pdf_file} />
            </div>

            <div className="flex justify-end pt-2">
                <PrimaryButton disabled={processing}>{processing ? 'Saving…' : submitLabel}</PrimaryButton>
            </div>
        </form>
    );
}

export default function ResearchCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '', authors: '', co_authors: '', school: '', year: new Date().getFullYear(),
        category: '', keywords: '', abstract: '', pdf_file: null,
    });

    function submit(e) {
        e.preventDefault();
        post(route('research.store'));
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Submit Research Paper</h2>}>
            <Head title="Submit Research Paper" />
            <div className="py-8">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-8 shadow">
                        <ProposalForm data={data} setData={setData} errors={errors} processing={processing} onSubmit={submit} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
