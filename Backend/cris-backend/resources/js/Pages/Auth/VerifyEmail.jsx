import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Verify your email</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Please verify your email address by clicking the link we sent.
                    If you did not receive it, we can send another one.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="space-y-3">
                    <PrimaryButton className="w-full justify-center py-2.5" disabled={processing}>
                        {processing ? 'Sending verification…' : 'Resend verification email'}
                    </PrimaryButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-[#2a3a5c] dark:bg-[#111827] dark:text-slate-200 dark:hover:bg-[#1a2540]"
                    >
                        Sign out
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
