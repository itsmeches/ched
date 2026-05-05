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
            ? <mark key={`${source}-${index}`} style={{ backgroundColor: '#fff2a8', padding: 0 }}>{part}</mark>
            : <span key={`${source}-${index}`}>{part}</span>
    ));
}

export default function DisciplinesIndex({ disciplines = [] }) {
    const { flash } = usePage().props;

    const [editorOpen, setEditorOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [processing, setProcessing] = useState(false);

    const form = useForm({
        code: '',
        name: '',
        sort_order: 0,
        is_active: true,
    });

    useEffect(() => {
        if (flash?.success) message.success(flash.success);
        if (flash?.error) message.error(flash.error);
    }, [flash?.success, flash?.error]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return disciplines.filter((item) => {
            const statusMatch = statusFilter === 'all' ? true : statusFilter === 'active' ? Boolean(item.is_active) : !Boolean(item.is_active);
            const searchMatch = q === '' ? true :
                String(item.code).toLowerCase().includes(q) ||
                String(item.name).toLowerCase().includes(q);
            return statusMatch && searchMatch;
        });
    }, [disciplines, search, statusFilter]);

    const columns = useMemo(() => [
        { title: 'Code', dataIndex: 'code', key: 'code', width: 90, render: (v) => <Tag color="purple">{highlightMatch(v, search)}</Tag> },
        { title: 'Discipline', dataIndex: 'name', key: 'name', render: (v) => highlightMatch(v, search) },
        { title: 'Order', dataIndex: 'sort_order', key: 'sort_order', width: 90, responsive: ['sm'] },
        { title: 'Status', dataIndex: 'is_active', key: 'is_active', width: 110, render: (a) => a ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag> },
        { title: 'Used', dataIndex: 'proposals_count', key: 'proposals_count', width: 90, responsive: ['sm'] },
        {
            title: 'Action', key: 'action', align: 'center', onHeaderCell: () => ({ style: { textAlign: 'center' } }),
            render: (_, row) => (
                <Space>
                    <Button type="link" onClick={() => openEdit(row)}>Edit</Button>
                    <Button danger type="link" onClick={() => deleteDiscipline(row)}>Delete</Button>
                </Space>
            ),
        },
    ], [search]);

    function openCreate() {
        setEditing(null);
        form.reset();
        form.clearErrors();
        form.setData({ code: '', name: '', sort_order: 0, is_active: true });
        setEditorOpen(true);
    }

    function openEdit(discipline) {
        setEditing(discipline);
        form.clearErrors();
        form.setData({
            code: discipline.code,
            name: discipline.name,
            sort_order: discipline.sort_order,
            is_active: Boolean(discipline.is_active),
        });
        setEditorOpen(true);
    }

    function submit() {
        const payload = {
            ...form.data,
            code: String(form.data.code || '').trim(),
            sort_order: form.data.sort_order ?? 0,
        };

        const duplicate = disciplines.find((item) => (
            String(item.code) === payload.code && item.id !== editing?.id
        ));
        if (duplicate) { message.error('Duplicate discipline code. Please use a unique code.'); return; }

        form.clearErrors();
        setProcessing(true);
        const handleError = (errors) => {
            setProcessing(false);
            form.setError(errors);
            const first = Object.values(errors)[0];
            if (first) message.error(first);
        };

        if (editing) {
            router.put(route('admin.taxonomy.disciplines.update', editing.id), payload, {
                preserveScroll: true,
                onSuccess: () => { setProcessing(false); closeEditor(); },
                onError: handleError,
            });
        } else {
            router.post(route('admin.taxonomy.disciplines.store'), payload, {
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

    function deleteDiscipline(discipline) {
        if (discipline.proposals_count > 0) {
            message.warning('This discipline is currently used by submissions and cannot be deleted.');
            return;
        }
        confirmAction({
            title: 'Delete this discipline?',
            content: 'This action cannot be undone.',
            okText: 'Delete',
            danger: true,
            onOk: () => router.delete(route('admin.taxonomy.disciplines.destroy', discipline.id), { preserveScroll: true }),
        });
    }

    return (
        <AuthenticatedLayout
            showHeader
            header={(
                <AdminPageHeader
                    title="Disciplines"
                    actions={(
                        <Button size="large" type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                            Add Discipline
                        </Button>
                    )}
                />
            )}
        >
            <Head title="Disciplines" />

            <div className="space-y-4">
                {flash?.success && <Alert type="success" showIcon message={flash.success} />}
                {flash?.error && <Alert type="error" showIcon message={flash.error} />}

                <AdminTableCard summary={`${disciplines.length} discipline${disciplines.length === 1 ? '' : 's'} configured`}>
                    <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
                        <Col xs={24} md={14}>
                            <Input
                                size="large"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search discipline code or name"
                            />
                        </Col>
                        <Col xs={24} md={10}>
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
                    <Table rowKey="id" columns={columns} dataSource={filtered} pagination={{ pageSize: 10 }} scroll={{ x: 780 }} locale={{ emptyText: <EmptyState title="No disciplines found" description="Try changing the status filter or add a new discipline." /> }} />
                </AdminTableCard>
            </div>

            <Modal
                title={editing ? 'Edit Discipline' : 'Add Discipline'}
                open={editorOpen}
                onCancel={closeEditor}
                onOk={submit}
                okText={editing ? 'Save Changes' : 'Create'}
                okButtonProps={{ loading: processing }}
                destroyOnHidden
            >
                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                    <Input
                        size="large"
                        value={form.data.code}
                        onChange={(e) => form.setData('code', String(e.target.value || '').replace(/\D+/g, '').slice(0, 2))}
                        placeholder="Code (2 digits, e.g., 47)"
                        status={form.errors.code ? 'error' : ''}
                    />
                    {form.errors.code && <Typography.Text type="danger">{form.errors.code}</Typography.Text>}
                    <Input
                        size="large"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        placeholder="Discipline name"
                        status={form.errors.name ? 'error' : ''}
                    />
                    {form.errors.name && <Typography.Text type="danger">{form.errors.name}</Typography.Text>}
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
