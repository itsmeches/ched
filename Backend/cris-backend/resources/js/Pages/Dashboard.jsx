import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ role, institution }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="m-0 text-xl font-semibold leading-6 text-slate-900 dark:text-slate-100">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#1e2d47] dark:bg-[#111827]">
                        <div className="p-6 text-slate-900 dark:text-slate-100">
                            <p className="font-medium">You are logged in.</p>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                Role: {role}
                            </p>
                            {institution?.name && (
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Institution: {institution.name}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
