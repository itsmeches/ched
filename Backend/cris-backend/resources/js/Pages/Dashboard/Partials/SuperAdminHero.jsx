import { Card, Col, Progress, Row, Space, Statistic, Tag, Typography } from 'antd';
import { useTheme } from '@/utils/ThemeContext';

export default function SuperAdminHero({ stats }) {
    const { dark } = useTheme();
    const accentPrimary = dark ? '#93c5fd' : '#0033a0';
    return (
        <Card bordered={false} className="admin-dashboard-hero" styles={{ body: { padding: 32 } }}>
            <Row gutter={[24, 24]} align="middle">
                <Col xs={24} lg={15}>
                    <Space direction="vertical" size={8}>
                        <Tag
                            color="gold"
                            style={{
                                alignSelf: 'flex-start',
                                borderRadius: 999,
                                paddingInline: 12,
                                paddingBlock: 4,
                            }}
                        >
                            CALABARZON Research Information System
                        </Tag>
                        <Typography.Title level={2} style={{ margin: 0, color: '#ffffff' }}>
                            Super Admin Control Center
                        </Typography.Title>
                        <Typography.Paragraph
                            style={{ margin: 0, color: 'rgba(255,255,255,0.82)', fontSize: 16 }}
                        >
                            Create institutional accounts, track platform growth, and move between
                            user and research administration from one place.
                        </Typography.Paragraph>
                    </Space>
                </Col>
                <Col xs={24} lg={9}>
                    <Row gutter={[12, 12]}>
                        <Col span={12}>
                            <Card bordered={false} style={{ background: 'rgba(255,255,255,0.14)' }}>
                                <Statistic
                                    title={
                                        <span style={{ color: 'rgba(255,255,255,0.72)' }}>
                                            Pending Review
                                        </span>
                                    }
                                    value={stats.pending}
                                    valueStyle={{ color: '#fff' }}
                                />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card bordered={false} style={{ background: 'rgba(255,255,255,0.14)' }}>
                                <Statistic
                                    title={
                                        <span style={{ color: 'rgba(255,255,255,0.72)' }}>
                                            Approved
                                        </span>
                                    }
                                    value={stats.approved}
                                    valueStyle={{ color: '#fff' }}
                                />
                            </Card>
                        </Col>
                        <Col span={24}>
                            <Card bordered={false} style={{ background: 'rgba(255,255,255,0.14)' }}>
                                <Space direction="vertical" size={6} style={{ width: '100%' }}>
                                    <Statistic
                                        title={
                                            <span style={{ color: 'rgba(255,255,255,0.72)' }}>
                                                Approval Rate
                                            </span>
                                        }
                                        value={stats.approvalRate}
                                        suffix="%"
                                        precision={1}
                                        valueStyle={{ color: '#fff' }}
                                    />
                                    <Progress
                                        percent={Number(stats.approvalRate)}
                                        showInfo={false}
                                        strokeColor={accentPrimary}
                                        trailColor="rgba(255,255,255,0.25)"
                                    />
                                </Space>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Card>
    );
}
