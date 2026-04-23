import { Card, Col, Row, Space, Typography } from 'antd';

export default function AdminFilterCard({ title, description, controls }) {
    return (
        <Card className="admin-dashboard-shell" bordered={false}>
            <Row justify="space-between" align="middle" gutter={[16, 16]}>
                <Col xs={24} xl={12}>
                    <Space direction="vertical" size={4}>
                        <Typography.Title level={4} style={{ margin: 0 }}>
                            {title}
                        </Typography.Title>
                        <Typography.Text type="secondary">
                            {description}
                        </Typography.Text>
                    </Space>
                </Col>
                <Col xs={24} xl={12}>
                    {controls}
                </Col>
            </Row>
        </Card>
    );
}
