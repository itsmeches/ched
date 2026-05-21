import { forwardRef } from 'react';
import { Button, Card, Space } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';

const PdfViewer = forwardRef(function PdfViewer({ proposalId, onClose }, ref) {
    return (
        <Card
            ref={ref}
            className="admin-dashboard-shell"
            bordered={false}
            title={
                <Space>
                    <FilePdfOutlined style={{ color: '#0033a0' }} />
                    <span>PDF Viewer</span>
                </Space>
            }
            extra={
                <Button size="small" onClick={onClose}>
                    Close
                </Button>
            }
        >
            <iframe
                src={route('research.file', proposalId)}
                title="Research PDF"
                style={{
                    width: '100%',
                    height: '80vh',
                    border: 'none',
                    borderRadius: 8,
                }}
            />
        </Card>
    );
});

export default PdfViewer;
