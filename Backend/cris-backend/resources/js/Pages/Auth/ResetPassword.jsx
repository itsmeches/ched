import { Button, Form, Input } from 'antd';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reset password</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create a new password for your account</p>
            </div>

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
                            autoComplete="username"
                            placeholder="you@example.com"
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        validateStatus={errors.password ? 'error' : ''}
                        help={errors.password || undefined}
                    >
                        <Input.Password
                            id="password"
                            name="password"
                            value={data.password}
                            autoComplete="new-password"
                            autoFocus
                            placeholder="Create a strong password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Confirm password"
                        validateStatus={errors.password_confirmation ? 'error' : ''}
                        help={errors.password_confirmation || undefined}
                    >
                        <Input.Password
                            id="password_confirmation"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            autoComplete="new-password"
                            placeholder="Re-enter your password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                    </Form.Item>
                </Form>

                <Button htmlType="submit" type="primary" block size="large" loading={processing} disabled={processing}>
                    {processing ? 'Resetting password…' : 'Reset password'}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Return to{' '}
                <Link href={route('login')} className="font-medium text-[#0b3ea9] transition-colors hover:text-[#001f66] hover:underline dark:text-blue-300 dark:hover:text-blue-100 dark:hover:underline">
                    sign in
                </Link>
            </p>
        </GuestLayout>
    );
}
