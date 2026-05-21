import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminFilterCard from '@/Components/Admin/AdminFilterCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import AdminTableCard from '@/Components/Admin/AdminTableCard';
import EmptyState from '@/Components/EmptyState';
import { confirmAction } from '@/utils/confirmAction';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Input, Row, Space, Table, Tag, message } from 'antd';
import { BankOutlined, DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';

const acronymStopWords = new Set(['of', 'and', 'the', 'for', 'at', 'in', 'on']);

function getInstitutionAcronym(name, fallbackCode) {
    const words = (name ?? '')
        .split(/\s+/)
        .map((word) => word.replace(/[^a-zA-Z0-9]/g, ''))
        .filter(Boolean);

    const significantWords = words.filter((word) => !acronymStopWords.has(word.toLowerCase()));
    const sourceWords = significantWords.length > 0 ? significantWords : words;
    const acronym = sourceWords
        .map((word) => word[0])
        .join('')
        .toUpperCase();

    return acronym || fallbackCode || '—';
}

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

    const columns = useMemo(
        () => [
            {
                title: 'Institution',
                key: 'institution',
                render: (_, institution) => (
                    <div>
                        <div style={{ fontWeight: 600 }}>{institution.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                            {institution.contact_email ?? 'No email provided'}
                        </div>
                    </div>
                ),
            },
            {
                title: 'Acronym',
                dataIndex: 'code',
                key: 'code',
                render: (value, institution) => (
                    <Tag color="blue" title={value || institution.name}>
                        {getInstitutionAcronym(institution.name, value)}
                    </Tag>
                ),
            },
            {
                title: 'Address',
                dataIndex: 'address',
                key: 'address',
                responsive: ['sm'],
                render: (value) => value || '—',
            },
            { title: 'Users', dataIndex: 'users_count', key: 'users_count', responsive: ['md'] },
            {
                title: 'Action',
                key: 'action',
                align: 'center',
                onHeaderCell: () => ({ style: { textAlign: 'center' } }),
                render: (_, institution) => (
                    <Space>
                        <Button
                            type="link"
                            className="edit-action-btn"
                            onClick={() =>
                                router.visit(route('admin.institutions.edit', institution.id))
                            }
                        >
                            Edit
                        </Button>
                        <Button
                            danger
                            type="link"
                            onClick={() => deleteInstitution(institution.id)}
                        >
                            Delete
                        </Button>
                    </Space>
                ),
            },
        ],
        []
    );

    function applyFilter() {
        router.get(
            route('admin.institutions.index'),
            { search },
            { preserveState: true, replace: true }
        );
    }

    function deleteInstitution(id) {
        confirmAction({
            title: 'Delete this institution?',
            content: 'This action cannot be undone.',
            okText: 'Delete',
            danger: true,
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
        <AuthenticatedLayout
            header={
                <AdminPageHeader
                    title="Institution Management"
                    actions={
                        <Space>
                            <a
                                href={route('admin.institutions.export', {
                                    search: search || undefined,
                                })}
                            >
                                <Button size="large" icon={<DownloadOutlined />}>
                                    Export CSV
                                </Button>
                            </a>
                            <Link href={route('admin.institutions.create')}>
                                <Button size="large" type="primary" icon={<PlusOutlined />}>
                                    Add Institution
                                </Button>
                            </Link>
                        </Space>
                    }
                />
            }
        >
            <Head title="Institutions" />

            <div className="space-y-4">
                {flash?.success && <Alert type="success" showIcon message={flash.success} />}
                {flash?.error && <Alert type="error" showIcon message={flash.error} />}

                <AdminFilterCard
                    title="Manage institution records"
                    description="Maintain school profiles before assigning HEI accounts and tracking research ownership."
                    controls={
                        <Row gutter={[12, 12]}>
                            <Col xs={24} md={18}>
                                <Input
                                    size="large"
                                    aria-label="Search institutions by name or acronym"
                                    value={search}
                                    placeholder="Search by name or acronym"
                                    prefix={<SearchOutlined />}
                                    onChange={(event) => setSearch(event.target.value)}
                                    onPressEnter={applyFilter}
                                />
                            </Col>
                            <Col xs={24} md={6}>
                                <Button
                                    size="large"
                                    block
                                    type="primary"
                                    onClick={applyFilter}
                                    icon={<BankOutlined />}
                                >
                                    Apply
                                </Button>
                            </Col>
                        </Row>
                    }
                />

                <AdminTableCard
                    summary={`${institutions.total} institution${institutions.total === 1 ? '' : 's'} found`}
                >
                    <Table
                        rowKey="id"
                        size="middle"
                        columns={columns}
                        dataSource={tableData}
                        pagination={{
                            current: institutions.current_page,
                            pageSize: institutions.per_page,
                            total: institutions.total,
                            onChange: (page) =>
                                router.get(
                                    route('admin.institutions.index'),
                                    { search, page },
                                    { preserveState: true, replace: true }
                                ),
                        }}
                        scroll={{ x: 860 }}
                        locale={{
                            emptyText: (
                                <EmptyState
                                    title="No institutions found"
                                    description="Try a different keyword or add a new institution."
                                />
                            ),
                        }}
                    />
                </AdminTableCard>
            </div>
        </AuthenticatedLayout>
    );
}
