import { Card, Col, Row, Statistic, Tag } from 'antd';
import { router } from '@inertiajs/react';
import {
    BankOutlined,
    CrownOutlined,
    FileTextOutlined,
    SafetyCertificateOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useTheme } from '@/utils/ThemeContext';

export default function SuperAdminStats({ stats, filters = {} }) {
    const { dark } = useTheme();
    const accentPrimary = dark ? '#93c5fd' : '#0033a0';
    const accentSecondary = dark ? '#60a5fa' : '#0047d4';
    const accentDark = dark ? '#3b82f6' : '#001f66';
    const metricTextColor = dark ? '#e2e8f0' : '#0f172a';

    // Which filters are currently active
    const hasInstitution = filters.hei_id && filters.hei_id !== '';
    const hasYear = filters.year && filters.year !== '';
    const hasDiscipline = filters.discipline_code && filters.discipline_code !== '';
    const hasStatus = filters.status && filters.status !== '';

    // User-count cards respond to institution filter
    // Proposal-count cards respond to all filters
    const userFiltered = !!hasInstitution;
    const proposalFiltered = !!(hasInstitution || hasYear || hasDiscipline || hasStatus);

    const statCards = [
        {
            key: 'proposals',
            label: 'Research Records',
            icon: <FileTextOutlined />,
            routeName: 'research.index',
            color: accentPrimary,
            filtered: proposalFiltered,
        },
        {
            key: 'rejected',
            label: 'Rejected Papers',
            icon: <FileTextOutlined />,
            routeName: 'research.index',
            params: { status: 'rejected' },
            color: '#dc2626',
            filtered: proposalFiltered,
        },
        {
            key: 'institutions',
            label: 'Institution',
            icon: <BankOutlined />,
            routeName: 'admin.institutions.index',
            color: '#d97706',
            filtered: false,
        },
        {
            key: 'users',
            label: 'Total Users',
            icon: <TeamOutlined />,
            routeName: 'admin.users.index',
            color: accentPrimary,
            filtered: userFiltered,
        },
        {
            key: 'heiUsers',
            label: 'Hei Accounts',
            icon: <BankOutlined />,
            routeName: 'admin.users.index',
            params: { role: 'hei' },
            color: accentSecondary,
            filtered: userFiltered,
        },
        {
            key: 'facultyUsers',
            label: 'Faculty Accounts',
            icon: <UserOutlined />,
            routeName: 'admin.users.index',
            params: { role: 'faculty' },
            color: accentDark,
            filtered: userFiltered,
        },
        {
            key: 'studentUsers',
            label: 'Student Accounts',
            icon: <UserOutlined />,
            routeName: 'admin.users.index',
            params: { role: 'student' },
            color: accentSecondary,
            filtered: userFiltered,
        },
        {
            key: 'chedUsers',
            label: 'Ched Accounts',
            icon: <SafetyCertificateOutlined />,
            routeName: 'admin.users.index',
            params: { role: 'ched' },
            color: accentPrimary,
            filtered: userFiltered,
        },
        {
            key: 'admins',
            label: 'Super Admins',
            icon: <CrownOutlined />,
            routeName: 'admin.users.index',
            params: { role: 'super_admin' },
            color: accentDark,
            filtered: userFiltered,
        },
    ];
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
            {statCards.map((item, index) => (
                <Col xs={24} sm={12} xl={8} key={item.key}>
                    <Card
                        hoverable
                        className="admin-dashboard-shell kpi-stat-card dashboard-reveal"
                        style={{ animationDelay: `${index * 55}ms` }}
                        role="button"
                        tabIndex={0}
                        aria-label={`Open ${item.label}`}
                        onClick={() => openRoute(item)}
                        onKeyDown={(event) => onCardKeyDown(event, item)}
                    >
                        <Statistic
                            title={
                                <span className="flex items-center gap-2">
                                    {item.label}
                                    {item.filtered && (
                                        <Tag
                                            color="blue"
                                            style={{
                                                fontSize: 10,
                                                lineHeight: '16px',
                                                padding: '0 4px',
                                            }}
                                        >
                                            Filtered
                                        </Tag>
                                    )}
                                </span>
                            }
                            value={stats[item.key]}
                            prefix={<span style={{ color: item.color }}>{item.icon}</span>}
                            valueStyle={{ color: metricTextColor }}
                        />
                    </Card>
                </Col>
            ))}
        </Row>
    );
}
