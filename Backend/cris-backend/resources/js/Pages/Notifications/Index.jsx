import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import EmptyState from '@/Components/EmptyState';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Alert,
    Badge,
    Button,
    Card,
    Pagination,
    Segmented,
    Select,
    Space,
    Tag,
    Typography,
} from 'antd';
import {
    BellOutlined,
    CheckCircleOutlined,
    DeleteOutlined,
    InboxOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { formatDate } from '@/utils/date';
import { useTheme } from '@/utils/ThemeContext';

const { Text, Title } = Typography;

export default function NotificationsIndex({ notifications, filters, typeOptions, unreadCount }) {
    const { props } = usePage();
    const flash = props.flash || {};
    const { dark } = useTheme();

    const items = notifications?.data ?? [];

    const setFilter = (filter) => {
        router.get(
            route('notifications.index'),
            { ...filters, filter },
            { preserveState: true, replace: true }
        );
    };

    const setType = (type) => {
        router.get(
            route('notifications.index'),
            { ...filters, type: type || '' },
            { preserveState: true, replace: true }
        );
    };

    const goPage = (page) => {
        router.get(
            route('notifications.index'),
            { ...filters, page },
            { preserveState: true, replace: true }
        );
    };

    const markRead = (id) => {
        router.post(route('notifications.read-one', id), {}, { preserveScroll: true });
    };
    const markUnread = (id) => {
        router.post(route('notifications.unread', id), {}, { preserveScroll: true });
    };
    const remove = (id) => {
        router.delete(route('notifications.destroy', id), { preserveScroll: true });
    };
    const markAll = () => {
        router.post(route('notifications.read-all'), {}, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <AdminPageHeader
                    title="Notifications"
                    subtitle="Your activity feed across submissions, reviews, and account updates."
                    actions={
                        <Space>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={() =>
                                    router.reload({ only: ['notifications', 'unreadCount'] })
                                }
                            >
                                Refresh
                            </Button>
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                disabled={unreadCount === 0}
                                onClick={markAll}
                            >
                                Mark all read
                            </Button>
                        </Space>
                    }
                />
            }
        >
            <Head title="Notifications" />

            <div className="space-y-4">
                {flash?.success && <Alert type="success" showIcon message={flash.success} />}

                <Card variant="outlined" className="cris-form-section">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Segmented
                            value={filters.filter || 'all'}
                            onChange={setFilter}
                            options={[
                                { label: 'All', value: 'all' },
                                {
                                    label: (
                                        <span>
                                            Unread{' '}
                                            <Badge
                                                count={unreadCount}
                                                size="small"
                                                offset={[6, -2]}
                                            />
                                        </span>
                                    ),
                                    value: 'unread',
                                },
                                { label: 'Read', value: 'read' },
                            ]}
                        />

                        {typeOptions?.length > 0 && (
                            <Select
                                allowClear
                                placeholder="Filter by type"
                                style={{ minWidth: 220 }}
                                value={filters.type || undefined}
                                onChange={(v) => setType(v ?? '')}
                                options={typeOptions.map((opt) => ({
                                    value: opt.value,
                                    label: opt.label,
                                }))}
                            />
                        )}
                    </div>
                </Card>

                <Card variant="outlined">
                    {items.length === 0 ? (
                        <EmptyState
                            icon={<InboxOutlined />}
                            title="No notifications"
                            description="You're all caught up. New activity will appear here."
                        />
                    ) : (
                        <ul
                            className="divide-y divide-gray-200 dark:divide-gray-700"
                            aria-label="Notifications"
                        >
                            {items.map((n) => (
                                <li key={n.id} className="py-3 flex items-start gap-3">
                                    <BellOutlined
                                        className={n.is_read ? 'text-gray-400' : 'text-blue-600'}
                                        aria-hidden
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            {!n.is_read && <Tag color="blue">New</Tag>}
                                            {n.type && (
                                                <Tag>{String(n.type).replace(/_/g, ' ')}</Tag>
                                            )}
                                            <Text type="secondary" className="text-xs">
                                                {formatDate(n.created_at, 'MMM D, YYYY h:mm A')}
                                            </Text>
                                        </div>
                                        <Text className="block whitespace-pre-line">
                                            {n.link_url ? (
                                                <Link
                                                    href={n.link_url}
                                                    onClick={() => !n.is_read && markRead(n.id)}
                                                    className={n.is_read ? '' : 'font-semibold'}
                                                >
                                                    {n.message}
                                                </Link>
                                            ) : (
                                                <span className={n.is_read ? '' : 'font-semibold'}>
                                                    {n.message}
                                                </span>
                                            )}
                                        </Text>
                                    </div>
                                    <Space size="small">
                                        {n.is_read ? (
                                            <Button
                                                size="small"
                                                onClick={() => markUnread(n.id)}
                                                aria-label="Mark as unread"
                                            >
                                                Unread
                                            </Button>
                                        ) : (
                                            <Button
                                                size="small"
                                                onClick={() => markRead(n.id)}
                                                aria-label="Mark as read"
                                            >
                                                Read
                                            </Button>
                                        )}
                                        <Button
                                            size="small"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => remove(n.id)}
                                            aria-label="Remove notification"
                                        />
                                    </Space>
                                </li>
                            ))}
                        </ul>
                    )}

                    {notifications.last_page > 1 && (
                        <div className="mt-4 flex justify-end">
                            <Pagination
                                current={notifications.current_page}
                                total={notifications.total}
                                pageSize={notifications.per_page}
                                showSizeChanger={false}
                                onChange={goPage}
                            />
                        </div>
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
