import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Forgot password</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Enter your account email and we will send a reset link.
                </p>
            </div>

            {status && (
                <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label htmlFor="email" className="text-sm font-medium text-slate-700">Email address</label>
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="mt-1.5 block w-full"
                    isFocused={true}
                    placeholder="you@example.com"
                    onChange={(e) => setData('email', e.target.value)}
                />
                </div>

                <InputError message={errors.email} className="mt-1.5" />

                <PrimaryButton className="w-full justify-center py-2.5" disabled={processing}>
                    {processing ? 'Sending link…' : 'Send password reset link'}
                </PrimaryButton>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
                Remembered your password?{' '}
                <Link href={route('login')} className="font-medium text-teal-600 hover:text-teal-800">
                    Back to sign in
                </Link>
            </p>
        </GuestLayout>
    );
}
