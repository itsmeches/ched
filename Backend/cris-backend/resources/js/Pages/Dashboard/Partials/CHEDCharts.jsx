import { Card, Col, Grid, Row, Statistic, Tag } from 'antd';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, RadialBarChart, RadialBar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { ArrowUpOutlined } from '@ant-design/icons';
import { useTheme } from '@/utils/ThemeContext';

export default function CHEDCharts({ monthlyTrends = [], disciplineBreakdown = [], approvalFunnel = [], stats = {} }) {
    const { dark } = useTheme();
    const { useBreakpoint } = Grid;
    const screens = useBreakpoint();
    const disciplineTickLimit = screens.xxl ? 40 : screens.xl ? 34 : screens.lg ? 28 : screens.md ? 22 : 16;
    const accentPrimary = dark ? '#93c5fd' : '#0033a0';
    const metricTextColor = dark ? '#e2e8f0' : '#0f172a';
    const axisColor = dark ? '#94a3b8' : '#64748b';
    const gridColor = dark ? '#334155' : '#e2e8f0';
    const tooltipBgColor = dark ? '#0f172a' : '#f8fafc';
    const tooltipBorderColor = dark ? '#334155' : '#e2e8f0';
    const emptyTextColor = dark ? '#94a3b8' : '#94a3b8';

    const formatDisciplineTick = (value) => {
        if (!value) {
            return '';
        }

        return value.length > disciplineTickLimit ? `${value.slice(0, disciplineTickLimit)}...` : value;
    };

    const statusData = [
        { name: 'Approved', value: stats.approved || 0, fill: '#16a34a' },
        { name: 'Pending', value: stats.pending || 0, fill: '#d97706' },
        { name: 'Rejected', value: stats.rejected || 0, fill: '#dc2626' },
    ];

    const gaugeData = [
        { name: 'Approval Rate', value: stats.approvalRate || 0, fill: accentPrimary },
    ];

    return (
        <div className="space-y-4">
            {/* KPI Header */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} xl={8}>
                    <Card className="admin-dashboard-shell" hoverable>
                        <Statistic
                            title="Total Papers Reviewed"
                            value={stats.total || 0}
                            prefix={<span style={{ color: accentPrimary }}>📊</span>}
                            valueStyle={{ fontSize: 28, color: metricTextColor }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} xl={8}>
                    <Card className="admin-dashboard-shell" hoverable>
                        <Statistic
                            title="Approval Rate"
                            value={stats.approvalRate || 0}
                            suffix="%"
                            prefix={<span style={{ color: '#16a34a' }}>✓</span>}
                            valueStyle={{ fontSize: 28, color: metricTextColor }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} xl={8}>
                    <Card className="admin-dashboard-shell" hoverable>
                        <Statistic
                            title="Reviewed Today"
                            value={stats.reviewedToday || 0}
                            prefix={<ArrowUpOutlined style={{ color: '#d97706' }} />}
                            valueStyle={{ fontSize: 28, color: metricTextColor }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts Grid */}
            <Row gutter={[16, 16]}>
                {/* Monthly Trend */}
                <Col xs={24} xl={16}>
                    <Card title="Monthly Approval Trend (Last 12 Months)" className="admin-dashboard-shell" bordered={false}>
                        {monthlyTrends && monthlyTrends.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={monthlyTrends}>
                                    <defs>
                                        <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#d97706" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                    <XAxis dataKey="month" stroke={axisColor} />
                                    <YAxis stroke={axisColor} />
                                    <Tooltip contentStyle={{ backgroundColor: tooltipBgColor, border: `1px solid ${tooltipBorderColor}`, borderRadius: 6 }} />
                                    <Legend />
                                    <Area type="monotone" dataKey="approved" stroke="#16a34a" fillOpacity={1} fill="url(#colorApproved)" name="Approved" />
                                    <Area type="monotone" dataKey="pending" stroke="#d97706" fillOpacity={1} fill="url(#colorPending)" name="Pending" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: emptyTextColor }}>
                                No data available
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Status Distribution */}
                <Col xs={24} xl={8}>
                    <Card title="Overall Status Distribution" className="admin-dashboard-shell" bordered={false}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {statusData.map((item) => (
                                <Tag key={item.name} color={item.fill} style={{ padding: '4px 12px', fontSize: 12 }}>
                                    {item.name}: {item.value}
                                </Tag>
                            ))}
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Approval Funnel */}
            <Row gutter={[16, 16]}>
                <Col xs={24} xl={12}>
                    <Card title="Approval Funnel by Stage" className="admin-dashboard-shell" bordered={false}>
                        {approvalFunnel && approvalFunnel.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart layout="vertical" data={approvalFunnel}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                    <XAxis type="number" stroke={axisColor} />
                                    <YAxis dataKey="stage" type="category" stroke={axisColor} width={100} />
                                    <Tooltip contentStyle={{ backgroundColor: tooltipBgColor, border: `1px solid ${tooltipBorderColor}`, borderRadius: 6 }} />
                                    <Bar dataKey="count" fill={accentPrimary} radius={[0, 8, 8, 0]} name="Papers in Stage" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: emptyTextColor }}>
                                No data available
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Discipline Distribution */}
                <Col xs={24} xl={12}>
                    <Card title="Top Research Disciplines" className="admin-dashboard-shell" bordered={false}>
                        {disciplineBreakdown && disciplineBreakdown.length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={disciplineBreakdown} margin={{ top: 8, right: 16, left: 0, bottom: 64 }}>
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
                                    <YAxis stroke={axisColor} />
                                    <Tooltip contentStyle={{ backgroundColor: tooltipBgColor, border: `1px solid ${tooltipBorderColor}`, borderRadius: 6 }} />
                                    <Bar dataKey="submissions" fill="#d97706" radius={[8, 8, 0, 0]} name="Submissions" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: emptyTextColor }}>
                                No data available
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Approval Rate Gauge */}
            <Row gutter={[16, 16]}>
                <Col xs={24} xl={8}>
                    <Card title="Approval Rate Gauge" className="admin-dashboard-shell" bordered={false}>
                        <ResponsiveContainer width="100%" height={250}>
                            <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={gaugeData} startAngle={90} endAngle={0}>
                                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} />
                                <PolarRadiusAxis />
                                <RadialBar background dataKey="value" fill={accentPrimary} angleAxisId={0} />
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 32, fontWeight: 'bold', fill: accentPrimary }}>
                                    {stats.approvalRate || 0}%
                                </text>
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* Summary Stats */}
                <Col xs={24} xl={16}>
                    <Card title="Summary Statistics" className="admin-dashboard-shell" bordered={false}>
                        <Row gutter={[12, 12]}>
                            <Col xs={12} sm={6}>
                                <div style={{ textAlign: 'center', padding: 12 }}>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#16a34a' }}>{stats.approved || 0}</div>
                                    <div style={{ fontSize: 12, color: axisColor, marginTop: 4 }}>Approved</div>
                                </div>
                            </Col>
                            <Col xs={12} sm={6}>
                                <div style={{ textAlign: 'center', padding: 12 }}>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#d97706' }}>{stats.pending || 0}</div>
                                    <div style={{ fontSize: 12, color: axisColor, marginTop: 4 }}>Pending</div>
                                </div>
                            </Col>
                            <Col xs={12} sm={6}>
                                <div style={{ textAlign: 'center', padding: 12 }}>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#dc2626' }}>{stats.rejected || 0}</div>
                                    <div style={{ fontSize: 12, color: axisColor, marginTop: 4 }}>Rejected</div>
                                </div>
                            </Col>
                            <Col xs={12} sm={6}>
                                <div style={{ textAlign: 'center', padding: 12 }}>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: accentPrimary }}>{stats.total || 0}</div>
                                    <div style={{ fontSize: 12, color: axisColor, marginTop: 4 }}>Total</div>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
