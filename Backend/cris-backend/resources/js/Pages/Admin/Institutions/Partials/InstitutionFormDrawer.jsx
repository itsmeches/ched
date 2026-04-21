import { Alert, Button, Drawer, Form, Space } from 'antd';
import InstitutionFormFields from './InstitutionFormFields';

export default function InstitutionFormDrawer({ title, subtitle, open, onClose, onSubmit, processing, data, setData, errors, submitText }) {
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
                <Alert type="info" showIcon message="Institution codes should stay unique because they are used throughout the admin workflow." />
                <Form layout="vertical" onSubmitCapture={onSubmit}>
                    <InstitutionFormFields data={data} setData={setData} errors={errors} />
                </Form>
            </Space>
        </Drawer>
    );
}