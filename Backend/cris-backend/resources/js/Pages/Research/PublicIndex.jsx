import { Head, Link, router } from '@inertiajs/react';
import { Button, Card, Col, Input, Row, Space, Table, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';

export default function PublicResearchIndex({ proposals, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [year, setYear] = useState(filters.year ?? '');
    const [school, setSchool] = useState(filters.school ?? '');

    const columns = useMemo(() => [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (value, row) => <Link href={route('research.public.show', row.id)}>{value}</Link>,
        },
        {
            title: 'Authors',
            dataIndex: 'authors',
            key: 'authors',
        },
        {
            title: 'School',
            dataIndex: 'school',
            key: 'school',
        },
        {
            title: 'Year',
            dataIndex: 'year',
            key: 'year',
            width: 100,
        },
        {
            title: 'Action',
            key: 'action',
            align: 'right',
            render: (_, row) => <Link href={route('research.public.show', row.id)}>View</Link>,
        },
    ], []);

    function applyFilters() {
        router.get(route('research.public.index'), { search, year, school }, { preserveState: true });
    }

    return (
        <>
            <Head title="Public Research" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <Card className="admin-dashboard-hero" bordered={false}>
                        <Typography.Title level={2} style={{ margin: 0, color: '#ffffff' }}>
                            Public Research Archive
                        </Typography.Title>
                        <Typography.Paragraph style={{ color: 'rgba(255,255,255,0.85)', marginTop: 10, marginBottom: 0 }}>
                            Browse approved research papers from participating institutions.
                        </Typography.Paragraph>
                    </Card>

                    <Card className="admin-dashboard-shell" bordered={false}>
                        <Row gutter={[12, 12]} align="middle">
                            <Col xs={24} lg={10}>
                                <Input
                                    placeholder="Search title, author, keyword"
                                    value={search}
                                    prefix={<SearchOutlined />}
                                    onChange={(event) => setSearch(event.target.value)}
                                    onPressEnter={applyFilters}
                                />
                            </Col>
                            <Col xs={24} lg={5}>
                                <Input
                                    placeholder="Year"
                                    value={year}
                                    onChange={(event) => setYear(event.target.value.replace(/\D/g, ''))}
                                    onPressEnter={applyFilters}
                                />
                            </Col>
                            <Col xs={24} lg={5}>
                                <Input
                                    placeholder="School"
                                    value={school}
                                    onChange={(event) => setSchool(event.target.value)}
                                    onPressEnter={applyFilters}
                                />
                            </Col>
                            <Col xs={24} lg={4}>
                                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                                    <Button type="primary" onClick={applyFilters}>Search</Button>
                                    <Link href={route('login')}>
                                        <Button>Login</Button>
                                    </Link>
                                </Space>
                            </Col>
                        </Row>
                    </Card>

                    <Card className="admin-dashboard-shell" bordered={false}>
                        <Table
                            rowKey="id"
                            columns={columns}
                            dataSource={proposals.data}
                            pagination={{
                                current: proposals.current_page,
                                pageSize: proposals.per_page,
                                total: proposals.total,
                                onChange: (page) => router.get(route('research.public.index'), { search, year, school, page }, { preserveState: true }),
                            }}
                            scroll={{ x: 900 }}
                        />
                    </Card>
                </div>
            </div>
        </>
    );
}
