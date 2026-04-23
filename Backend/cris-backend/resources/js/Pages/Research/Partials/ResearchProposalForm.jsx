import { Alert, Button, Col, Divider, Form, Input, InputNumber, Row, Select, Space, Typography, Upload } from 'antd';
import { Link } from '@inertiajs/react';
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

function sanitizePhoneInput(value) {
    return String(value ?? '').replace(/\D+/g, '').slice(0, 11);
}

function parseCsv(value) {
    return String(value ?? '').split(',').map((s) => s.trim());
}

function buildCoAuthorRows(names, emails, phones) {
    const nameArr = parseCsv(names).filter(Boolean);
    if (!nameArr.length) return [{ name: '', email: '', phone: '' }];
    const emailArr = parseCsv(emails);
    const phoneArr = parseCsv(phones);
    return nameArr.map((name, i) => ({
        name,
        email: emailArr[i] ?? '',
        phone: phoneArr[i] ?? '',
    }));
}

function serializeCoAuthors(rows) {
    return {
        co_authors:       rows.map((r) => r.name.trim()).join(', '),
        co_author_emails: rows.map((r) => r.email.trim()).join(', '),
        co_author_phones: rows.map((r) => r.phone.trim()).join(', '),
    };
}

export default function ResearchProposalForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    keywordOptions = [],
    submitLabel,
    currentFileName,
    showCurrentFile = false,
    cancelHref,
    cancelLabel = 'Cancel',
}) {
    const [coAuthorRows, setCoAuthorRows] = useState(() =>
        buildCoAuthorRows(data.co_authors, data.co_author_emails, data.co_author_phones),
    );

    // Sync if parent resets the form values.
    useEffect(() => {
        setCoAuthorRows(buildCoAuthorRows(data.co_authors, data.co_author_emails, data.co_author_phones));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.co_authors]);

    const updateCoAuthorRow = (index, field, value) => {
        const next = coAuthorRows.map((row, i) => (i === index ? { ...row, [field]: value } : row));
        setCoAuthorRows(next);
        const { co_authors, co_author_emails, co_author_phones } = serializeCoAuthors(next);
        setData((prev) => ({ ...prev, co_authors, co_author_emails, co_author_phones }));
    };

    const addCoAuthorRow = () => {
        if (coAuthorRows.length >= 8) return;
        const next = [...coAuthorRows, { name: '', email: '', phone: '' }];
        setCoAuthorRows(next);
    };

    const removeCoAuthorRow = (index) => {
        const next = coAuthorRows.length === 1 ? [{ name: '', email: '', phone: '' }] : coAuthorRows.filter((_, i) => i !== index);
        setCoAuthorRows(next);
        const { co_authors, co_author_emails, co_author_phones } = serializeCoAuthors(next);
        setData((prev) => ({ ...prev, co_authors, co_author_emails, co_author_phones }));
    };

    const keywordItems = Array.isArray(data.keyword_items)
        ? data.keyword_items
        : parseCsv(data.keywords).filter(Boolean);

    const keywordSelectOptions = keywordOptions.map((name) => ({ label: name, value: name }));

    return (
        <Form layout="vertical" onSubmitCapture={onSubmit} requiredMark={false}>
            <Row gutter={16}>
                <Col xs={24}>
                    <Form.Item label="Title" validateStatus={errors.title ? 'error' : ''} help={errors.title}>
                        <Input size="large" value={data.title} onChange={(event) => setData('title', event.target.value)} placeholder="Research title" />
                    </Form.Item>
                </Col>
            </Row>

            {/* ── Author ──────────────────────────────────────────────────── */}
            <Divider orientation="left" orientationMargin={0}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>Author</Typography.Text>
            </Divider>

            <Row gutter={16}>
                <Col xs={24} md={8}>
                    <Form.Item label="Author Name" validateStatus={errors.authors ? 'error' : ''} help={errors.authors}>
                        <Input size="large" value={data.authors} onChange={(e) => setData('authors', e.target.value)} placeholder="Dr. Juan dela Cruz" />
                    </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                    <Form.Item label="Author Email" validateStatus={errors.author_email ? 'error' : ''} help={errors.author_email}>
                        <Input size="large" type="email" value={data.author_email} onChange={(e) => setData('author_email', e.target.value)} placeholder="author@email.com" />
                    </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                    <Form.Item label="Author Phone" validateStatus={errors.author_phone ? 'error' : ''} help={errors.author_phone}>
                        <Input
                            size="large"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={11}
                            value={data.author_phone}
                            onChange={(e) => setData('author_phone', sanitizePhoneInput(e.target.value))}
                            placeholder="09XXXXXXXXX"
                        />
                    </Form.Item>
                </Col>
            </Row>

            {/* ── Co-Authors ──────────────────────────────────────────────── */}
            <Divider orientation="left" orientationMargin={0}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>Co-Authors</Typography.Text>
            </Divider>

            <Form.Item
                validateStatus={errors.co_authors ? 'error' : ''}
                help={errors.co_authors || 'Add up to 8 co-authors. Leave all fields empty if none.'}
            >
                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                    {coAuthorRows.map((row, index) => (
                        <Row key={`co-${index}`} gutter={8} align="middle">
                            <Col xs={24} md={8}>
                                <Input
                                    size="large"
                                    value={row.name}
                                    placeholder={`Co-author ${index + 1} name`}
                                    onChange={(e) => updateCoAuthorRow(index, 'name', e.target.value)}
                                />
                            </Col>
                            <Col xs={24} md={7}>
                                <Input
                                    size="large"
                                    type="email"
                                    value={row.email}
                                    placeholder="Email (optional)"
                                    onChange={(e) => updateCoAuthorRow(index, 'email', e.target.value)}
                                />
                            </Col>
                            <Col xs={22} md={7}>
                                <Input
                                    size="large"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={11}
                                    value={row.phone}
                                    placeholder="Phone (optional)"
                                    onChange={(e) => updateCoAuthorRow(index, 'phone', sanitizePhoneInput(e.target.value))}
                                />
                            </Col>
                            <Col xs={2} md={2} style={{ textAlign: 'right' }}>
                                <Button
                                    aria-label={`Remove co-author ${index + 1}`}
                                    icon={<MinusCircleOutlined />}
                                    disabled={coAuthorRows.length === 1}
                                    size="large"
                                    onClick={() => removeCoAuthorRow(index)}
                                />
                            </Col>
                        </Row>
                    ))}

                    <Button icon={<PlusOutlined />} onClick={addCoAuthorRow} disabled={coAuthorRows.length >= 8} size="large">
                        Add Co-Author
                    </Button>
                </Space>
            </Form.Item>

            <Divider />


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
                        <Select
                            mode="tags"
                            size="large"
                            value={keywordItems}
                            options={keywordSelectOptions}
                            placeholder="Select or type keywords"
                            onChange={(values) => {
                                const normalizedItems = values
                                    .map((value) => String(value).trim())
                                    .filter(Boolean);

                                setData((prev) => ({
                                    ...prev,
                                    keyword_items: normalizedItems,
                                    keywords: normalizedItems.join(', '),
                                }));
                            }}
                        />
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