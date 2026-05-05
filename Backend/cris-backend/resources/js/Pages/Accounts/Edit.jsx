import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd';

export default function AccountEdit({ account }) {
    const isDeactivated = Boolean(account.deleted_at);

    const { data, setData, put, processing, errors } = useForm({
        name: account.name ?? '',
        email: account.email ?? '',
    });
    const {
        data: passwordData,
        setData: setPasswordData,
        post: postPassword,
        processing: passwordProcessing,
        errors: passwordErrors,
        reset: resetPasswordFields,
    } = useForm({
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('accounts.update', { user: account.id }));
    };

    const handlePasswordReset = (e) => {
        e.preventDefault();
        postPassword(route('accounts.reset-password', { user: account.id }), {
            preserveScroll: true,
            onSuccess: () => resetPasswordFields('password', 'password_confirmation'),
        });
    };

    const handleReactivate = () => {
        router.post(route('accounts.reactivate', { user: account.id }));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-slate-900">Edit Account</h2>}
        >
            <Head title="Edit Account" />

            <div className="max-w-xl mx-auto space-y-4">
                <Card className="admin-dashboard-shell" bordered={false}>
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                        <div>
                            <Typography.Title level={5} style={{ margin: 0 }}>
                                Editing: {account.name}
                            </Typography.Title>
                            <Typography.Text type="secondary">
                                Role: {String(account.role || '').replace('_', ' ').toUpperCase()}
                            </Typography.Text>
                        </div>

                        {isDeactivated && (
                            <Alert
                                type="warning"
                                showIcon
                                message="This account is currently deactivated."
                                description="Reactivate this account to allow sign in and continue editing details."
                                action={(
                                    <Button type="primary" onClick={handleReactivate}>
                                        Reactivate
                                    </Button>
                                )}
                            />
                        )}

                        {Object.keys(errors).length > 0 && (
                            <Alert
                                type="error"
                                showIcon
                                message="Please fix the following errors:"
                                description={
                                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                                        {Object.values(errors).map((msg, i) => (
                                            <li key={i}>{msg}</li>
                                        ))}
                                    </ul>
                                }
                            />
                        )}

                        <Form layout="vertical" onSubmitCapture={handleSubmit}>
                            <Form.Item
                                label="Full Name"
                                validateStatus={errors.name ? 'error' : ''}
                                help={errors.name}
                            >
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Full name"
                                    disabled={isDeactivated}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Email Address"
                                validateStatus={errors.email ? 'error' : ''}
                                help={errors.email}
                            >
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="email@example.com"
                                    disabled={isDeactivated}
                                />
                            </Form.Item>

                            <Space>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={processing}
                                    disabled={isDeactivated}
                                    style={{ backgroundColor: '#0033a0', borderColor: '#0033a0' }}
                                >
                                    Save Changes
                                </Button>
                                <Button
                                    onClick={() => router.get(route('accounts.hierarchy'))}
                                    disabled={processing || passwordProcessing}
                                >
                                    Cancel
                                </Button>
                            </Space>
                        </Form>
                    </Space>
                </Card>

                <Card className="admin-dashboard-shell" bordered={false}>
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                        <div>
                            <Typography.Title level={5} style={{ margin: 0 }}>
                                Reset Password
                            </Typography.Title>
                            <Typography.Text type="secondary">
                                Set a new password for this account.
                            </Typography.Text>
                        </div>

                        <Form layout="vertical" onSubmitCapture={handlePasswordReset}>
                            <Form.Item
                                label="New Password"
                                validateStatus={passwordErrors.password ? 'error' : ''}
                                help={passwordErrors.password}
                            >
                                <Input.Password
                                    value={passwordData.password}
                                    onChange={(e) => setPasswordData('password', e.target.value)}
                                    placeholder="Minimum 8 characters"
                                    disabled={isDeactivated}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Confirm Password"
                                validateStatus={passwordErrors.password_confirmation ? 'error' : ''}
                                help={passwordErrors.password_confirmation}
                            >
                                <Input.Password
                                    value={passwordData.password_confirmation}
                                    onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                    placeholder="Re-enter password"
                                    disabled={isDeactivated}
                                />
                            </Form.Item>

                            <Button
                                htmlType="submit"
                                loading={passwordProcessing}
                                disabled={processing || isDeactivated}
                            >
                                Reset Password
                            </Button>
                        </Form>
                    </Space>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
