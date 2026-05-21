import { useMemo, useState } from 'react';
import { Button, Card, Space, Tag, Timeline, Typography } from 'antd';
import { formatDateTime } from '@/utils/date';

const ACTION_META = {
    submitted: { label: 'Submitted', color: 'blue' },
    approved: { label: 'Approved', color: 'green' },
    rejected: { label: 'Rejected', color: 'red' },
    edited: { label: 'Edited', color: 'gold' },
};

const ROLE_COLOR = {
    student: 'geekblue',
    faculty: 'cyan',
    hei: 'blue',
    ched: 'volcano',
    super_admin: 'purple',
    system: 'default',
};

function toDateKey(value) {
    if (!value) return '';
    const str = String(value);
    return str.length >= 10 ? str.slice(0, 10) : str;
}

function groupHistory(history) {
    return (history || []).reduce((acc, item) => {
        const previous = acc[acc.length - 1];
        const sameDate = previous && previous.date_key === toDateKey(item.created_at);
        const sameAction = previous && previous.action === item.action;

        if (sameDate && sameAction) {
            previous.count += 1;
            previous.latest_created_at = item.created_at;
            previous.remarks = previous.remarks || item.remarks;
            return acc;
        }

        acc.push({
            ...item,
            count: 1,
            date_key: toDateKey(item.created_at),
            latest_created_at: item.created_at,
        });

        return acc;
    }, []);
}

export default function ResearchTimeline({ researchHistory = [] }) {
    const [showRaw, setShowRaw] = useState(false);
    const grouped = useMemo(() => groupHistory(researchHistory), [researchHistory]);
    const items = showRaw ? researchHistory : grouped;

    return (
        <Card
            id="research-timeline"
            className="admin-dashboard-shell"
            bordered={false}
            title={
                <Typography.Title level={5} style={{ margin: 0 }}>
                    Research Timeline
                </Typography.Title>
            }
            extra={
                <Button size="small" onClick={() => setShowRaw((prev) => !prev)}>
                    {showRaw ? 'Show Grouped' : 'Show Raw'}
                </Button>
            }
        >
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 14 }}>
                History for this paper only.
            </Typography.Text>

            {items.length === 0 ? (
                <Typography.Text type="secondary">No timeline entries yet.</Typography.Text>
            ) : (
                <Timeline
                    items={items.map((item) => ({
                        color: ACTION_META[item.action]?.color ?? 'blue',
                        children: (
                            <Space direction="vertical" size={4}>
                                <Space size={[6, 6]} wrap>
                                    <Tag
                                        color={ACTION_META[item.action]?.color ?? 'blue'}
                                        style={{ marginInlineEnd: 0 }}
                                    >
                                        {ACTION_META[item.action]?.label ??
                                            String(item.action || '')
                                                .replace('_', ' ')
                                                .toUpperCase()}
                                    </Tag>
                                    <Tag
                                        color={ROLE_COLOR[item.role] ?? 'default'}
                                        style={{ marginInlineEnd: 0 }}
                                    >
                                        {String(item.role || 'unknown').toUpperCase()}
                                    </Tag>
                                    {!showRaw && item.count > 1 ? (
                                        <Tag style={{ marginInlineEnd: 0 }}>x{item.count}</Tag>
                                    ) : null}
                                </Space>
                                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                    By {item.actor_name || 'Unknown'} on{' '}
                                    {formatDateTime(
                                        showRaw ? item.created_at : item.latest_created_at
                                    ) || '—'}
                                </Typography.Text>
                                {item.remarks ? (
                                    <Typography.Text style={{ whiteSpace: 'pre-line' }}>
                                        {item.remarks}
                                    </Typography.Text>
                                ) : null}
                            </Space>
                        ),
                    }))}
                />
            )}
        </Card>
    );
}
