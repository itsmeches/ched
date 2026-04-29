import { Col, Form, Input, Row, Select } from 'antd';

export default function UserFormFields({ data, setData, errors, roles, institutions, includePasswordHint = false }) {
    const requiresInstitution = ['hei', 'faculty', 'student'].includes(data.role);

    return (
        <>
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
                            placeholder={requiresInstitution ? 'Select an institution' : 'Not required for this role'}
                            disabled={!requiresInstitution}
                            options={institutions.map((institution) => ({ value: institution.id, label: institution.name }))}
                            onChange={(value) => setData('institution_id', value ?? '')}
                            allowClear
                        />
                    </Form.Item>
                </Col>
            </Row>

            {includePasswordHint && (
                <Form.Item>
                    <div style={{ color: '#475569', fontSize: 13 }}>
                        Leave the password fields blank to keep the current password unchanged.
                    </div>
                </Form.Item>
            )}

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item label={includePasswordHint ? 'New Password' : 'Password'} validateStatus={errors.password ? 'error' : ''} help={errors.password}>
                        <Input.Password size="large" value={data.password} onChange={(event) => setData('password', event.target.value)} placeholder={includePasswordHint ? 'Leave blank to keep current password' : 'Set account password'} />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item label={includePasswordHint ? 'Confirm New Password' : 'Confirm Password'} validateStatus={errors.password_confirmation ? 'error' : ''} help={errors.password_confirmation}>
                        <Input.Password size="large" value={data.password_confirmation} onChange={(event) => setData('password_confirmation', event.target.value)} placeholder="Repeat password" />
                    </Form.Item>
                </Col>
            </Row>
        </>
    );
}