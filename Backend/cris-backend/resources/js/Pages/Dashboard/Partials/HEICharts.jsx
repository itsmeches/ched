import { Card, Col, Row, Tag } from 'antd';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { router } from '@inertiajs/react';
import { useTheme } from '@/utils/ThemeContext';

function truncateName(value) {
    if (!value) return value;
    return value.length > 16 ? `${value.slice(0, 16)}...` : value;
}

export default function HEICharts({ stats = {}, stageCounts = {}, monthlyTrends = [], facultyBreakdown = [] }) {
    const { dark } = useTheme();
    const accentPrimary = dark ? '#93c5fd' : '#0033a0';
    const surfaceColor = dark ? '#0f172a' : '#f8fafc';
    const borderColor = dark ? '#334155' : '#e2e8f0';
    const axisColor = dark ? '#94a3b8' : '#64748b';

    const statusData = [
        { name: 'Approved', value: stats.approved ?? 0, fill: '#16a34a' },
        { name: 'Pending', value: stats.pending ?? 0, fill: '#d97706' },
        { name: 'Rejected', value: stats.rejected ?? 0, fill: '#dc2626' },
    ];

    const stageFlow = [
        { stage: 'Faculty', count: stageCounts.under_review_faculty ?? 0 },
        { stage: 'HEI', count: stageCounts.under_review_hei ?? 0 },
        { stage: 'CHED', count: stageCounts.under_review_ched ?? 0 },
        { stage: 'Approved', count: stageCounts.approved ?? 0 },
        { stage: 'Rejected', count: stageCounts.rejected ?? 0 },
    ];

    const stageToStatus = {
        Faculty: 'under_review_faculty',
        HEI: 'under_review_hei',
        CHED: 'under_review_ched',
        Approved: 'approved',
        Rejected: 'rejected',
    };

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
        <div className="space-y-4">
            <Row gutter={[16, 16]}>
                <Col xs={24} xl={16}>
                    <Card className="admin-dashboard-shell" bordered={false} title="Institution Submission Trend">
                        {monthlyTrends.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={monthlyTrends}>
                                    <defs>
                                        <linearGradient id="heiSubmissions" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={accentPrimary} stopOpacity={0.45} />
                                            <stop offset="95%" stopColor={accentPrimary} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="heiApproved" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
                                    <XAxis dataKey="month" stroke={axisColor} />
                                    <YAxis stroke={axisColor} allowDecimals={false} />
                                    <Tooltip contentStyle={{ backgroundColor: surfaceColor, border: `1px solid ${borderColor}`, borderRadius: 8 }} labelStyle={{ fontWeight: 600 }} />
                                    <Area type="monotone" dataKey="submissions" stroke={accentPrimary} strokeWidth={2} fill="url(#heiSubmissions)" name="Submissions" onClick={onMonthClick} />
                                    <Area type="monotone" dataKey="approved" stroke="#16a34a" strokeWidth={2} fill="url(#heiApproved)" name="Approved" onClick={onMonthClick} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: axisColor }}>
                                No monthly data available.
                            </div>
                        )}
                    </Card>
                </Col>

                <Col xs={24} xl={8}>
                    <Card className="admin-dashboard-shell" bordered={false} title="Status Distribution">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} onClick={onStatusClick}>
                                    {statusData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: surfaceColor, border: `1px solid ${borderColor}`, borderRadius: 8 }} labelStyle={{ fontWeight: 600 }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center gap-2 pt-3">
                            {statusData.map((item) => (
                                <Tag key={item.name} color={item.fill} style={{ paddingInline: 10, paddingBlock: 4 }}>
                                    {item.name}: {item.value}
                                </Tag>
                            ))}
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} xl={12}>
                    <Card className="admin-dashboard-shell" bordered={false} title="Review Stage Pipeline">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={stageFlow}>
                                <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
                                <XAxis dataKey="stage" stroke={axisColor} />
                                <YAxis stroke={axisColor} allowDecimals={false} />
                                <Tooltip contentStyle={{ backgroundColor: surfaceColor, border: `1px solid ${borderColor}`, borderRadius: 8 }} labelStyle={{ fontWeight: 600 }} />
                                <Bar
                                    dataKey="count"
                                    fill={accentPrimary}
                                    radius={[8, 8, 0, 0]}
                                    onClick={(event) => {
                                        const status = stageToStatus[event?.payload?.stage || ''];
                                        if (status) {
                                            openResearch({ status });
                                        }
                                    }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24} xl={12}>
                    <Card className="admin-dashboard-shell" bordered={false} title="Faculty Submission Breakdown">
                        {facultyBreakdown.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={facultyBreakdown}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
                                    <XAxis dataKey="faculty" tickFormatter={truncateName} stroke={axisColor} angle={-25} textAnchor="end" height={80} interval={0} />
                                    <YAxis stroke={axisColor} allowDecimals={false} />
                                    <Tooltip contentStyle={{ backgroundColor: surfaceColor, border: `1px solid ${borderColor}`, borderRadius: 8 }} labelStyle={{ fontWeight: 600 }} />
                                    <Bar
                                        dataKey="submissions"
                                        fill="#d97706"
                                        radius={[8, 8, 0, 0]}
                                        onClick={(event) => {
                                            const facultyName = event?.payload?.faculty;
                                            if (facultyName) {
                                                openResearch({ search: facultyName });
                                            }
                                        }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: axisColor }}>
                                No faculty submission data available.
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
