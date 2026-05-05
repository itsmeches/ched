import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import { Head, Link, router } from '@inertiajs/react';
import { Button, Card, Checkbox, Col, DatePicker, Input, Pagination, Row, Select, Space, Tag, Timeline, Typography } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    DownloadOutlined,
    DeleteOutlined,
    EditOutlined,
    HistoryOutlined,
    PlusCircleOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTheme } from '@/utils/ThemeContext';

const ACTION_CONFIG = {
    created:  { color: '#16a34a', icon: <PlusCircleOutlined />,  label: 'Submitted' },
    updated:  { color: '#2563eb', icon: <EditOutlined />,        label: 'Updated'   },
    deleted:  { color: '#dc2626', icon: <DeleteOutlined />,      label: 'Deleted'   },
    approved: { color: '#0033a0', icon: <CheckCircleOutlined />, label: 'Approved'  },
    rejected: { color: '#d97706', icon: <CloseCircleOutlined />, label: 'Rejected'  },
};

const FIELD_LABELS = {
    title: 'Title', authors: 'Authors', author_email: 'Author Email',
    author_phone: 'Author Phone', co_authors: 'Co-Authors',
    co_author_emails: 'Co-Author Emails', co_author_phones: 'Co-Author Phones',
    year: 'Year', school: 'School', abstract: 'Abstract',
    category: 'Category', keywords: 'Keywords', status: 'Status', comments: 'Reviewer Comments',
};

const EXPORT_COLUMN_OPTIONS = [
    { label: 'ID', value: 'id' },
    { label: 'Performed At', value: 'performed_at' },
    { label: 'Action', value: 'action' },
    { label: 'Actor Name', value: 'actor_name' },
    { label: 'Actor Role', value: 'actor_role' },
    { label: 'Proposal ID', value: 'proposal_id' },
    { label: 'Proposal Title', value: 'proposal_title' },
    { label: 'Old Values', value: 'old_values' },
    { label: 'New Values', value: 'new_values' },
];

const DEFAULT_EXPORT_COLUMNS = EXPORT_COLUMN_OPTIONS.map((item) => item.value);

function formatTs(ts) {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
}

const ROLE_HEADING = {
    super_admin: 'All Activity — System-wide History',
    ched: 'My CHED Activity History',
    hei: 'My Research History',
};

function formatValue(value) {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    if (Array.isArray(value)) {
        return value.join(', ');
    }

    if (typeof value === 'object') {
        return JSON.stringify(value);
    }

    return String(value);
}

function getDayLabel(dateKey) {
    const day = dayjs(dateKey);
    if (day.isSame(dayjs(), 'day')) {
        return 'Today';
    }

    if (day.isSame(dayjs().subtract(1, 'day'), 'day')) {
        return 'Yesterday';
    }

    return day.format('MMMM D, YYYY');
}

