import { Alert, Input, Modal, Select, Space, Tag, Typography } from 'antd';

export default function RejectModal({
    open,
    title,
    templates = [],
    templateOptions = [],
    comments,
    error,
    loading,
    onCommentsChange,
    onSubmit,
    onCancel,
}) {
    return (
        <Modal
            title={title}
            open={open}
            onCancel={onCancel}
            onOk={onSubmit}
            okText="Reject"
            okButtonProps={{ danger: true, loading }}
        >
            <Space direction="vertical" size={10} style={{ width: '100%' }}>
                {templates.length > 0 && (
                    <div>
                        <Typography.Text
                            type="secondary"
                            style={{ fontSize: 12, display: 'block', marginBottom: 6 }}
                        >
                            Quick templates
                        </Typography.Text>
                        <Space wrap size={[6, 6]}>
                            {templates.map((template) => (
                                <Tag.CheckableTag
                                    key={template}
                                    checked={comments === template}
                                    onChange={() => onCommentsChange(template)}
                                >
                                    {template.length > 58
                                        ? `${template.slice(0, 58)}...`
                                        : template}
                                </Tag.CheckableTag>
                            ))}
                        </Space>
                    </div>
                )}
                <Select
                    placeholder="Apply remark template"
                    options={templateOptions}
                    onChange={(value) => onCommentsChange(value)}
                />
                <Input.TextArea
                    rows={4}
                    value={comments}
                    onChange={(event) => onCommentsChange(event.target.value)}
                    placeholder="Enter rejection remarks"
                />
                {error && <Alert type="error" showIcon message={error} />}
            </Space>
        </Modal>
    );
}
