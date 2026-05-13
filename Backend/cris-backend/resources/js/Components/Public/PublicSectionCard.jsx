import { Card, Typography } from 'antd';

export default function PublicSectionCard({ title, subtitle, extra = null, children, className = '', bodyStyle = {} }) {
    return (
        <Card
            className={`admin-dashboard-shell ${className}`.trim()}
            bordered={false}
            style={{ borderRadius: 14 }}
            title={title}
            extra={extra}
            styles={{ body: { padding: 18, ...bodyStyle } }}
        >
            {subtitle && (
                <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 14, fontSize: 12 }}>
                    {subtitle}
                </Typography.Text>
            )}
            {children}
        </Card>
    );
}