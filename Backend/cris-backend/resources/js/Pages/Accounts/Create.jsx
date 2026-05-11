import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Alert, Button, Card, Col, Form, Input, Row, Select, Space, Table, Tabs, Tag, Typography, message } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { formatDateTime } from '@/utils/date';

function institutionLabel(option) {
    return option.code ? `${option.name} (${option.code})` : option.name;
}

export default function AccountsCreate({ creatorRole, targetRole, targetRoleLabel, institutions, requiresInstitutionSelection, institutionName, hierarchyTabs = [] }) {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) message.success(flash.success);
        if (flash?.error) message.error(flash.error);
    }, [flash?.success, flash?.error]);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        institution_id: '',
    });

    function submit(event) {
        event.preventDefault();
        post(route('accounts.store'), {
            preserveScroll: true,
            onSuccess: () => reset('password', 'password_confirmation'),
        });
    }

    const hierarchyColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
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
    ];

    return (
        <AuthenticatedLayout
            header={<AdminPageHeader title={`Create ${targetRoleLabel} Account`} />}
        >
            <Head title={`Create ${targetRoleLabel} Account`} />

            <div className="space-y-4">
                {errors?.role_linkage && <Alert type="error" showIcon message={errors.role_linkage} />}

                <Card className="admin-dashboard-shell hierarchical-account-create-panel" bordered={false}>
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                        <Space wrap>
                            <Tag color="blue">Creator: {String(creatorRole).replace('_', ' ').toUpperCase()}</Tag>
                            <Tag color="geekblue">Auto Role: {String(targetRole).replace('_', ' ').toUpperCase()}</Tag>
                        </Space>

                        <Typography.Text type="secondary">
                            Hierarchical creation is enforced automatically. You are creating a {targetRoleLabel} account.
                        </Typography.Text>

                        <Alert
                            type="info"
                            showIcon
                            message={requiresInstitutionSelection
                                ? 'Select institution for this HEI account.'
                                : `Institution will be inherited automatically${institutionName ? `: ${institutionName}` : ''}.`}
                        />

                        <Form layout="vertical" onSubmitCapture={submit}>
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item label="Full Name" validateStatus={errors.name ? 'error' : ''} help={errors.name}>
                                        <Input
                                            size="large"
                                            value={data.name}
                                            onChange={(event) => setData('name', event.target.value)}
                                            placeholder="Juan Dela Cruz"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item label="Email Address" validateStatus={errors.email ? 'error' : ''} help={errors.email}>
                                        <Input
                                            size="large"
                                            type="email"
                                            value={data.email}
                                            onChange={(event) => setData('email', event.target.value)}
                                            placeholder="user@domain.edu.ph"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {requiresInstitutionSelection && (
                                <Row gutter={16}>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Institution"
                                            validateStatus={errors.institution_id ? 'error' : ''}
                                            help={errors.institution_id}
                                        >
                                            <Select
                                                size="large"
                                                value={data.institution_id || undefined}
                                                placeholder="Select institution"
                                                options={institutions.map((item) => ({ value: item.id, label: institutionLabel(item) }))}
                                                onChange={(value) => setData('institution_id', value ?? '')}
                                                allowClear
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            )}

                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item label="Password" validateStatus={errors.password ? 'error' : ''} help={errors.password}>
                                        <Input.Password
                                            size="large"
                                            value={data.password}
                                            onChange={(event) => setData('password', event.target.value)}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Confirm Password"
                                        validateStatus={errors.password_confirmation ? 'error' : ''}
                                        help={errors.password_confirmation}
                                    >
                                        <Input.Password
                                            size="large"
                                            value={data.password_confirmation}
                                            onChange={(event) => setData('password_confirmation', event.target.value)}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Space>
                                <Button type="primary" size="large" htmlType="submit" loading={processing} icon={<UserAddOutlined />}>
                                    Create {targetRoleLabel}
                                </Button>
                            </Space>
                        </Form>
                    </Space>
                </Card>

                {hierarchyTabs.length > 0 && (
                    <Card className="admin-dashboard-shell" bordered={false}>
                        <Space direction="vertical" size={12} style={{ width: '100%' }}>
                            <Typography.Title level={5} style={{ margin: 0 }}>Linked Accounts</Typography.Title>
                            <Typography.Text type="secondary">
                                Quickly verify hierarchy linkage before reviewing submissions.
                            </Typography.Text>

                            <Tabs
                                items={hierarchyTabs.map((tab) => ({
                                    key: tab.key,
                                    label: `${tab.label} (${tab.rows?.length || 0})`,
                                    children: (
                                        <Space direction="vertical" size={10} style={{ width: '100%' }}>
                                            <Typography.Text type="secondary">{tab.description}</Typography.Text>
                                            <Table
                                                rowKey="id"
                                                columns={hierarchyColumns}
                                                dataSource={tab.rows || []}
                                                pagination={{ pageSize: 8 }}
                                                scroll={{ x: 700 }}
                                            />
                                        </Space>
                                    ),
                                }))}
                            />
                        </Space>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

