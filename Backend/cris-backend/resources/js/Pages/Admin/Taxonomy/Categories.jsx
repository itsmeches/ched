import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import AdminTableCard from '@/Components/Admin/AdminTableCard';
import EmptyState from '@/Components/EmptyState';
import { confirmAction } from '@/utils/confirmAction';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState, useEffect } from 'react';
import { Alert, Button, Col, Input, InputNumber, Modal, Row, Select, Space, Switch, Table, Tag, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightMatch(text, query) {
    const source = String(text ?? '');
    const needle = String(query ?? '').trim();
    if (needle === '') return source;
    const pattern = new RegExp(`(${escapeRegExp(needle)})`, 'ig');
    const parts = source.split(pattern);
    return parts.map((part, index) => (
        part.toLowerCase() === needle.toLowerCase()
            ? <mark key={`${source}-${index}`} className="rounded-sm bg-amber-200/80 px-0 text-slate-900 dark:bg-amber-300 dark:text-slate-900">{part}</mark>
            : <span key={`${source}-${index}`}>{part}</span>
    ));
}

export default function CategoriesIndex({ categories = [], categoryTypes = [] }) {
    const { flash } = usePage().props;

    const [editorOpen, setEditorOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [processing, setProcessing] = useState(false);

    const form = useForm({
        type: 'data_type',
        value: '',
        label: '',
        sort_order: 0,
        is_active: true,
    });

    useEffect(() => {
        if (flash?.success) message.success(flash.success);
        if (flash?.error) message.error(flash.error);
    }, [flash?.success, flash?.error]);

    const categoryTypeLabel = useMemo(
        () => Object.fromEntries(categoryTypes.map((item) => [item.value, item.label])),
        [categoryTypes],
    );

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return categories.filter((item) => {
            const typeMatch = typeFilter === 'all' ? true : item.type === typeFilter;
            const statusMatch = statusFilter === 'all' ? true : statusFilter === 'active' ? Boolean(item.is_active) : !Boolean(item.is_active);
            const searchMatch = q === '' ? true :
                String(item.label).toLowerCase().includes(q) ||
                String(item.value).toLowerCase().includes(q) ||
                String(categoryTypeLabel[item.type] || item.type).toLowerCase().includes(q);
            return typeMatch && statusMatch && searchMatch;
        });
    }, [categories, search, typeFilter, statusFilter, categoryTypeLabel]);

    const columns = useMemo(() => [
        { title: 'Group', dataIndex: 'type', key: 'type', render: (v) => highlightMatch(categoryTypeLabel[v] || v, search) },
        { title: 'Stored Value', dataIndex: 'value', key: 'value', responsive: ['sm'], render: (v) => <Tag color="blue">{highlightMatch(v, search)}</Tag> },
        { title: 'Label', dataIndex: 'label', key: 'label', render: (v) => highlightMatch(v, search) },
        { title: 'Order', dataIndex: 'sort_order', key: 'sort_order', width: 90, responsive: ['md'] },
        { title: 'Status', dataIndex: 'is_active', key: 'is_active', width: 110, responsive: ['sm'], render: (a) => a ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag> },
        { title: 'Used', dataIndex: 'proposals_count', key: 'proposals_count', width: 90, responsive: ['md'] },
        {
            title: 'Action', key: 'action', align: 'center', onHeaderCell: () => ({ style: { textAlign: 'center' } }),
            render: (_, row) => (
                <Space>
                    <Button type="link" onClick={() => openEdit(row)}>Edit</Button>
                    <Button danger type="link" onClick={() => deleteCategory(row)}>Delete</Button>
                </Space>
            ),
        },
    ], [categoryTypeLabel, search]);

    function openCreate() {
        setEditing(null);
        form.reset();
        form.clearErrors();
        form.setData({ type: 'data_type', value: '', label: '', sort_order: 0, is_active: true });
        setEditorOpen(true);
    }

    function openEdit(category) {
        setEditing(category);
        form.clearErrors();
        form.setData({
            type: category.type,
            value: category.value,
            label: category.label,
            sort_order: category.sort_order,
            is_active: Boolean(category.is_active),
        });
        setEditorOpen(true);
    }

    function submit() {
        const payload = {
            ...form.data,
            value: String(form.data.value || '').trim().toLowerCase().replace(/\s+/g, '_'),
            sort_order: form.data.sort_order ?? 0,
        };

        const duplicate = categories.find((item) => (
            String(item.value).toLowerCase() === payload.value && item.id !== editing?.id
        ));
        if (duplicate) { message.error('Duplicate category value. Please use a unique stored value.'); return; }

        form.clearErrors();
        setProcessing(true);
        const handleError = (errors) => {
            setProcessing(false);
            form.setError(errors);
            const first = Object.values(errors)[0];
            if (first) message.error(first);
        };

        if (editing) {
            router.put(route('admin.taxonomy.categories.update', editing.id), payload, {
                preserveScroll: true,
                onSuccess: () => { setProcessing(false); closeEditor(); },
                onError: handleError,
            });
        } else {
            router.post(route('admin.taxonomy.categories.store'), payload, {
                preserveScroll: true,
                onSuccess: () => { setProcessing(false); closeEditor(); },
                onError: handleError,
            });
        }
    }

    function closeEditor() {
        setEditorOpen(false);
        setEditing(null);
        form.reset();
        form.clearErrors();
    }

    function deleteCategory(category) {
        if (category.proposals_count > 0) {
            message.warning('This category is currently used by submissions and cannot be deleted.');
            return;
        }
        confirmAction({
            title: 'Delete this research category?',
            content: 'This action cannot be undone.',
            okText: 'Delete',
            danger: true,
            onOk: () => router.delete(route('admin.taxonomy.categories.destroy', category.id), { preserveScroll: true }),
        });
    }

    return (
        <AuthenticatedLayout
            showHeader
            header={(
                <AdminPageHeader
                    title="Research Categories"
                    actions={(
                        <Button size="large" type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                            Add Category
                        </Button>
                    )}
                />
            )}
        >
            <Head title="Research Categories" />

            <div className="space-y-4">
                {flash?.success && <Alert type="success" showIcon message={flash.success} />}
                {flash?.error && <Alert type="error" showIcon message={flash.error} />}

                <AdminTableCard summary={`${categories.length} research categor${categories.length === 1 ? 'y' : 'ies'} configured`}>
                    <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
                        <Col xs={24} md={10}>
                            <Input
                                size="large"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search category label, value, or group"
                            />
                        </Col>
                        <Col xs={24} md={7}>
                            <Select
                                size="large"
                                value={typeFilter}
                                onChange={setTypeFilter}
                                style={{ width: '100%' }}
                                options={[{ value: 'all', label: 'All Groups' }, ...categoryTypes]}
                            />
                        </Col>
                        <Col xs={24} md={7}>
                            <Select
                                size="large"
                                value={statusFilter}
                                onChange={setStatusFilter}
                                style={{ width: '100%' }}
                                options={[
                                    { value: 'all', label: 'All Statuses' },
                                    { value: 'active', label: 'Active' },
                                    { value: 'inactive', label: 'Inactive' },
                                ]}
                            />
                        </Col>
                    </Row>
                    <Table rowKey="id" columns={columns} dataSource={filtered} pagination={{ pageSize: 10 }} scroll={{ x: 860 }} locale={{ emptyText: <EmptyState title="No categories found" description="Adjust filters or create a new research category." /> }} />
                </AdminTableCard>
            </div>

            <Modal
                title={editing ? 'Edit Research Category' : 'Add Research Category'}
                open={editorOpen}
                onCancel={closeEditor}
                onOk={submit}
                okText={editing ? 'Save Changes' : 'Create'}
                okButtonProps={{ loading: processing }}
                destroyOnHidden
            >
                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                    <Select
                        size="large"
                        value={form.data.type}
                        options={categoryTypes}
                        onChange={(v) => form.setData('type', v)}
                    />
                    <Input
                        size="large"
                        value={form.data.label}
                        onChange={(e) => form.setData('label', e.target.value)}
                        placeholder="Display label (e.g., Ethnography)"
                        status={form.errors.label ? 'error' : ''}
                    />
                    {form.errors.label && <Typography.Text type="danger">{form.errors.label}</Typography.Text>}
                    <Input
                        size="large"
                        value={form.data.value}
                        onChange={(e) => form.setData('value', e.target.value)}
                        placeholder="Stored value (snake_case, e.g., ethnography)"
                        status={form.errors.value ? 'error' : ''}
                    />
                    {form.errors.value && <Typography.Text type="danger">{form.errors.value}</Typography.Text>}
                    <InputNumber
                        size="large"
                        min={0}
                        style={{ width: '100%' }}
                        value={form.data.sort_order}
                        onChange={(v) => form.setData('sort_order', v ?? 0)}
                        placeholder="Sort order"
                    />
                    <Space align="center">
                        <Switch checked={Boolean(form.data.is_active)} onChange={(c) => form.setData('is_active', c)} />
                        <Typography.Text>Active option</Typography.Text>
                    </Space>
                </Space>
            </Modal>
        </AuthenticatedLayout>
    );
}
