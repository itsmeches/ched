import { Button, Form, Input } from 'antd';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Update Password
                </h2>

                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Ensure your account is using a long, random password to stay
                    secure.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6">
                <Form layout="vertical" component={false}>
                    <Form.Item
                        label="Current Password"
                        validateStatus={errors.current_password ? 'error' : ''}
                        help={errors.current_password || undefined}
                    >
                        <Input.Password
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            autoComplete="current-password"
                        />
                    </Form.Item>

                    <Form.Item
                        label="New Password"
                        validateStatus={errors.password ? 'error' : ''}
                        help={errors.password || undefined}
                    >
                        <Input.Password
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="new-password"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Confirm Password"
                        validateStatus={errors.password_confirmation ? 'error' : ''}
                        help={errors.password_confirmation || undefined}
                    >
                        <Input.Password
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            autoComplete="new-password"
                        />
                    </Form.Item>
                </Form>

                <div className="flex items-center gap-4">
                    <Button htmlType="submit" type="primary" loading={processing} disabled={processing}>Save</Button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
