import { Alert, Button, Drawer, Form, Space } from 'antd';
import UserFormFields from './UserFormFields';

export default function UserFormDrawer({ title, subtitle, open, onClose, onSubmit, processing, data, setData, errors, roles, institutions, includePasswordHint = false, submitText }) {
    return (
        <Drawer
            title={title}
            placement="right"
            width={640}
            open={open}
            onClose={onClose}
            destroyOnClose={false}
            extra={
                <Space>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="primary" onClick={onSubmit} loading={processing}>
                        {submitText}
                    </Button>
                </Space>
            }
        >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                {subtitle && <div style={{ color: '#64748b' }}>{subtitle}</div>}
                <Alert type="info" showIcon message="HEI accounts require an institution. CHED and Super Admin accounts remain global." />
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