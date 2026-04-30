import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Alert, Button, Card, Modal, Popconfirm, Space, Table, Tabs, Tag, Tooltip, Typography } from 'antd';
import { useState } from 'react';
import { formatDateTime } from '@/utils/date';

function roleLabel(role) {
    return String(role || '').replace('_', ' ').toUpperCase();
}

function ResetPasswordModal({ account, open, onClose }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!password || password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError('');
        setSubmitting(true);
        router.post(
            route('accounts.reset-password', { user: account.id }),
            { password, password_confirmation: confirmPassword },
            {
                onFinish: () => { setSubmitting(false); onClose(); },
                onError: (e) => { setError(e.password || 'Failed to reset password.'); setSubmitting(false); },
            }
        );
    };

    return (
        <Modal
            title="Reset Password"
            open={open}
            onOk={handleSubmit}
            onCancel={onClose}
            okText="Reset Password"
            confirmLoading={submitting}
            destroyOnClose
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <Typography.Text>Reset password for <strong>{account?.name}</strong></Typography.Text>
                {error && <Typography.Text type="danger">{error}</Typography.Text>}
                <div>
                    <label style={{ display: 'block', marginBottom: 4 }}>New Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #d9d9d9', borderRadius: 4 }}
                        placeholder="Minimum 8 characters"
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: 4 }}>Confirm Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #d9d9d9', borderRadius: 4 }}
                        placeholder="Re-enter new password"
                    />
                </div>
            </Space>
        </Modal>
    );
}

export default function AccountsHierarchy({ viewerRole, tabs = [] }) {
    const [resetTarget, setResetTarget] = useState(null);

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (value, row) => (
                <span style={{ opacity: row.deleted_at ? 0.45 : 1 }}>
                    {value}
                    {row.deleted_at && <Tag color="red" style={{ marginLeft: 6 }}>Deactivated</Tag>}
                </span>
            ),
        },
        {
            title: 'Linked Under',
            dataIndex: 'parent_label',
            key: 'parent_label',
            render: (value) => value || '—',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Institution',
            key: 'institution',
            render: (_, row) => row.institution?.name || '—',
        },
        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (value) => formatDateTime(value) || '—',
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 200,
            render: (_, row) => {
                if (!row.can_manage || row.deleted_at) return null;
                return (
                    <Space size={4}>
                        <Tooltip title="Edit account details">
                            <Button
                                size="small"
                                onClick={() => router.get(route('accounts.edit', { user: row.id }))}
                            >
                                Edit
                            </Button>
                        </Tooltip>
                        <Tooltip title="Reset password">
                            <Button
                                size="small"
                                onClick={() => setResetTarget(row)}
                            >
                                Reset PW
                            </Button>
                        </Tooltip>
                        <Popconfirm
                            title="Deactivate account?"
                            description="This will deactivate the user. They will not be able to log in."
                            okText="Deactivate"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                            onConfirm={() =>
                                router.delete(route('accounts.deactivate', { user: row.id }))
                            }
                        >
                            <Tooltip title="Deactivate user">
                                <Button size="small" danger>Deactivate</Button>
                            </Tooltip>
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-slate-900">Account Hierarchy</h2>}
        >
            <Head title="Account Hierarchy" />

            {resetTarget && (
                <ResetPasswordModal
                    account={resetTarget}
                    open={!!resetTarget}
                    onClose={() => setResetTarget(null)}
                />
            )}

            <div className="space-y-4">
                <Card className="admin-dashboard-shell" bordered={false}>
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        <Space wrap>
                            <Tag color="blue">Viewer Role: {roleLabel(viewerRole)}</Tag>
                            <Tag color="geekblue">Track who is under who</Tag>
                        </Space>
                        <Typography.Text type="secondary">
                            Use these tabs to audit HEI, Faculty, and Student linkages for your account scope.
                            You can only manage accounts you personally created.
                        </Typography.Text>
                    </Space>
                </Card>

                <Card className="admin-dashboard-shell" bordered={false}>
                    {tabs.length === 0 ? (
                        <Alert type="info" showIcon message="No hierarchy data is available for this account." />
                    ) : (
                        <Tabs
                            items={tabs.map((tab) => ({
                                key: tab.key,
                                label: `${tab.label} (${tab.rows?.length || 0})`,
                                children: (
                                    <Space direction="vertical" size={10} style={{ width: '100%' }}>
                                        <Typography.Text type="secondary">{tab.description}</Typography.Text>
                                        <Table
                                            rowKey="id"
                                            columns={columns}
                                            dataSource={tab.rows || []}
                                            pagination={{ pageSize: 10 }}
                                            scroll={{ x: 900 }}
                                            rowClassName={(row) => row.deleted_at ? 'opacity-50' : ''}
                                        />
                                    </Space>
                                ),
                            }))}
                        />
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}

