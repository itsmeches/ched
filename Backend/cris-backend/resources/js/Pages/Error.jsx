import { Head, Link, usePage } from '@inertiajs/react';
import { Button, Card, Result, Space, Tag, Typography } from 'antd';

const statusCopy = {
    403: {
        title: 'Access restricted',
        subtitle: 'You do not have permission to open this page in CRIS.',
    },
    404: {
        title: 'Page not found',
        subtitle: 'The page or record you requested could not be found.',
    },
};

export default function ErrorPage({ status }) {
    const { auth } = usePage().props;
    const copy = statusCopy[status] ?? statusCopy[404];

    return (
        <>
            <Head title={`${status} - CRIS`} />

            <div
                style={{
                    minHeight: '100vh',
                    background:
                        'radial-gradient(circle at 0% 0%, rgba(14, 116, 144, 0.18), transparent 28%), radial-gradient(circle at 100% 0%, rgba(217, 119, 6, 0.16), transparent 30%), linear-gradient(180deg, #f8fbfd 0%, #edf4f7 100%)',
                    padding: '16px 14px',
                }}
            >
                <div style={{ maxWidth: 1120, margin: '0 auto' }}>
                    <header
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 10,
                            flexWrap: 'wrap',
                            marginBottom: 14,
                        }}
                    >
                        <div>
                            <Space size={10} align="center" style={{ marginBottom: 2 }}>
                                <img
                                    src="/cris-mark.svg"
                                    alt="CRIS"
                                    style={{ width: 38, height: 38, borderRadius: 10 }}
                                />
                                <div>
                                    <Space size={10} align="center">
                                        <Tag
                                            style={{
                                                borderRadius: 999,
                                                fontWeight: 700,
                                                marginInlineEnd: 0,
                                                backgroundColor: '#0033a0',
                                                color: '#fff',
                                                border: 'none',
                                            }}
                                        >
                                            CRIS
                                        </Tag>
                                        <Typography.Title
                                            level={4}
                                            style={{ margin: 0, color: '#0f172a' }}
                                        >
                                            CALABARZON Research Information System
                                        </Typography.Title>
                                    </Space>
                                </div>
                            </Space>
                        </div>
                        <Space style={{ marginLeft: 'auto' }}>
                            <Link href="/">
                                <Button>Public Archive</Button>
                            </Link>
                            {auth?.user ? (
                                <Link href={route('dashboard')}>
                                    <Button type="primary">Dashboard</Button>
                                </Link>
                            ) : (
                                <Link href={route('login')}>
                                    <Button type="primary">Log in</Button>
                                </Link>
                            )}
                        </Space>
                    </header>

                    <Card
                        className="admin-dashboard-shell"
                        bordered={false}
                        style={{ borderRadius: 14 }}
                    >
                        <Result
                            status={status === 403 ? '403' : '404'}
                            title={copy.title}
                            subTitle={copy.subtitle}
                            extra={
                                <Space wrap>
                                    <Link href="/">
                                        <Button type="primary">Return Home</Button>
                                    </Link>
                                    <Button onClick={() => window.history.back()}>Go Back</Button>
                                </Space>
                            }
                        />
                    </Card>
                </div>
            </div>
        </>
    );
}
