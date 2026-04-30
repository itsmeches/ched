import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd';

export default function AccountEdit({ account }) {
    const { data, setData, put, processing, errors } = useForm({
        name: account.name ?? '',
        email: account.email ?? '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('accounts.update', { user: account.id }));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-slate-900">Edit Account</h2>}
        >
            <Head title="Edit Account" />

            <div className="max-w-xl mx-auto">
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
                                />
                            </Form.Item>

                            <Space>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={processing}
                                    style={{ backgroundColor: '#0033a0', borderColor: '#0033a0' }}
                                >
                                    Save Changes
                                </Button>
                                <Button
                                    onClick={() => router.get(route('accounts.hierarchy'))}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                            </Space>
                        </Form>
                    </Space>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
