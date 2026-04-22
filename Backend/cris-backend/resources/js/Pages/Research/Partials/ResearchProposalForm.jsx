import { Alert, Button, Col, Form, Input, InputNumber, Row, Space, Upload } from 'antd';
import { Link } from '@inertiajs/react';
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

function parseCoAuthors(value) {
    return String(value ?? '')
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean);
}

export default function ResearchProposalForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    submitLabel,
    currentFileName,
    showCurrentFile = false,
    cancelHref,
    cancelLabel = 'Cancel',
}) {
    const [coAuthorInputs, setCoAuthorInputs] = useState(() => {
        const parsed = parseCoAuthors(data.co_authors);
        return parsed.length ? parsed : [''];
    });

    // Sync local inputs if the parent resets or replaces co_authors.
    useEffect(() => {
        const parsed = parseCoAuthors(data.co_authors);
        setCoAuthorInputs(parsed.length ? parsed : ['']);
    }, [data.co_authors]);

    const updateCoAuthorValue = (index, value) => {
        const next = [...coAuthorInputs];
        next[index] = value;
        setCoAuthorInputs(next);

        const serialized = next
            .map((name) => name.trim())
            .filter(Boolean)
            .join(', ');

        setData('co_authors', serialized);
    };

    const addCoAuthorField = () => {
        if (coAuthorInputs.length >= 8) {
            return;
        }

        setCoAuthorInputs([...coAuthorInputs, '']);
    };

    const removeCoAuthorField = (index) => {
        const next = coAuthorInputs.filter((_, idx) => idx !== index);
        const normalized = next.length ? next : [''];
        setCoAuthorInputs(normalized);

        const serialized = normalized
            .map((name) => name.trim())
            .filter(Boolean)
            .join(', ');

        setData('co_authors', serialized);
    };

    return (
        <Form layout="vertical" onSubmitCapture={onSubmit} requiredMark={false}>
            <Row gutter={16}>
                <Col xs={24}>
                    <Form.Item label="Title" validateStatus={errors.title ? 'error' : ''} help={errors.title}>
                        <Input size="large" value={data.title} onChange={(event) => setData('title', event.target.value)} placeholder="Research title" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item label="Authors" validateStatus={errors.authors ? 'error' : ''} help={errors.authors}>
                        <Input size="large" value={data.authors} onChange={(event) => setData('authors', event.target.value)} placeholder="Dr. Juan dela Cruz, Prof. Maria Santos" />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item
                        label="Co-Authors"
                        validateStatus={errors.co_authors ? 'error' : ''}
                        help={errors.co_authors || 'Add up to 8 co-authors. Leave empty if none.'}
                    >
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                            {coAuthorInputs.map((name, index) => (
                                <Space key={`co-author-${index}`} style={{ width: '100%' }}>
                                    <Input
                                        size="large"
                                        value={name}
                                        placeholder={`Co-author ${index + 1}`}
                                        onChange={(event) => updateCoAuthorValue(index, event.target.value)}
                                    />
                                    <Button
                                        aria-label={`Remove co-author ${index + 1}`}
                                        icon={<MinusCircleOutlined />}
                                        disabled={coAuthorInputs.length === 1}
                                        size="large"
                                        onClick={() => removeCoAuthorField(index)}
                                    />
                                </Space>
                            ))}

                            <Button
                                icon={<PlusOutlined />}
                                onClick={addCoAuthorField}
                                disabled={coAuthorInputs.length >= 8}
                                size="large"
                            >
                                Add Co-Author
                            </Button>
                        </Space>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item label="School / University" validateStatus={errors.school ? 'error' : ''} help={errors.school}>
                        <Input size="large" value={data.school} onChange={(event) => setData('school', event.target.value)} placeholder="School or university" />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item label="Year" validateStatus={errors.year ? 'error' : ''} help={errors.year}>
                        <InputNumber
                            style={{ width: '100%' }}
                            size="large"
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
                        <Input size="large" value={data.category} onChange={(event) => setData('category', event.target.value)} placeholder="Education, Environment, Health" />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item label="Keywords" validateStatus={errors.keywords ? 'error' : ''} help={errors.keywords}>
                        <Input size="large" value={data.keywords} onChange={(event) => setData('keywords', event.target.value)} placeholder="Comma-separated keywords" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item label="Abstract" validateStatus={errors.abstract ? 'error' : ''} help={errors.abstract}>
                <Input.TextArea rows={6} value={data.abstract} onChange={(event) => setData('abstract', event.target.value)} placeholder="Summarize your research objectives, methods, and expected outcomes" />
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
                    <Button size="large" icon={<UploadOutlined />}>Select PDF</Button>
                </Upload>
            </Form.Item>

            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                {cancelHref && (
                    <Link href={cancelHref}>
                        <Button size="large">{cancelLabel}</Button>
                    </Link>
                )}
                <Button size="large" type="primary" htmlType="submit" loading={processing}>
                    {submitLabel}
                </Button>
            </Space>
        </Form>
    );
}