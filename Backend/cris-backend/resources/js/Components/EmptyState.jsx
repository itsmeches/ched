import { Empty, Typography } from 'antd';

export default function EmptyState({ title = 'No records found', description = 'Try adjusting your filters or create a new record.' }) {
    return (
        <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={(
                <div>
                    <Typography.Text strong style={{ display: 'block' }}>
                        {title}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                        {description}
                    </Typography.Text>
                </div>
            )}
        />
    );
}
