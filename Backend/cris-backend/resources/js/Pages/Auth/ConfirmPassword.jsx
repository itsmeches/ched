import { Button, Form, Input } from 'antd';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Confirm password</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    For security, please confirm your password before continuing.
                </p>
            </div>

            <form onSubmit={submit}>
                <Form layout="vertical" component={false}>
                    <Form.Item
                        label="Password"
                        validateStatus={errors.password ? 'error' : ''}
                        help={errors.password || undefined}
                    >
                        <Input.Password
                            id="password"
                            name="password"
                            value={data.password}
                            autoFocus
                            placeholder="Enter your current password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                    </Form.Item>
                </Form>

                <Button htmlType="submit" type="primary" block size="large" loading={processing} disabled={processing}>
                    {processing ? 'Confirming…' : 'Confirm'}
                </Button>
            </form>
        </GuestLayout>
    );
}
