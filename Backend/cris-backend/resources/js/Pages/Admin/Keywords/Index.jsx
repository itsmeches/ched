import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminFilterCard from '@/Components/Admin/AdminFilterCard';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import AdminTableCard from '@/Components/Admin/AdminTableCard';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Input, Modal, Row, Space, Table, Tag, Tooltip, Typography, message } from 'antd';
import { ExclamationCircleOutlined, PlusOutlined, SearchOutlined, TagsOutlined } from '@ant-design/icons';

export default function KeywordsIndex({ keywords, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [tableData, setTableData] = useState(keywords.data ?? []);
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingKeyword, setEditingKeyword] = useState(null);

    const keywordForm = useForm({ name: '' });

    useEffect(() => {
        setTableData(keywords.data ?? []);
    }, [keywords.data]);

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
            title: 'Keyword',
            dataIndex: 'name',
            key: 'name',
            render: (value) => <Tag color="blue">{value}</Tag>,
        },
        {
            title: 'Used By Papers',
            dataIndex: 'research_proposals_count',
            key: 'research_proposals_count',
        },
        {
            title: 'Action',
            key: 'action',
            align: 'right',
            render: (_, keyword) => (
                <Space>
                    <Button type="link" onClick={() => openEdit(keyword)}>Edit</Button>
                    <Tooltip title={keyword.research_proposals_count > 0 ? 'Cannot delete: keyword is in use' : null}>
                        <span>
                            <Button
                                danger
                                type="link"
                                disabled={keyword.research_proposals_count > 0}
                                onClick={() => deleteKeyword(keyword)}
                            >
                                Delete
                            </Button>
                        </span>
                    </Tooltip>
                </Space>
            ),
        },
    ], []);

    function applyFilter() {
        router.get(route('admin.keywords.index'), { search }, { preserveState: true, replace: true });
    }

    function openCreate() {
        setEditingKeyword(null);
        keywordForm.setData('name', '');
        keywordForm.clearErrors();
        setEditorOpen(true);
    }

    function openEdit(keyword) {
        setEditingKeyword(keyword);
        keywordForm.setData('name', keyword.name);
        keywordForm.clearErrors();
        setEditorOpen(true);
    }

    function closeEditor() {
        setEditorOpen(false);
        setEditingKeyword(null);
        keywordForm.reset('name');
        keywordForm.clearErrors();
    }

    function submitEditor() {
        if (editingKeyword) {
            keywordForm.put(route('admin.keywords.update', editingKeyword.id), {
                preserveScroll: true,
                onSuccess: closeEditor,
            });
            return;
        }

        keywordForm.post(route('admin.keywords.store'), {
            preserveScroll: true,
            onSuccess: closeEditor,
        });
    }

    function deleteKeyword(keyword) {
        if (keyword.research_proposals_count > 0) {
            message.warning('This keyword is currently used by research papers and cannot be deleted.');
            return;
        }

        Modal.confirm({
            title: 'Delete this keyword?',
            icon: <ExclamationCircleOutlined />,
            content: 'This keyword is not currently used. This action cannot be undone.',
            okText: 'Delete',
            okButtonProps: { danger: true },
            onOk: () => {
                const previous = tableData;
                setTableData((current) => current.filter((item) => item.id !== keyword.id));

                router.delete(route('admin.keywords.destroy', keyword.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        message.success('Keyword deleted.');
                        router.reload({ only: ['keywords'] });
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
            header={(
                <AdminPageHeader
                    title="Keyword Management"
                    actions={(
                        <Button size="large" type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                            Add Keyword
                        </Button>
                    )}
                />
            )}
        >
            <Head title="Keywords" />

            <div className="space-y-4">
                {flash?.success && <Alert type="success" showIcon message={flash.success} />}
                {flash?.error && <Alert type="error" showIcon message={flash.error} />}

                <AdminFilterCard
                    title="Manage keyword catalog"
                    description="Add official keywords used by researchers when tagging papers."
                    controls={(
                        <Row gutter={[12, 12]}>
                            <Col xs={24} md={18}>
                                <Input
                                    size="large"
                                    aria-label="Search keywords"
                                    value={search}
                                    placeholder="Search keyword"
                                    prefix={<SearchOutlined />}
                                    onChange={(event) => setSearch(event.target.value)}
                                    onPressEnter={applyFilter}
                                />
                            </Col>
                            <Col xs={24} md={6}>
                                <Button size="large" block type="primary" onClick={applyFilter} icon={<TagsOutlined />}>
                                    Apply
                                </Button>
                            </Col>
                        </Row>
                    )}
                />

                <AdminTableCard summary={`${keywords.total} keyword${keywords.total === 1 ? '' : 's'} in catalog`}>
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={tableData}
                        pagination={{
                            current: keywords.current_page,
                            pageSize: keywords.per_page,
                            total: keywords.total,
                            onChange: (page) => router.get(route('admin.keywords.index'), { search, page }, { preserveState: true, replace: true }),
                        }}
                        scroll={{ x: 720 }}
                        locale={{ emptyText: 'No keywords matched your search.' }}
                    />
                </AdminTableCard>
            </div>

            <Modal
                title={editingKeyword ? 'Edit Keyword' : 'Add Keyword'}
                open={editorOpen}
                onCancel={closeEditor}
                onOk={submitEditor}
                okText={editingKeyword ? 'Save Changes' : 'Create'}
                okButtonProps={{ loading: keywordForm.processing }}
                destroyOnHidden
            >
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <Typography.Text type="secondary">
                        Use concise, reusable terms to improve filtering and search quality.
                    </Typography.Text>
                    <Input
                        size="large"
                        value={keywordForm.data.name}
                        onChange={(event) => keywordForm.setData('name', event.target.value)}
                        placeholder="e.g., Climate Change"
                        status={keywordForm.errors.name ? 'error' : ''}
                    />
                    {keywordForm.errors.name && (
                        <Typography.Text type="danger">{keywordForm.errors.name}</Typography.Text>
                    )}
                </Space>
            </Modal>
        </AuthenticatedLayout>
    );
}

