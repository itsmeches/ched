import { Empty, Typography } from 'antd';

/**
 * Consistent empty state. Backwards compatible: title/description still
 * default to the previous Ant Design Empty fallback. Adds optional icon
 * and action slots for richer empty states (used by tables and lists).
 */
export default function EmptyState({
    title = 'No records found',
    description = 'Try adjusting your filters or create a new record.',
    icon = null,
    action = null,
}) {
    return (
        <Empty
            image={icon ?? Empty.PRESENTED_IMAGE_SIMPLE}
            description={
                <div className="space-y-1">
                    <Typography.Text strong style={{ display: 'block' }}>
                        {title}
                    </Typography.Text>
                    <Typography.Text type="secondary">{description}</Typography.Text>
                </div>
            }
        >
            {action}
        </Empty>
    );
}
