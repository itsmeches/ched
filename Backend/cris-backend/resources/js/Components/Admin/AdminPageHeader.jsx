import { Space, Typography } from 'antd';

export default function AdminPageHeader({ title, subtitle, actions = null }) {
    return (
        <div className="admin-page-header flex w-full min-w-0 flex-wrap items-start justify-between gap-3 sm:items-center sm:gap-4">
            <Space direction="vertical" size={0} className="min-w-0">
                <Typography.Title level={4} style={{ margin: 0 }}>
                    {title}
                </Typography.Title>
                {subtitle && (
                    <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                        {subtitle}
                    </Typography.Text>
                )}
            </Space>
            {actions ? <div className="admin-page-header-actions w-full sm:w-auto">{actions}</div> : null}
        </div>
    );
}
