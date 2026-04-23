import { Alert, Button, Card, Col, Divider, Form, Input, Row, Select, Space, Tag, Typography } from 'antd';
import { Link, router } from '@inertiajs/react';
import { PlusOutlined, UserAddOutlined } from '@ant-design/icons';

function getInstitutionOptionLabel(institution) {
    return institution.code ? `${institution.name} (${institution.code})` : institution.name;
}

export default function SuperAdminAccountPanel({ data, setData, postSubmit, processing, errors, institutions, roles }) {
    return (
        <Row gutter={[24, 24]}>
            <Col xs={24} xl={14}>
                <Card title={<Space><UserAddOutlined /><span>Create New Account</span></Space>} extra={<Tag style={{ color: '#0033a0', backgroundColor: '#e6f2ff', borderColor: '#0033a0' }}>Writes directly to database</Tag>} className="admin-dashboard-shell">
                    <Typography.Paragraph type="secondary">
                        Create HEI, CHED, or Super Admin users here. New accounts are available immediately after save.
                    </Typography.Paragraph>

                    <Form layout="vertical" onSubmitCapture={postSubmit}>
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item label="Full Name" validateStatus={errors.name ? 'error' : ''} help={errors.name}>
                                    <Input size="large" value={data.name} onChange={(event) => setData('name', event.target.value)} placeholder="Juan Dela Cruz" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label="Email Address" validateStatus={errors.email ? 'error' : ''} help={errors.email}>
                                    <Input size="large" type="email" value={data.email} onChange={(event) => setData('email', event.target.value)} placeholder="user@domain.edu.ph" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item label="Role" validateStatus={errors.role ? 'error' : ''} help={errors.role}>
                                    <Select
                                        size="large"
                                        value={data.role}
                                        options={roles.map((role) => ({ value: role.value, label: role.label }))}
                                        onChange={(value) => {
                                            setData('role', value);
                                            if (value !== 'hei') {
                                                setData('institution_id', '');
                                            }
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label="Institution" validateStatus={errors.institution_id ? 'error' : ''} help={errors.institution_id}>
                                    <Select
                                        size="large"
                                        value={data.institution_id || undefined}
                                        placeholder={data.role === 'hei' ? 'Select an institution' : 'Not required for this role'}
                                        disabled={data.role !== 'hei'}
                                        options={institutions.map((institution) => ({ value: institution.id, label: getInstitutionOptionLabel(institution) }))}
                                        onChange={(value) => setData('institution_id', value ?? '')}
                                        allowClear
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item label="Password" validateStatus={errors.password ? 'error' : ''} help={errors.password}>
                                    <Input.Password size="large" value={data.password} onChange={(event) => setData('password', event.target.value)} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label="Confirm Password" validateStatus={errors.password_confirmation ? 'error' : ''} help={errors.password_confirmation}>
                                    <Input.Password size="large" value={data.password_confirmation} onChange={(event) => setData('password_confirmation', event.target.value)} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider style={{ marginBlock: 8 }} />

                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                            <Alert type="info" showIcon message="HEI accounts must be linked to an institution. CHED and Super Admin accounts remain unassigned by design." />
                            <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
                                <Button size="large" icon={<PlusOutlined />} onClick={() => router.visit(route('admin.institutions.create'))}>Add Institution First</Button>
                                <Button size="large" type="primary" htmlType="submit" loading={processing} icon={<UserAddOutlined />}>Create Account</Button>
                            </Space>
                        </Space>
                    </Form>
                </Card>
            </Col>

            <Col xs={24} xl={10}>
                <Space direction="vertical" size={24} style={{ width: '100%' }}>
                    <Card title="Quick Actions" className="admin-dashboard-shell">
                        <Space direction="vertical" size={12} style={{ width: '100%' }}>
                            <Button block size="large" onClick={() => router.visit(route('admin.users.index'))} style={{ height: 'auto', paddingBlock: 12 }}>
                                <div style={{ textAlign: 'left', width: '100%', lineHeight: 1.35 }}>
                                    <div style={{ fontWeight: 600 }}>Manage all users</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>Edit, filter, and maintain account access.</div>
                                </div>
                            </Button>
                            <Button block size="large" onClick={() => router.visit(route('admin.institutions.create'))} style={{ height: 'auto', paddingBlock: 12 }}>
                                <div style={{ textAlign: 'left', width: '100%', lineHeight: 1.35 }}>
                                    <div style={{ fontWeight: 600 }}>Add institution</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>Register a new school before assigning HEI accounts.</div>
                                </div>
                            </Button>
                            <Button block size="large" onClick={() => router.visit(route('research.index'))} style={{ height: 'auto', paddingBlock: 12 }}>
                                <div style={{ textAlign: 'left', width: '100%', lineHeight: 1.35 }}>
                                    <div style={{ fontWeight: 600 }}>Open research records</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>Review submitted and approved proposals.</div>
                                </div>
                            </Button>
                        </Space>
                    </Card>

                    <Card title="Profile Tools" className="admin-dashboard-shell">
                        <Space direction="vertical" size={12} style={{ width: '100%' }}>
                            <Link href={route('profile.edit')}><Button size="large" block>Update my profile</Button></Link>
                            <Link href={route('admin.institutions.index')}><Button size="large" block>Browse institutions</Button></Link>
                        </Space>
                    </Card>
                </Space>
            </Col>
        </Row>
    );
}