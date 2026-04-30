import { Space, Typography } from 'antd';

export default function AdminPageHeader({ title, subtitle, actions = null }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <Space direction="vertical" size={0}>
                <Typography.Title level={4} style={{ margin: 0 }}>
                    {title}
                </Typography.Title>
                {subtitle && (
                    <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                        {subtitle}
                    </Typography.Text>
                )}
            </Space>
            {actions}
        </div>
    );
}
