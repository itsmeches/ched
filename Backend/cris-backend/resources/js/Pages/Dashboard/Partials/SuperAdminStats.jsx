import { Card, Col, Row, Statistic } from 'antd';
import { router } from '@inertiajs/react';
import { BankOutlined, CrownOutlined, FileTextOutlined, SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons';

const statCards = [
    { key: 'users', label: 'Total Users', icon: <TeamOutlined />, routeName: 'admin.users.index', color: '#7c3aed' },
    { key: 'heiUsers', label: 'HEI Accounts', icon: <BankOutlined />, routeName: 'admin.users.index', params: { role: 'hei' }, color: '#15803d' },
    { key: 'chedUsers', label: 'CHED Accounts', icon: <SafetyCertificateOutlined />, routeName: 'admin.users.index', params: { role: 'ched' }, color: '#2563eb' },
    { key: 'admins', label: 'Super Admins', icon: <CrownOutlined />, routeName: 'admin.users.index', params: { role: 'super_admin' }, color: '#9333ea' },
    { key: 'institutions', label: 'Institutions', icon: <BankOutlined />, routeName: 'admin.institutions.index', color: '#d97706' },
    { key: 'proposals', label: 'Research Records', icon: <FileTextOutlined />, routeName: 'research.index', color: '#0f766e' },
];

export default function SuperAdminStats({ stats }) {
    return (
        <Row gutter={[16, 16]}>
            {statCards.map((item) => (
                <Col xs={24} sm={12} xl={8} key={item.key}>
                    <Card hoverable className="admin-dashboard-shell" onClick={() => router.visit(route(item.routeName, item.params ?? {}))}>
                        <Statistic title={item.label} value={stats[item.key]} prefix={<span style={{ color: item.color }}>{item.icon}</span>} valueStyle={{ color: '#0f172a' }} />
                    </Card>
                </Col>
            ))}
        </Row>
    );
}