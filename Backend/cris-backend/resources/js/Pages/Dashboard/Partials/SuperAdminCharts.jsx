import { Card, Col, Empty, Grid, Row, Typography } from 'antd';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { router } from '@inertiajs/react';
import { useTheme } from '@/utils/ThemeContext';

export default function SuperAdminCharts({
    stats = {},
    monthlyTrends = [],
    roleDistribution = [],
    disciplineBreakdown = [],
    institutionPerformance = [],
}) {
    const { dark } = useTheme();
    const { useBreakpoint } = Grid;
    const screens = useBreakpoint();
    const disciplineTickLimit = screens.xxl ? 40 : screens.xl ? 34 : screens.lg ? 28 : screens.md ? 22 : 16;
    const axisColor = dark ? '#94a3b8' : '#64748b';
    const gridColor = dark ? '#334155' : '#e2e8f0';
    const tooltipBgColor = dark ? '#0f172a' : '#f8fafc';
    const tooltipBorderColor = dark ? '#334155' : '#e2e8f0';

    const formatDisciplineTick = (value) => {
        if (!value) {
            return '';
        }

        return value.length > disciplineTickLimit ? `${value.slice(0, disciplineTickLimit)}...` : value;
    };

    const statusBreakdownData = [
        { name: 'Approved', value: stats.approved || 0, fill: '#16a34a' },
        { name: 'Pending', value: stats.pending || 0, fill: '#d97706' },
        { name: 'Rejected', value: stats.rejected || 0, fill: '#dc2626' },
    ];

    const noData = (
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<Typography.Text type="secondary">No data available</Typography.Text>}
            />
        </div>
    );

    function openResearch(params = {}) {
        router.visit(route('research.index', params));
    }

    function onStatusClick(entry) {
        const statusMap = {
            Approved: 'approved',
            Pending: 'pending',
            Rejected: 'rejected',
        };

        const status = statusMap[entry?.name || ''];
        if (status) {
            openResearch({ status });
        }
    }

    function onMonthClick(point) {
        const monthLabel = point?.payload?.month;
        if (!monthLabel) {
            return;
        }

        const match = String(monthLabel).match(/\b(\d{4})\b/);
        openResearch(match ? { year: match[1] } : {});
    }

    return (
        <div className="space-y-4 dashboard-charts-grid">
            {/* Charts Row */}
            <Row gutter={[16, 16]}>
                <Col xs={24} xl={16}>
                    <Card title="Submission Trend" extra={<Typography.Text type="secondary">Last 12 months</Typography.Text>} className="admin-dashboard-shell dashboard-reveal" bordered={false} style={{ animationDelay: '100ms' }}>
                        {monthlyTrends.length > 0 ? (
                        <ResponsiveContainer width="100%" height={320}>
                            <AreaChart data={monthlyTrends}>
                                <defs>
                                    <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0033a0" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#0033a0" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis dataKey="month" stroke={axisColor} />
                                <YAxis stroke={axisColor} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: tooltipBgColor, border: `1px solid ${tooltipBorderColor}`, borderRadius: 6 }}
                                    cursor={{ fill: 'rgba(0, 51, 160, 0.1)' }}
                                />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="submissions"
                                    stroke="#0033a0"
                                    fillOpacity={1}
                                    fill="url(#colorSubmissions)"
                                    name="Total Submissions"
                                    onClick={onMonthClick}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="approved"
                                    stroke="#16a34a"
                                    fillOpacity={1}
                                    fill="url(#colorApproved)"
                                    name="Approved"
                                    onClick={onMonthClick}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                        ) : noData}
                    </Card>
                </Col>

                <Col xs={24} xl={8}>
                    <Card title="Proposal Status Breakdown" extra={<Typography.Text type="secondary">Click to filter</Typography.Text>} className="admin-dashboard-shell dashboard-reveal" bordered={false} style={{ animationDelay: '145ms' }}>
                        {statusBreakdownData.some((item) => item.value > 0) ? (
                        <ResponsiveContainer width="100%" height={320}>
                            <PieChart>
                                <Pie
                                    data={statusBreakdownData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={(props) => props.value > 0}
                                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : null}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    onClick={onStatusClick}
                                    minAngle={0}
                                >
                                    {statusBreakdownData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => [value, name]} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                        ) : noData}
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} xl={12}>
                    <Card title="Institution Performance" extra={<Typography.Text type="secondary">Submissions vs approvals</Typography.Text>} className="admin-dashboard-shell dashboard-reveal" bordered={false} style={{ animationDelay: '190ms' }}>
                        {institutionPerformance.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={institutionPerformance}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis dataKey="institution" stroke={axisColor} />
                                <YAxis stroke={axisColor} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: tooltipBgColor, border: `1px solid ${tooltipBorderColor}`, borderRadius: 6 }}
                                    cursor={{ fill: 'rgba(0, 51, 160, 0.1)' }}
                                />
                                <Legend />
                                <Bar
                                    dataKey="submissions"
                                    fill="#0033a0"
                                    name="Submissions"
                                    radius={[8, 8, 0, 0]}
                                    onClick={(event) => {
                                        const heiId = event?.payload?.institution_id;
                                        if (heiId) {
                                            openResearch({ hei_id: heiId });
                                        }
                                    }}
                                />
                                <Bar dataKey="approved" fill="#16a34a" name="Approved" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        ) : noData}
                    </Card>
                </Col>

                <Col xs={24} xl={12}>
                    <Card title="User Role Distribution" extra={<Typography.Text type="secondary">Click bar to open users</Typography.Text>} className="admin-dashboard-shell dashboard-reveal" bordered={false} style={{ animationDelay: '235ms' }}>
                        {roleDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={roleDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis dataKey="role" stroke={axisColor} angle={-20} textAnchor="end" height={70} interval={0} />
                                <YAxis stroke={axisColor} allowDecimals={false} />
                                <Tooltip contentStyle={{ backgroundColor: tooltipBgColor, border: `1px solid ${tooltipBorderColor}`, borderRadius: 6 }} />
                                <Bar
                                    dataKey="count"
                                    fill="#0033a0"
                                    name="Users"
                                    radius={[8, 8, 0, 0]}
                                    style={{ cursor: 'pointer' }}
                                    onClick={(event) => {
                                        const labelToRole = {
                                            'FACULTY': 'faculty',
                                            'STUDENT': 'student',
                                            'HEI': 'hei',
                                            'SUPER ADMIN': 'super_admin',
                                            'CHED': 'ched',
                                            'PENDING': 'pending',
                                        };
                                        const label = event?.payload?.role;
                                        const roleSlug = label ? (labelToRole[label.toUpperCase()] ?? label.toLowerCase().replace(/\s+/g, '_')) : null;
                                        if (roleSlug) {
                                            router.visit(route('admin.users.index', { role: roleSlug }));
                                        }
                                    }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                        ) : noData}
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <Card title="Top Disciplines by Submission" extra={<Typography.Text type="secondary">Click a bar to filter</Typography.Text>} className="admin-dashboard-shell dashboard-reveal" bordered={false} style={{ animationDelay: '280ms' }}>
                        {disciplineBreakdown.length > 0 ? (
                        <ResponsiveContainer width="100%" height={340}>
                            <BarChart data={disciplineBreakdown} margin={{ top: 8, right: 16, left: 0, bottom: 70 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis
                                    dataKey="discipline"
                                    stroke={axisColor}
                                    angle={-35}
                                    textAnchor="end"
                                    height={92}
                                    interval={0}
                                    tickFormatter={formatDisciplineTick}
                                />
                                <YAxis stroke={axisColor} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: tooltipBgColor, border: `1px solid ${tooltipBorderColor}`, borderRadius: 6 }}
                                    labelFormatter={(label) => label}
                                />
                                <Bar
                                    dataKey="submissions"
                                    fill="#d97706"
                                    name="Submissions"
                                    radius={[8, 8, 0, 0]}
                                    onClick={(event) => {
                                        const disciplineCode = event?.payload?.discipline_code;
                                        if (disciplineCode) {
                                            openResearch({ discipline_code: disciplineCode });
                                        }
                                    }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                        ) : noData}
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
