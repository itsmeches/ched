import { Alert, Button, Col, Form, Input, InputNumber, Row, Space, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

export default function ResearchProposalForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    submitLabel,
    currentFileName,
    showCurrentFile = false,
}) {
    return (
        <Form layout="vertical" onSubmitCapture={onSubmit}>
            <Row gutter={16}>
                <Col xs={24}>
                    <Form.Item label="Title" validateStatus={errors.title ? 'error' : ''} help={errors.title}>
                        <Input value={data.title} onChange={(event) => setData('title', event.target.value)} placeholder="Research title" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item label="Authors" validateStatus={errors.authors ? 'error' : ''} help={errors.authors}>
                        <Input value={data.authors} onChange={(event) => setData('authors', event.target.value)} placeholder="Dr. Juan dela Cruz, Prof. Maria Santos" />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item label="Co-Authors" validateStatus={errors.co_authors ? 'error' : ''} help={errors.co_authors}>
                        <Input value={data.co_authors} onChange={(event) => setData('co_authors', event.target.value)} placeholder="Optional" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item label="School / University" validateStatus={errors.school ? 'error' : ''} help={errors.school}>
                        <Input value={data.school} onChange={(event) => setData('school', event.target.value)} />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item label="Year" validateStatus={errors.year ? 'error' : ''} help={errors.year}>
                        <InputNumber
                            style={{ width: '100%' }}
                            min={1900}
                            max={new Date().getFullYear() + 1}
                            value={data.year}
                            onChange={(value) => setData('year', value ?? '')}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item label="Category" validateStatus={errors.category ? 'error' : ''} help={errors.category}>
                        <Input value={data.category} onChange={(event) => setData('category', event.target.value)} placeholder="Education, Environment, Health" />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item label="Keywords" validateStatus={errors.keywords ? 'error' : ''} help={errors.keywords}>
                        <Input value={data.keywords} onChange={(event) => setData('keywords', event.target.value)} placeholder="Comma-separated keywords" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item label="Abstract" validateStatus={errors.abstract ? 'error' : ''} help={errors.abstract}>
                <Input.TextArea rows={6} value={data.abstract} onChange={(event) => setData('abstract', event.target.value)} />
            </Form.Item>

            {showCurrentFile && currentFileName && (
                <Alert
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message={`Current file: ${currentFileName}`}
                />
            )}

            <Form.Item label={showCurrentFile ? 'Replace PDF (optional, max 10 MB)' : 'PDF File (max 10 MB)'} validateStatus={errors.pdf_file ? 'error' : ''} help={errors.pdf_file}>
                <Upload
                    accept=".pdf"
                    beforeUpload={(file) => {
                        setData('pdf_file', file);
                        return false;
                    }}
                    maxCount={1}
                    fileList={data.pdf_file ? [data.pdf_file] : []}
                    onRemove={() => setData('pdf_file', null)}
                >
                    <Button icon={<UploadOutlined />}>Select PDF</Button>
                </Upload>
            </Form.Item>

            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button type="primary" htmlType="submit" loading={processing}>
                    {submitLabel}
                </Button>
            </Space>
        </Form>
    );
}