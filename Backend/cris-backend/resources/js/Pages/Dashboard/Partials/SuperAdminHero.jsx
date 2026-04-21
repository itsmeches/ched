import { Card, Col, Row, Space, Statistic, Tag, Typography } from 'antd';

export default function SuperAdminHero({ stats }) {
    return (
        <Card bordered={false} className="admin-dashboard-hero" bodyStyle={{ padding: 32 }}>
            <Row gutter={[24, 24]} align="middle">
                <Col xs={24} lg={15}>
                    <Space direction="vertical" size={8}>
                        <Tag color="gold" style={{ alignSelf: 'flex-start', borderRadius: 999, paddingInline: 12, paddingBlock: 4 }}>
                            CALABARZON Research Information System
                        </Tag>
                        <Typography.Title level={2} style={{ margin: 0, color: '#ffffff' }}>
                            Super Admin Control Center
                        </Typography.Title>
                        <Typography.Paragraph style={{ margin: 0, color: 'rgba(255,255,255,0.82)', fontSize: 16 }}>
                            Create institutional accounts, track platform growth, and move between user and research administration from one place.
                        </Typography.Paragraph>
                    </Space>
                </Col>
                <Col xs={24} lg={9}>
                    <Row gutter={[12, 12]}>
                        <Col span={12}>
                            <Card bordered={false} style={{ background: 'rgba(255,255,255,0.14)' }}>
                                <Statistic title={<span style={{ color: 'rgba(255,255,255,0.72)' }}>Pending Review</span>} value={stats.pending} valueStyle={{ color: '#fff' }} />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card bordered={false} style={{ background: 'rgba(255,255,255,0.14)' }}>
                                <Statistic title={<span style={{ color: 'rgba(255,255,255,0.72)' }}>Approved</span>} value={stats.approved} valueStyle={{ color: '#fff' }} />
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Card>
    );
}