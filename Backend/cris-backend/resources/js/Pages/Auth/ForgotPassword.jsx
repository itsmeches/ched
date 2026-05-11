import { Button, Form, Input } from 'antd';
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
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Forgot password</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Enter your account email and we will send a reset link.
                </p>
            </div>

            {status && (
                <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <Form layout="vertical" component={false}>
                    <Form.Item
                        label="Email address"
                        validateStatus={errors.email ? 'error' : ''}
                        help={errors.email || undefined}
                    >
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            autoFocus
                            placeholder="you@example.com"
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </Form.Item>
                </Form>

                <Button htmlType="submit" type="primary" block size="large" loading={processing} disabled={processing}>
                    {processing ? 'Sending link…' : 'Send password reset link'}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Remembered your password?{' '}
                <Link href={route('login')} className="font-medium text-[#0033a0] transition-colors hover:text-[#001f66] dark:text-blue-300 dark:hover:text-blue-200">
                    Back to sign in
                </Link>
            </p>
        </GuestLayout>
    );
}
