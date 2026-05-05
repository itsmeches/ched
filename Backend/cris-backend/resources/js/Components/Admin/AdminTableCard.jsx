import { Card, Space, Typography } from 'antd';

export default function AdminTableCard({ title = null, summary = null, children }) {
    return (
        <Card className="admin-dashboard-shell" bordered={false}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                {(title || summary) && (
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                        {title ? (
                            <Typography.Title level={5} style={{ margin: 0, fontSize: 18 }}>
                                {title}
                            </Typography.Title>
                        ) : (
                            <span />
                        )}
                        {summary ? (
                            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                                {summary}
                            </Typography.Text>
                        ) : null}
                    </div>
                )}
                {children}
            </Space>
        </Card>
    );
}