import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button, Form, Input } from 'antd';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Sign In" />

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to your account to continue</p>
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
                            autoComplete="username"
                            autoFocus
                            placeholder="you@example.com"
                            className="ant-input-uniform"
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        validateStatus={errors.password ? 'error' : ''}
                        help={errors.password || undefined}
                        extra={
                            canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-xs font-medium text-[#0033a0] transition-colors hover:text-[#001f66] dark:text-blue-300 dark:hover:text-blue-200"
                                >
                                    Forgot password?
                                </Link>
                            )
                        }
                    >
                        <Input.Password
                            id="password"
                            name="password"
                            value={data.password}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className="ant-input-uniform"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                    </Form.Item>
                </Form>

                <div className="mb-5 flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-300">Remember me</span>
                    </label>
                </div>

                <Button htmlType="submit" type="primary" block size="large" loading={processing} disabled={processing}>
                    {processing ? 'Signing in…' : 'Sign in'}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Don't have an account?{' '}
                <Link href={route('register')} className="font-medium text-[#0033a0] transition-colors hover:text-[#001f66] dark:text-blue-300 dark:hover:text-blue-200">
                    Register here
                </Link>
            </p>
        </GuestLayout>
    );
}
