import { Card, Col, Row, Statistic } from 'antd';
import { router } from '@inertiajs/react';
import { BankOutlined, CrownOutlined, FileTextOutlined, SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons';

const statCards = [
    { key: 'users', label: 'Total Users', icon: <TeamOutlined />, routeName: 'admin.users.index', color: '#0033a0' },
    { key: 'heiUsers', label: 'HEI Accounts', icon: <BankOutlined />, routeName: 'admin.users.index', params: { role: 'hei' }, color: '#0047d4' },
    { key: 'chedUsers', label: 'CHED Accounts', icon: <SafetyCertificateOutlined />, routeName: 'admin.users.index', params: { role: 'ched' }, color: '#0033a0' },
    { key: 'admins', label: 'Super Admins', icon: <CrownOutlined />, routeName: 'admin.users.index', params: { role: 'super_admin' }, color: '#001f66' },
    { key: 'institutions', label: 'Institutions', icon: <BankOutlined />, routeName: 'admin.institutions.index', color: '#d97706' },
    { key: 'proposals', label: 'Research Records', icon: <FileTextOutlined />, routeName: 'research.index', color: '#0033a0' },
    { key: 'rejected', label: 'Rejected Papers', icon: <FileTextOutlined />, routeName: 'research.index', params: { status: 'rejected' }, color: '#dc2626' },
];

export default function SuperAdminStats({ stats }) {
    const openRoute = (item) => {
        router.visit(route(item.routeName, item.params ?? {}));
    };

    const onCardKeyDown = (event, item) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openRoute(item);
        }
    };

    return (
        <Row gutter={[16, 16]}>
            {statCards.map((item) => (
                <Col xs={24} sm={12} xl={8} key={item.key}>
                    <Card
                        hoverable
                        className="admin-dashboard-shell"
                        role="button"
                        tabIndex={0}
                        aria-label={`Open ${item.label}`}
                        onClick={() => openRoute(item)}
                        onKeyDown={(event) => onCardKeyDown(event, item)}
                    >
                        <Statistic title={item.label} value={stats[item.key]} prefix={<span style={{ color: item.color }}>{item.icon}</span>} valueStyle={{ color: '#0f172a' }} />
                    </Card>
                </Col>
            ))}
        </Row>
    );
}