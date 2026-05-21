import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import AdminTableCard from '@/Components/Admin/AdminTableCard';
import EmptyState from '@/Components/EmptyState';
import { confirmAction } from '@/utils/confirmAction';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState, useEffect } from 'react';
import {
    Alert,
    Button,
    Col,
    Input,
    InputNumber,
    Modal,
    Row,
    Select,
    Space,
    Switch,
    Table,
    Tag,
    Typography,
    message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';

function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightMatch(text, query) {
    const source = String(text ?? '');
    const needle = String(query ?? '').trim();

    if (needle === '') {
        return source;
    }

    const pattern = new RegExp(`(${escapeRegExp(needle)})`, 'ig');
    const parts = source.split(pattern);

    return parts.map((part, index) =>
        part.toLowerCase() === needle.toLowerCase() ? (
            <mark
                key={`${source}-${index}`}
                className="rounded-sm bg-amber-200/80 px-0 text-slate-900 dark:bg-amber-300 dark:text-slate-900"
            >
                {part}
            </mark>
        ) : (
            <span key={`${source}-${index}`}>{part}</span>
        )
    );
}

export default function TaxonomyIndex({ categories = [], disciplines = [], categoryTypes = [] }) {
    const { flash } = usePage().props;

    const [categoryEditorOpen, setCategoryEditorOpen] = useState(false);
    const [disciplineEditorOpen, setDisciplineEditorOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingDiscipline, setEditingDiscipline] = useState(null);
    const [categorySearch, setCategorySearch] = useState('');
    const [categoryTypeFilter, setCategoryTypeFilter] = useState('all');
    const [categoryStatusFilter, setCategoryStatusFilter] = useState('all');
    const [disciplineSearch, setDisciplineSearch] = useState('');
    const [disciplineStatusFilter, setDisciplineStatusFilter] = useState('all');
    const [categoryProcessing, setCategoryProcessing] = useState(false);
    const [disciplineProcessing, setDisciplineProcessing] = useState(false);

    const categoryForm = useForm({
        type: 'data_type',
        value: '',
        label: '',
        sort_order: 0,
        is_active: true,
    });

    const disciplineForm = useForm({
        code: '',
        name: '',
        sort_order: 0,
        is_active: true,
    });

    useEffect(() => {
        if (flash?.success) {
            message.success(flash.success);
        }
        if (flash?.error) {
            message.error(flash.error);
        }
    }, [flash?.success, flash?.error]);

    const categoryTypeLabel = useMemo(
        () => Object.fromEntries(categoryTypes.map((item) => [item.value, item.label])),
        [categoryTypes]
    );

    const filteredCategories = useMemo(() => {
        const search = categorySearch.trim().toLowerCase();

        return categories.filter((item) => {
            const typeMatch =
                categoryTypeFilter === 'all' ? true : item.type === categoryTypeFilter;
            const statusMatch =
                categoryStatusFilter === 'all'
                    ? true
                    : categoryStatusFilter === 'active'
                      ? Boolean(item.is_active)
                      : !item.is_active;

            const searchMatch =
                search === ''
                    ? true
                    : String(item.label).toLowerCase().includes(search) ||
                      String(item.value).toLowerCase().includes(search) ||
                      String(categoryTypeLabel[item.type] || item.type)
                          .toLowerCase()
                          .includes(search);

            return typeMatch && statusMatch && searchMatch;
        });
    }, [categories, categorySearch, categoryTypeFilter, categoryStatusFilter, categoryTypeLabel]);

    const filteredDisciplines = useMemo(() => {
        const search = disciplineSearch.trim().toLowerCase();

        return disciplines.filter((item) => {
            const statusMatch =
                disciplineStatusFilter === 'all'
                    ? true
                    : disciplineStatusFilter === 'active'
                      ? Boolean(item.is_active)
                      : !item.is_active;

            const searchMatch =
                search === ''
                    ? true
                    : String(item.code).toLowerCase().includes(search) ||
                      String(item.name).toLowerCase().includes(search);

            return statusMatch && searchMatch;
        });
    }, [disciplines, disciplineSearch, disciplineStatusFilter]);

    const categoryColumns = useMemo(
        () => [
            {
                title: 'Group',
                dataIndex: 'type',
                key: 'type',
                render: (value) =>
                    highlightMatch(categoryTypeLabel[value] || value, categorySearch),
            },
            {
                title: 'Stored Value',
                dataIndex: 'value',
                key: 'value',
                render: (value) => <Tag color="blue">{highlightMatch(value, categorySearch)}</Tag>,
            },
            {
                title: 'Label',
                dataIndex: 'label',
                key: 'label',
                render: (value) => highlightMatch(value, categorySearch),
            },
            {
                title: 'Order',
                dataIndex: 'sort_order',
                key: 'sort_order',
                width: 90,
            },
            {
                title: 'Status',
                dataIndex: 'is_active',
                key: 'is_active',
                width: 110,
                render: (active) =>
                    active ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>,
            },
            {
                title: 'Used',
                dataIndex: 'proposals_count',
                key: 'proposals_count',
                width: 90,
            },
            {
                title: 'Action',
                key: 'action',
                align: 'center',
                onHeaderCell: () => ({ style: { textAlign: 'center' } }),
                render: (_, row) => (
                    <Space>
                        <Button
                            type="link"
                            className="edit-action-btn"
                            onClick={() => openCategoryEdit(row)}
                        >
                            Edit
                        </Button>
                        <Button danger type="link" onClick={() => deleteCategory(row)}>
                            Delete
                        </Button>
                    </Space>
                ),
            },
        ],
        [categoryTypeLabel, categorySearch]
    );

    const disciplineColumns = useMemo(
        () => [
            {
                title: 'Code',
                dataIndex: 'code',
                key: 'code',
                width: 90,
                render: (value) => (
                    <Tag color="purple">{highlightMatch(value, disciplineSearch)}</Tag>
                ),
            },
            {
                title: 'Discipline',
                dataIndex: 'name',
                key: 'name',
                render: (value) => highlightMatch(value, disciplineSearch),
            },
            {
                title: 'Order',
                dataIndex: 'sort_order',
                key: 'sort_order',
                width: 90,
            },
            {
                title: 'Status',
                dataIndex: 'is_active',
                key: 'is_active',
                width: 110,
                render: (active) =>
                    active ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>,
            },
            {
                title: 'Used',
                dataIndex: 'proposals_count',
                key: 'proposals_count',
                width: 90,
            },
            {
                title: 'Action',
                key: 'action',
                align: 'center',
                onHeaderCell: () => ({ style: { textAlign: 'center' } }),
                render: (_, row) => (
                    <Space>
                        <Button
                            type="link"
                            className="edit-action-btn"
                            onClick={() => openDisciplineEdit(row)}
                        >
                            Edit
                        </Button>
                        <Button danger type="link" onClick={() => deleteDiscipline(row)}>
                            Delete
                        </Button>
                    </Space>
                ),
            },
        ],
        [disciplineSearch]
    );

    function openCategoryCreate() {
        setEditingCategory(null);
        categoryForm.reset();
        categoryForm.clearErrors();
        categoryForm.setData({
            type: 'data_type',
            value: '',
            label: '',
            sort_order: 0,
            is_active: true,
        });
        setCategoryEditorOpen(true);
    }

    function openCategoryEdit(category) {
        setEditingCategory(category);
        categoryForm.clearErrors();
        categoryForm.setData({
            type: category.type,
            value: category.value,
            label: category.label,
            sort_order: category.sort_order,
            is_active: Boolean(category.is_active),
        });
        setCategoryEditorOpen(true);
    }

    function submitCategory() {
        const payload = {
            ...categoryForm.data,
            value: String(categoryForm.data.value || '')
                .trim()
                .toLowerCase()
                .replace(/\s+/g, '_'),
            sort_order: categoryForm.data.sort_order ?? 0,
        };

        const duplicate = categories.find(
            (item) =>
                String(item.value).toLowerCase() === payload.value &&
                item.id !== editingCategory?.id
        );

        if (duplicate) {
            message.error('Duplicate category value detected. Please use a unique stored value.');
            return;
        }

        categoryForm.clearErrors();
        setCategoryProcessing(true);

        const handleError = (errors) => {
            setCategoryProcessing(false);
            categoryForm.setError(errors);
            const first = Object.values(errors)[0];
            if (first) message.error(first);
        };

        if (editingCategory) {
            router.put(route('admin.taxonomy.categories.update', editingCategory.id), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setCategoryProcessing(false);
                    closeCategoryEditor();
                },
                onError: handleError,
            });
            return;
        }

        router.post(route('admin.taxonomy.categories.store'), payload, {
            preserveScroll: true,
            onSuccess: () => {
                setCategoryProcessing(false);
                closeCategoryEditor();
            },
            onError: handleError,
        });
    }

    function closeCategoryEditor() {
        setCategoryEditorOpen(false);
        setEditingCategory(null);
        categoryForm.reset();
        categoryForm.clearErrors();
    }

    function deleteCategory(category) {
        if (category.proposals_count > 0) {
            message.warning(
                'This category is currently used by submissions and cannot be deleted.'
            );
            return;
        }

        confirmAction({
            title: 'Delete this research category?',
            content: 'This action cannot be undone.',
            okText: 'Delete',
            danger: true,
            onOk: () =>
                router.delete(route('admin.taxonomy.categories.destroy', category.id), {
                    preserveScroll: true,
                }),
        });
    }

    function openDisciplineCreate() {
        setEditingDiscipline(null);
        disciplineForm.reset();
        disciplineForm.clearErrors();
        disciplineForm.setData({ code: '', name: '', sort_order: 0, is_active: true });
        setDisciplineEditorOpen(true);
    }

    function openDisciplineEdit(discipline) {
        setEditingDiscipline(discipline);
        disciplineForm.clearErrors();
        disciplineForm.setData({
            code: discipline.code,
            name: discipline.name,
            sort_order: discipline.sort_order,
            is_active: Boolean(discipline.is_active),
        });
        setDisciplineEditorOpen(true);
    }

    function submitDiscipline() {
        const payload = {
            ...disciplineForm.data,
            code: String(disciplineForm.data.code || '').trim(),
            sort_order: disciplineForm.data.sort_order ?? 0,
        };

        const duplicate = disciplines.find(
            (item) => String(item.code) === payload.code && item.id !== editingDiscipline?.id
        );

        if (duplicate) {
            message.error('Duplicate discipline code detected. Please use a unique code.');
            return;
        }

        disciplineForm.clearErrors();
        setDisciplineProcessing(true);

        const handleError = (errors) => {
            setDisciplineProcessing(false);
            disciplineForm.setError(errors);
            const first = Object.values(errors)[0];
            if (first) message.error(first);
        };

        if (editingDiscipline) {
            router.put(route('admin.taxonomy.disciplines.update', editingDiscipline.id), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setDisciplineProcessing(false);
                    closeDisciplineEditor();
                },
                onError: handleError,
            });
            return;
        }

        router.post(route('admin.taxonomy.disciplines.store'), payload, {
            preserveScroll: true,
            onSuccess: () => {
                setDisciplineProcessing(false);
                closeDisciplineEditor();
            },
            onError: handleError,
        });
    }

    function closeDisciplineEditor() {
        setDisciplineEditorOpen(false);
        setEditingDiscipline(null);
        disciplineForm.reset();
        disciplineForm.clearErrors();
    }

    function deleteDiscipline(discipline) {
        if (discipline.proposals_count > 0) {
            message.warning(
                'This discipline is currently used by submissions and cannot be deleted.'
            );
            return;
        }

        confirmAction({
            title: 'Delete this discipline?',
            content: 'This action cannot be undone.',
            okText: 'Delete',
            danger: true,
            onOk: () =>
                router.delete(route('admin.taxonomy.disciplines.destroy', discipline.id), {
                    preserveScroll: true,
                }),
        });
    }

    return (
        <AuthenticatedLayout
            showHeader
            header={
                <AdminPageHeader
                    title="Research Taxonomy"
                    actions={
                        <Space>
                            <Button
                                size="large"
                                icon={<PlusOutlined />}
                                onClick={openCategoryCreate}
                            >
                                Add Category
                            </Button>
                            <Button
                                size="large"
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={openDisciplineCreate}
                            >
                                Add Discipline
                            </Button>
                        </Space>
                    }
                />
            }
        >
            <Head title="Research Taxonomy" />

            <div className="space-y-4">
                {flash?.success && <Alert type="success" showIcon message={flash.success} />}
                {flash?.error && <Alert type="error" showIcon message={flash.error} />}

                <div id="categories">
                    <AdminTableCard
                        summary={`${categories.length} research categor${categories.length === 1 ? 'y' : 'ies'} configured`}
                    >
                        <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
                            <Col xs={24} md={10}>
                                <Input
                                    size="large"
                                    value={categorySearch}
                                    onChange={(event) => setCategorySearch(event.target.value)}
                                    placeholder="Search category label, value, or group"
                                />
                            </Col>
                            <Col xs={24} md={7}>
                                <Select
                                    size="large"
                                    value={categoryTypeFilter}
                                    onChange={setCategoryTypeFilter}
                                    style={{ width: '100%' }}
                                    options={[
                                        { value: 'all', label: 'All Groups' },
                                        ...categoryTypes,
                                    ]}
                                />
                            </Col>
                            <Col xs={24} md={7}>
                                <Select
                                    size="large"
                                    value={categoryStatusFilter}
                                    onChange={setCategoryStatusFilter}
                                    style={{ width: '100%' }}
                                    options={[
                                        { value: 'all', label: 'All Statuses' },
                                        { value: 'active', label: 'Active' },
                                        { value: 'inactive', label: 'Inactive' },
                                    ]}
                                />
                            </Col>
                        </Row>
                        <Table
                            rowKey="id"
                            columns={categoryColumns}
                            dataSource={filteredCategories}
                            pagination={{ pageSize: 10 }}
                            scroll={{ x: 860 }}
                            locale={{
                                emptyText: (
                                    <EmptyState
                                        title="No categories found"
                                        description="Adjust filters or add a new research category."
                                    />
                                ),
                            }}
                        />
                    </AdminTableCard>
                </div>

                <div id="disciplines">
                    <AdminTableCard
                        summary={`${disciplines.length} discipline${disciplines.length === 1 ? '' : 's'} configured`}
                    >
                        <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
                            <Col xs={24} md={14}>
                                <Input
                                    size="large"
                                    value={disciplineSearch}
                                    onChange={(event) => setDisciplineSearch(event.target.value)}
                                    placeholder="Search discipline code or name"
                                />
                            </Col>
                            <Col xs={24} md={10}>
                                <Select
                                    size="large"
                                    value={disciplineStatusFilter}
                                    onChange={setDisciplineStatusFilter}
                                    style={{ width: '100%' }}
                                    options={[
                                        { value: 'all', label: 'All Statuses' },
                                        { value: 'active', label: 'Active' },
                                        { value: 'inactive', label: 'Inactive' },
                                    ]}
                                />
                            </Col>
                        </Row>
                        <Table
                            rowKey="id"
                            columns={disciplineColumns}
                            dataSource={filteredDisciplines}
                            pagination={{ pageSize: 10 }}
                            scroll={{ x: 780 }}
                            locale={{
                                emptyText: (
                                    <EmptyState
                                        title="No disciplines found"
                                        description="Try changing filters or create a new discipline."
                                    />
                                ),
                            }}
                        />
                    </AdminTableCard>
                </div>
            </div>

            <Modal
                title={editingCategory ? 'Edit Research Category' : 'Add Research Category'}
                open={categoryEditorOpen}
                onCancel={closeCategoryEditor}
                onOk={submitCategory}
                okText={editingCategory ? 'Save Changes' : 'Create'}
                okButtonProps={{ loading: categoryProcessing }}
                destroyOnHidden
            >
                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                    <Select
                        size="large"
                        value={categoryForm.data.type}
                        options={categoryTypes}
                        onChange={(value) => categoryForm.setData('type', value)}
                    />
                    <Input
                        size="large"
                        value={categoryForm.data.label}
                        onChange={(event) => categoryForm.setData('label', event.target.value)}
                        placeholder="Display label (e.g., Ethnography)"
                        status={categoryForm.errors.label ? 'error' : ''}
                    />
                    {categoryForm.errors.label && (
                        <Typography.Text type="danger">{categoryForm.errors.label}</Typography.Text>
                    )}
                    <Input
                        size="large"
                        value={categoryForm.data.value}
                        onChange={(event) => categoryForm.setData('value', event.target.value)}
                        placeholder="Stored value (snake_case, e.g., ethnography)"
                        status={categoryForm.errors.value ? 'error' : ''}
                    />
                    {categoryForm.errors.value && (
                        <Typography.Text type="danger">{categoryForm.errors.value}</Typography.Text>
                    )}
                    <InputNumber
                        size="large"
                        min={0}
                        style={{ width: '100%' }}
                        value={categoryForm.data.sort_order}
                        onChange={(value) => categoryForm.setData('sort_order', value ?? 0)}
                        placeholder="Sort order"
                    />
                    <Space align="center">
                        <Switch
                            checked={Boolean(categoryForm.data.is_active)}
                            onChange={(checked) => categoryForm.setData('is_active', checked)}
                        />
                        <Typography.Text>Active option</Typography.Text>
                    </Space>
                </Space>
            </Modal>

            <Modal
                title={editingDiscipline ? 'Edit Discipline' : 'Add Discipline'}
                open={disciplineEditorOpen}
                onCancel={closeDisciplineEditor}
                onOk={submitDiscipline}
                okText={editingDiscipline ? 'Save Changes' : 'Create'}
                okButtonProps={{ loading: disciplineProcessing }}
                destroyOnHidden
            >
                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                    <Input
                        size="large"
                        value={disciplineForm.data.code}
                        onChange={(event) =>
                            disciplineForm.setData(
                                'code',
                                String(event.target.value || '')
                                    .replace(/\D+/g, '')
                                    .slice(0, 2)
                            )
                        }
                        placeholder="Code (2 digits, e.g., 47)"
                        status={disciplineForm.errors.code ? 'error' : ''}
                    />
                    {disciplineForm.errors.code && (
                        <Typography.Text type="danger">
                            {disciplineForm.errors.code}
                        </Typography.Text>
                    )}
                    <Input
                        size="large"
                        value={disciplineForm.data.name}
                        onChange={(event) => disciplineForm.setData('name', event.target.value)}
                        placeholder="Discipline name"
                        status={disciplineForm.errors.name ? 'error' : ''}
                    />
                    {disciplineForm.errors.name && (
                        <Typography.Text type="danger">
                            {disciplineForm.errors.name}
                        </Typography.Text>
                    )}
                    <InputNumber
                        size="large"
                        min={0}
                        style={{ width: '100%' }}
                        value={disciplineForm.data.sort_order}
                        onChange={(value) => disciplineForm.setData('sort_order', value ?? 0)}
                        placeholder="Sort order"
                    />
                    <Space align="center">
                        <Switch
                            checked={Boolean(disciplineForm.data.is_active)}
                            onChange={(checked) => disciplineForm.setData('is_active', checked)}
                        />
                        <Typography.Text>Active option</Typography.Text>
                    </Space>
                </Space>
            </Modal>
        </AuthenticatedLayout>
    );
}
