import { Alert, Button, Drawer, Form, Space } from 'antd';
import InstitutionFormFields from './InstitutionFormFields';

export default function InstitutionFormDrawer({ title, subtitle, open, onClose, onSubmit, processing, data, setData, errors, submitText }) {
    return (
        <Drawer
            title={title}
            placement="right"
            width="min(640px, 100vw)"
            open={open}
            onClose={onClose}
            destroyOnClose={false}
            styles={{ body: { paddingTop: 16, paddingBottom: 20, paddingInline: 20 } }}
            extra={
                <Space wrap>
                    <Button size="large" onClick={onClose}>Cancel</Button>
                    <Button size="large" type="primary" onClick={onSubmit} loading={processing}>
                        {submitText}
                    </Button>
                </Space>
            }
        >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                {subtitle && <div className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</div>}
                <Alert type="info" showIcon message="Institution acronyms should stay unique because they are used throughout the admin workflow." />
                <Form layout="vertical" onSubmitCapture={onSubmit}>
                    <InstitutionFormFields data={data} setData={setData} errors={errors} />
                </Form>
            </Space>
        </Drawer>
    );
}