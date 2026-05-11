import { Button, Form, Input, Modal } from 'antd';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-semibold text-rose-900 dark:text-rose-200">
                    Delete Account
                </h2>

                <p className="mt-1 text-sm text-rose-800/80 dark:text-rose-200/80">
                    Once your account is deleted, all of its resources and data
                    will be permanently deleted. Before deleting your account,
                    please download any data or information that you wish to
                    retain.
                </p>
            </header>

            <Button danger type="primary" onClick={confirmUserDeletion}>
                Delete Account
            </Button>

            <Modal
                open={confirmingUserDeletion}
                onCancel={closeModal}
                footer={null}
                centered
                title="Are you sure you want to delete your account?"
                width={480}
            >
                <form onSubmit={deleteUser}>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Once your account is deleted, all of its resources and
                        data will be permanently deleted. Please enter your
                        password to confirm you would like to permanently delete
                        your account.
                    </p>

                    <div className="mt-4">
                        <Form layout="vertical" component={false}>
                            <Form.Item
                                validateStatus={errors.password ? 'error' : ''}
                                help={errors.password || undefined}
                                style={{ marginBottom: 0 }}
                            >
                                <Input.Password
                                    id="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    autoFocus
                                    placeholder="Password"
                                />
                            </Form.Item>
                        </Form>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <Button onClick={closeModal}>
                            Cancel
                        </Button>

                        <Button danger type="primary" htmlType="submit" loading={processing} disabled={processing}>
                            Delete Account
                        </Button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
