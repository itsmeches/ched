import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function ResearchEdit({ proposal }) {
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

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Edit Research Paper</h2>}>
            <Head title="Edit Research Paper" />
            <div className="py-8">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-8 shadow">
                        <form onSubmit={submit} encType="multipart/form-data" className="space-y-5">
                            <div>
                                <InputLabel htmlFor="title" value="Title *" />
                                <TextInput id="title" className="mt-1 w-full" value={data.title} onChange={e => setData('title', e.target.value)} required />
                                <InputError message={errors.title} />
                            </div>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="authors" value="Authors *" />
                                    <TextInput id="authors" className="mt-1 w-full" value={data.authors} onChange={e => setData('authors', e.target.value)} required />
                                    <InputError message={errors.authors} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="co_authors" value="Co-Authors" />
                                    <TextInput id="co_authors" className="mt-1 w-full" value={data.co_authors} onChange={e => setData('co_authors', e.target.value)} />
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
                                <TextInput id="category" className="mt-1 w-full" value={data.category} onChange={e => setData('category', e.target.value)} required />
                                <InputError message={errors.category} />
                            </div>
                            <div>
                                <InputLabel htmlFor="keywords" value="Keywords" />
                                <TextInput id="keywords" className="mt-1 w-full" value={data.keywords} onChange={e => setData('keywords', e.target.value)} />
                                <InputError message={errors.keywords} />
                            </div>
                            <div>
                                <InputLabel htmlFor="abstract" value="Abstract *" />
                                <textarea id="abstract" rows={6} className="mt-1 w-full rounded-md border-gray-300 shadow-sm text-sm" value={data.abstract} onChange={e => setData('abstract', e.target.value)} required />
                                <InputError message={errors.abstract} />
                            </div>
                            <div>
                                <InputLabel htmlFor="pdf_file" value="Replace PDF (optional, max 10 MB)" />
                                {proposal.file_path && (
                                    <p className="mb-1 text-xs text-gray-500">Current file: {proposal.file_path.split('/').pop()}</p>
                                )}
                                <input id="pdf_file" type="file" accept=".pdf" className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-700" onChange={e => setData('pdf_file', e.target.files[0])} />
                                <InputError message={errors.pdf_file} />
                            </div>
                            <div className="flex justify-end pt-2">
                                <PrimaryButton disabled={processing}>{processing ? 'Saving…' : 'Update Paper'}</PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
