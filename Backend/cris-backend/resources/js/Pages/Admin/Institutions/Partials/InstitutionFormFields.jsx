import { Col, Form, Input, Row } from 'antd';

export default function InstitutionFormFields({ data, setData, errors }) {
    return (
        <>
            <Form.Item
                label="Institution Name"
                validateStatus={errors.name ? 'error' : ''}
                help={errors.name}
            >
                <Input
                    size="large"
                    value={data.name}
                    onChange={(event) => setData('name', event.target.value)}
                    placeholder="Batangas State University"
                />
            </Form.Item>

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item
                        label="Acronym"
                        validateStatus={errors.code ? 'error' : ''}
                        help={errors.code}
                    >
                        <Input
                            size="large"
                            value={data.acronym}
                            onChange={(event) => setData('acronym', event.target.value)}
                            placeholder="BSU"
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item
                        label="Contact Email"
                        validateStatus={errors.contact_email ? 'error' : ''}
                        help={errors.contact_email}
                    >
                        <Input
                            size="large"
                            type="email"
                            value={data.contact_email}
                            onChange={(event) => setData('contact_email', event.target.value)}
                            placeholder="admin@school.edu.ph"
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item
                label="Address"
                validateStatus={errors.address ? 'error' : ''}
                help={errors.address}
            >
                <Input.TextArea
                    rows={3}
                    value={data.address}
                    onChange={(event) => setData('address', event.target.value)}
                    placeholder="Full mailing address"
                />
            </Form.Item>

            <Form.Item
                label="Contact Phone"
                validateStatus={errors.contact_phone ? 'error' : ''}
                help={errors.contact_phone}
            >
                <Input
                    size="large"
                    value={data.contact_phone}
                    onChange={(event) => setData('contact_phone', event.target.value)}
                    placeholder="(043) 123-4567"
                />
            </Form.Item>
        </>
    );
}