export default function HistoryIndex({ history, filters, role, stats }) {
    const { dark } = useTheme();
    
    // Theme-aware colors
    const textMuted = dark ? '#94a3b8' : '#64748b';
    const textSecondary = dark ? '#cbd5e1' : '#334155';
    const textTertiary = dark ? '#64748b' : '#475569';
    const borderColor = dark ? '#1e2d47' : '#f1f5f9';
    const bgMuted = dark ? 'rgba(30,45,71,0.4)' : '#f8fafc';
    const textNormal = dark ? '#e2e8f0' : '#0f172a';
    const [search, setSearch] = useState(filters.search ?? '');
    const [action, setAction] = useState(filters.action ?? '');
    const [range, setRange] = useState(filters.range ?? '');
    const [customRange, setCustomRange] = useState(
        filters.from && filters.to ? [dayjs(filters.from), dayjs(filters.to)] : null,
    );
    const [expandedEntryId, setExpandedEntryId] = useState(null);
    const [exportColumns, setExportColumns] = useState(DEFAULT_EXPORT_COLUMNS);
    const allColumnsSelected = exportColumns.length === DEFAULT_EXPORT_COLUMNS.length;
    const someColumnsSelected = exportColumns.length > 0 && !allColumnsSelected;

    function applyFilters(overrides = {}) {
        const base = {
            search,
            action,
            range,
            from: range === 'custom' && customRange?.[0] ? customRange[0].format('YYYY-MM-DD') : undefined,
            to: range === 'custom' && customRange?.[1] ? customRange[1].format('YYYY-MM-DD') : undefined,
        };

        const params = { ...base, ...overrides };

        if (!params.search) delete params.search;
        if (!params.action) delete params.action;
        if (!params.range) delete params.range;
        if (params.range !== 'custom') {
            delete params.from;
            delete params.to;
        }

        router.get(
            route('history.index'),
            params,
            { preserveState: true, replace: true },
        );
    }

    function resetFilters() {
        setSearch('');
        setAction('');
        setRange('');
        setCustomRange(null);

        router.get(route('history.index'), {}, { preserveState: true, replace: true });
    }

    function exportCsv() {
        const selectedColumns = exportColumns.length > 0 ? exportColumns : DEFAULT_EXPORT_COLUMNS;

        const params = {
            search,
            action,
            range,
            from: range === 'custom' && customRange?.[0] ? customRange[0].format('YYYY-MM-DD') : undefined,
            to: range === 'custom' && customRange?.[1] ? customRange[1].format('YYYY-MM-DD') : undefined,
            columns: selectedColumns,
        };

        if (!params.search) delete params.search;
        if (!params.action) delete params.action;
        if (!params.range) delete params.range;
        if (params.range !== 'custom') {
            delete params.from;
            delete params.to;
        }

        window.location.href = route('history.export', params);
    }

    const statItems = [
        { key: 'total', label: 'Total Entries', value: stats?.total ?? 0, color: '#0033a0' },
        { key: 'created', label: 'Submitted', value: stats?.created ?? 0, color: '#16a34a' },
        { key: 'updated', label: 'Updated', value: stats?.updated ?? 0, color: '#2563eb' },
        { key: 'approved', label: 'Approved', value: stats?.approved ?? 0, color: '#0033a0' },
        { key: 'rejected', label: 'Rejected', value: stats?.rejected ?? 0, color: '#d97706' },
        { key: 'deleted', label: 'Deleted', value: stats?.deleted ?? 0, color: '#dc2626' },
    ];

    const timelineItems = history.data.map((entry) => {
        const cfg = ACTION_CONFIG[entry.action] ?? { color: '#64748b', icon: <HistoryOutlined />, label: entry.action };
        return {
            key: entry.id,
            color: cfg.color,
            dot: <span style={{ fontSize: 16, color: cfg.color }}>{cfg.icon}</span>,
            label: (
                <span style={{ fontSize: 12, color: textMuted, minWidth: 140, display: 'inline-block' }}>
                    {formatTs(entry.performed_at)}
                </span>
            ),
            children: (
                <div style={{ paddingBottom: 12 }}>
                    {/* Paper title link */}
                    {entry.proposal && (
                        <Link href={route('research.show', entry.proposal.id)}>
                            <Typography.Text
                                strong
                                style={{ color: '#0033a0', fontSize: 13, display: 'block', marginBottom: 4 }}
                            >
                                {entry.proposal.title}
                            </Typography.Text>
                        </Link>
                    )}

                    {/* Action + actor */}
                    <Space wrap size={4} style={{ marginBottom: 6 }}>
                        <Tag color={cfg.color} style={{ marginInlineEnd: 0 }}>{cfg.label}</Tag>
                        <span style={{ fontSize: 13, color: textSecondary }}>
                            {entry.actor ? entry.actor.name : 'System'}
                        </span>
                        {entry.actor?.role && (
                            <Tag style={{ fontSize: 11 }}>{entry.actor.role.toUpperCase()}</Tag>
                        )}
                    </Space>

                    {/* Diff for updates */}
                    {entry.action === 'updated' && entry.new_values && (
                        <div style={{ marginTop: 6 }}>
                            {(expandedEntryId === entry.id
                                ? Object.keys(entry.new_values)
                                : Object.keys(entry.new_values).slice(0, 3)
                            ).map((field) => (
                                <div
                                    key={field}
                                    style={{
                                        marginBottom: 6,
                                        padding: '6px 10px',
                                        background: bgMuted,
                                        borderRadius: 6,
                                        border: `1px solid ${borderColor}`,
                                    }}
                                >
                                    <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: textMuted, letterSpacing: '0.05em' }}>
                                        {FIELD_LABELS[field] ?? field}
                                    </span>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                                        <span style={{
                                            fontSize: 12, color: '#b91c1c', background: '#fef2f2',
                                            borderRadius: 4, padding: '2px 6px',
                                            maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block',
                                        }}>
                                            {formatValue(entry.old_values?.[field])}
                                        </span>
                                        <span style={{ color: '#94a3b8' }}>→</span>
                                        <span style={{
                                            fontSize: 12, color: '#15803d', background: '#f0fdf4',
                                            borderRadius: 4, padding: '2px 6px',
                                            maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block',
                                        }}>
                                            {formatValue(entry.new_values[field])}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {Object.keys(entry.new_values).length > 3 && (
                                <Button
                                    type="link"
                                    size="small"
                                    style={{ paddingLeft: 0, marginTop: 2 }}
                                    onClick={() => setExpandedEntryId((prev) => (prev === entry.id ? null : entry.id))}
                                >
                                    {expandedEntryId === entry.id
                                        ? 'Show less changes'
                                        : `Show ${Object.keys(entry.new_values).length - 3} more changes`}
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Review comments */}
                    {(entry.action === 'approved' || entry.action === 'rejected') && entry.new_values?.comments && (
                        <div style={{ marginTop: 4, fontSize: 12, color: textTertiary, fontStyle: 'italic' }}>
                            "{entry.new_values.comments}"
                        </div>
                    )}
                </div>
            ),
        };
    });

    const groupedTimeline = history.data.reduce((acc, entry, index) => {
        const key = dayjs(entry.performed_at).format('YYYY-MM-DD');

        if (!acc[key]) {
            acc[key] = [];
        }

        acc[key].push(timelineItems[index]);
        return acc;
    }, {});

    const groupedKeys = Object.keys(groupedTimeline).sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf());

    // Pagination helpers
    const lastPage = history.meta?.last_page ?? history.last_page ?? 1;
    const currentPage = history.meta?.current_page ?? history.current_page;
    const totalRecords = history.meta?.total ?? history.total;

    return (
        <AuthenticatedLayout header={<AdminPageHeader title={ROLE_HEADING[role] ?? 'History'} />}>
            <Head title="History" />

            <div className="space-y-4">
                <Row gutter={[12, 12]}>
                    {statItems.map((item) => (
                        <Col key={item.key} xs={12} sm={8} lg={4}>
                            <Card className="admin-dashboard-shell" bordered={false} bodyStyle={{ padding: 14 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: textMuted, textTransform: 'uppercase' }}>
                                    {item.label}
                                </div>
                                <div style={{ marginTop: 4, fontSize: 24, fontWeight: 700, color: item.color }}>
                                    {item.value}
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Filters */}
                <Card className="admin-dashboard-shell" bordered={false}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                        <Input
                            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                            placeholder="Search by paper title…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onPressEnter={() => applyFilters({ search })}
                            allowClear
                            onClear={() => {
                                setSearch('');
                                applyFilters({ search: '' });
                            }}
                            style={{ width: 260 }}
                        />
                        <Select
                            placeholder="Filter by action"
                            value={action || undefined}
                            onChange={(val) => {
                                setAction(val ?? '');
                                applyFilters({ action: val ?? '', page: 1 });
                            }}
                            allowClear
                            style={{ width: 170 }}
                            options={[
                                { value: 'created',  label: 'Submitted'  },
                                { value: 'updated',  label: 'Updated'    },
                                { value: 'approved', label: 'Approved'   },
                                { value: 'rejected', label: 'Rejected'   },
                                { value: 'deleted',  label: 'Deleted'    },
                            ]}
                        />
                        <Select
                            placeholder="Date range"
                            value={range || undefined}
                            onChange={(val) => {
                                const nextRange = val ?? '';
                                setRange(nextRange);
                                if (nextRange !== 'custom') {
                                    setCustomRange(null);
                                    applyFilters({ range: nextRange, from: undefined, to: undefined, page: 1 });
                                }
                            }}
                            allowClear
                            style={{ width: 160 }}
                            options={[
                                { value: 'today', label: 'Today' },
                                { value: '7d', label: 'Last 7 days' },
                                { value: '30d', label: 'Last 30 days' },
                                { value: 'custom', label: 'Custom range' },
                            ]}
                        />
                        {range === 'custom' && (
                            <DatePicker.RangePicker
                                value={customRange}
                                onChange={(values) => setCustomRange(values)}
                                allowClear
                            />
                        )}
                        <Button type="primary" onClick={() => applyFilters({ search, action, page: 1 })}>
                            Apply Filters
                        </Button>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Button onClick={resetFilters}>Reset</Button>
                            <Typography.Text type="secondary" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
                                Showing {totalRecords} {totalRecords === 1 ? 'entry' : 'entries'}
                            </Typography.Text>
                        </div>
                    </div>

                    {/* Export CSV — super_admin only */}
                    {role === 'super_admin' && (
                        <div style={{
                            marginTop: 14,
                            paddingTop: 14,
                            borderTop: `1px solid ${borderColor}`,
                        }}>
                            <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Typography.Text strong style={{ fontSize: 12, color: textTertiary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    Export columns
                                </Typography.Text>
                                <Button size="small" type="link" style={{ padding: 0, height: 'auto', fontSize: 12 }} onClick={() => setExportColumns(DEFAULT_EXPORT_COLUMNS)}>
                                    Select all
                                </Button>
                                <Button size="small" type="link" style={{ padding: 0, height: 'auto', fontSize: 12 }} onClick={() => setExportColumns([])}>
                                    Clear all
                                </Button>
                                <Checkbox
                                    checked={allColumnsSelected}
                                    indeterminate={someColumnsSelected}
                                    onChange={(e) => setExportColumns(e.target.checked ? DEFAULT_EXPORT_COLUMNS : [])}
                                    style={{ marginLeft: 4 }}
                                >
                                    <span style={{ fontSize: 12 }}>All</span>
                                </Checkbox>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
                                <Checkbox.Group
                                    options={EXPORT_COLUMN_OPTIONS}
                                    value={exportColumns}
                                    onChange={(values) => setExportColumns(values)}
                                />
                                <Button icon={<DownloadOutlined />} type="primary" ghost onClick={exportCsv} style={{ flexShrink: 0 }}>
                                    Export CSV
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Timeline */}
                <Card className="admin-dashboard-shell" bordered={false}>
                    {history.data.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                            <HistoryOutlined style={{ fontSize: 40, marginBottom: 12 }} />
                            <div>No history entries found.</div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {groupedKeys.map((groupKey) => (
                                    <div key={groupKey}>
                                        <div style={{ marginBottom: 10 }}>
                                            <Tag style={{
                                                borderRadius: 999,
                                                paddingInline: 10,
                                                border: `1px solid ${borderColor}`,
                                                color: textSecondary,
                                                background: bgMuted,
                                                fontWeight: 600,
                                            }}>
                                                {getDayLabel(groupKey)}
                                            </Tag>
                                        </div>
                                        <Timeline mode="left" items={groupedTimeline[groupKey]} />
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {lastPage > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                                    <Pagination
                                        current={currentPage}
                                        total={totalRecords}
                                        pageSize={history.meta?.per_page ?? history.per_page ?? 20}
                                        showSizeChanger={false}
                                        onChange={(page) => applyFilters({ page })}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}

