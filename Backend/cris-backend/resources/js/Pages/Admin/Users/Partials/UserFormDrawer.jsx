import { Alert, Button, Drawer, Form, Space } from 'antd';
import UserFormFields from './UserFormFields';

export default function UserFormDrawer({
    title,
    subtitle,
    open,
    onClose,
    onSubmit,
    processing,
    data,
    setData,
    errors,
    roles,
    institutions,
    includePasswordHint = false,
    submitText,
}) {
    return (
        <Drawer
            className="user-form-drawer"
            title={title}
            placement="right"
            width="min(640px, 100vw)"
            open={open}
            onClose={onClose}
            destroyOnClose={false}
            styles={{ body: { paddingTop: 16, paddingBottom: 20, paddingInline: 20 } }}
            extra={
                <Space wrap>
                    <Button size="large" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button size="large" type="primary" onClick={onSubmit} loading={processing}>
                        {submitText}
                    </Button>
                </Space>
            }
        >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                {subtitle && (
                    <div className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</div>
                )}
                <Alert
                    type="info"
                    showIcon
                    message="HEI, Faculty, and Student accounts require an institution. CHED and Super Admin accounts remain global."
                />
                <Form layout="vertical" onSubmitCapture={onSubmit}>
                    <UserFormFields
                        data={data}
                        setData={setData}
                        errors={errors}
                        roles={roles}
                        institutions={institutions}
                        includePasswordHint={includePasswordHint}
                    />
                </Form>
            </Space>
        </Drawer>
    );
}
