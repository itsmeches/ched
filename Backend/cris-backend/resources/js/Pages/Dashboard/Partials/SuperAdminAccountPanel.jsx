import { Alert, Button, Card, Col, Divider, Form, Input, Row, Select, Space, Tag, Typography } from 'antd';
import { router } from '@inertiajs/react';
import { PlusOutlined, UserAddOutlined } from '@ant-design/icons';
import { useTheme } from '@/utils/ThemeContext';

function getInstitutionOptionLabel(institution) {
    return institution.code ? `${institution.name} (${institution.code})` : institution.name;
}

export default function SuperAdminAccountPanel({ data, setData, postSubmit, processing, errors, institutions, roles }) {
    const { dark } = useTheme();
    const accentPrimary = dark ? '#93c5fd' : '#0033a0';
    return (
        <Row gutter={[24, 24]}>
            <Col xs={24}>
                <Card title={<Space><UserAddOutlined /><span>Create New Account</span></Space>} extra={<Tag style={{ color: accentPrimary, backgroundColor: dark ? 'rgba(147,197,253,0.15)' : '#e6f2ff', borderColor: accentPrimary }}>Writes directly to database</Tag>} className="admin-dashboard-shell dashboard-table-card" bordered={false}>
                    <Typography.Paragraph type="secondary" style={{ maxWidth: 860 }}>
                        Create HEI, Faculty, Student, CHED, or Super Admin users here. New accounts are available immediately after save.
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
                                            if (!['hei', 'faculty', 'student'].includes(value)) {
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
                                        placeholder={['hei', 'faculty', 'student'].includes(data.role) ? 'Select an institution' : 'Not required for this role'}
                                        disabled={!['hei', 'faculty', 'student'].includes(data.role)}
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
                            <Alert type="info" showIcon message="HEI, Faculty, and Student accounts must be linked to an institution. CHED and Super Admin accounts remain unassigned by design." />
                            <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
                                <Button size="large" icon={<PlusOutlined />} onClick={() => router.visit(route('admin.institutions.create'))}>Add Institution First</Button>
                                <Button size="large" type="primary" htmlType="submit" loading={processing} icon={<UserAddOutlined />}>Create Account</Button>
                            </Space>
                        </Space>
                    </Form>
                </Card>
            </Col>
        </Row>
    );
}