import { Card, Col, Row, Space, Typography } from 'antd';

export default function AdminFilterCard({ title, description, controls }) {
    return (
        <Card className="admin-dashboard-shell" bordered={false}>
            <Row justify="space-between" align="top" gutter={[12, 12]}>
                <Col xs={24} xl={12}>
                    <Space direction="vertical" size={4}>
                        <Typography.Title level={5} style={{ margin: 0 }}>
                            {title}
                        </Typography.Title>
                        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
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
