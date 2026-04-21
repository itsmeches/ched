import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Input, Modal, Row, Space, Table, Tag, Typography, message } from 'antd';
import { BankOutlined, ExclamationCircleOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';

export default function InstitutionsIndex({ institutions, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [tableData, setTableData] = useState(institutions.data ?? []);

    useEffect(() => {
        setTableData(institutions.data ?? []);
    }, [institutions.data]);

    useEffect(() => {
        if (flash?.success) {
            message.success(flash.success);
        }
        if (flash?.error) {
            message.error(flash.error);
        }
    }, [flash?.success, flash?.error]);

    const columns = useMemo(() => [
        {
            title: 'Institution',
            key: 'institution',
            render: (_, institution) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{institution.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{institution.contact_email ?? 'No email provided'}</div>
                </div>
            ),
        },
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            render: (value) => value ? <Tag color="blue">{value}</Tag> : '—',
        },
        { title: 'Address', dataIndex: 'address', key: 'address', render: (value) => value || '—' },
        { title: 'Users', dataIndex: 'users_count', key: 'users_count' },
        {
            title: 'Action',
            key: 'action',
            align: 'right',
            render: (_, institution) => (
                <Space>
                    <Button type="link" onClick={() => router.visit(route('admin.institutions.edit', institution.id))}>Edit</Button>
                    <Button danger type="link" onClick={() => deleteInstitution(institution.id)}>Delete</Button>
                </Space>
            ),
        },
    ], []);

    function applyFilter() {
        router.get(route('admin.institutions.index'), { search }, { preserveState: true, replace: true });
    }

    function deleteInstitution(id) {
        Modal.confirm({
            title: 'Delete this institution?',
            icon: <ExclamationCircleOutlined />,
            content: 'This action cannot be undone.',
            okText: 'Delete',
            okButtonProps: { danger: true },
            onOk: () => {
                const previous = tableData;
                setTableData((current) => current.filter((item) => item.id !== id));

                router.delete(route('admin.institutions.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        message.success('Institution deleted.');
                        router.reload({ only: ['institutions'] });
                    },
                    onError: () => {
                        setTableData(previous);
                        message.error('Delete failed. Restored previous table state.');
                    },
                });
            },
        });
    }

    return (
        <AuthenticatedLayout header={<div className="flex items-center justify-between gap-4"><h2 className="text-xl font-semibold text-gray-800">Institution Management</h2><Link href={route('admin.institutions.create')}><Button type="primary" icon={<PlusOutlined />}>Add Institution</Button></Link></div>}>
            <Head title="Institutions" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {flash?.success && <Alert type="success" showIcon message={flash.success} />}
                    {flash?.error && <Alert type="error" showIcon message={flash.error} />}

                    <Card className="admin-dashboard-shell" bordered={false}>
                        <Row justify="space-between" align="middle" gutter={[16, 16]}>
                            <Col xs={24} xl={12}>
                                <Space direction="vertical" size={4}>
                                    <Typography.Title level={4} style={{ margin: 0 }}>Manage institution records</Typography.Title>
                                    <Typography.Text type="secondary">Maintain school profiles before assigning HEI accounts and tracking research ownership.</Typography.Text>
                                </Space>
                            </Col>
                            <Col xs={24} xl={12}>
                                <Row gutter={[12, 12]}>
                                    <Col xs={24} md={18}><Input value={search} placeholder="Search by name or code" prefix={<SearchOutlined />} onChange={(event) => setSearch(event.target.value)} onPressEnter={applyFilter} /></Col>
                                    <Col xs={24} md={6}><Button block type="primary" onClick={applyFilter} icon={<BankOutlined />}>Apply</Button></Col>
                                </Row>
                            </Col>
                        </Row>
                    </Card>

                    <Card className="admin-dashboard-shell" bordered={false}>
                        <Table rowKey="id" columns={columns} dataSource={tableData} pagination={{ current: institutions.current_page, pageSize: institutions.per_page, total: institutions.total, onChange: (page) => router.get(route('admin.institutions.index'), { search, page }, { preserveState: true, replace: true }) }} scroll={{ x: 860 }} />
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
