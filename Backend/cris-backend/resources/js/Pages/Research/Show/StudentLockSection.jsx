import { useForm } from '@inertiajs/react';
import { Alert, Button, Card, Input, Space, Typography } from 'antd';
import { KeyOutlined, LockOutlined } from '@ant-design/icons';

const STATUS_MESSAGES = {
    approved:
        'This research has been approved. If you need to make corrections, you can request edit permission from CHED.',
    rejected:
        'This research was rejected. You can edit it, then resubmit to restart the review from Faculty.',
    needs_revision: 'Revision is required. Update your research and resubmit for review.',
    under_review_hei: 'This submission is awaiting HEI review and is currently locked for editing.',
    under_review_faculty: 'This submission is currently under Faculty review and cannot be edited.',
};

export default function StudentLockSection({ proposal, editPermission }) {
    const editPermForm = useForm({ reason: '' });

    const baseMessage =
        proposal.status === 'under_review_ched' && proposal.viewed_at
            ? 'This submission is locked because CHED has already viewed it. You may request permission to edit from the reviewing CHED officer.'
            : (STATUS_MESSAGES[proposal.status] ?? null);

    const showRequestForm = !editPermission || editPermission.status === 'denied';

    return (
        <Card
            id="editing-locked"
            className="admin-dashboard-shell"
            bordered={false}
            title={
                <Space>
                    <LockOutlined style={{ color: '#d97706' }} />
                    <span>Editing Locked</span>
                </Space>
            }
        >
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
                {baseMessage && <Typography.Text type="secondary">{baseMessage}</Typography.Text>}

                {showRequestForm && (
                    <Space direction="vertical" style={{ width: '100%' }} size={8}>
                        {editPermission?.status === 'denied' && (
                            <Alert
                                type="error"
                                showIcon
                                message="Request Denied"
                                description="Your previous edit permission request was denied. You may submit a new request below."
                                style={{ marginBottom: 4 }}
                            />
                        )}
                        <Input.TextArea
                            rows={3}
                            placeholder="Reason for edit request (optional)"
                            value={editPermForm.data.reason}
                            onChange={(e) => editPermForm.setData('reason', e.target.value)}
                            maxLength={500}
                            showCount
                        />
                        <Button
                            type="primary"
                            icon={<KeyOutlined />}
                            loading={editPermForm.processing}
                            onClick={() =>
                                editPermForm.post(
                                    route('research.edit-permission.store', proposal.id),
                                    { onSuccess: () => editPermForm.reset() }
                                )
                            }
                        >
                            Request Edit Permission
                        </Button>
                    </Space>
                )}

                {editPermission?.status === 'pending' && (
                    <Alert
                        type="info"
                        showIcon
                        message="Request Pending"
                        description="Your edit permission request is awaiting CHED review."
                    />
                )}

                {editPermission?.status === 'approved' && (
                    <Alert
                        type="success"
                        showIcon
                        message="Permission Granted"
                        description="CHED approved your request. Use the Edit button above to make your changes."
                    />
                )}
            </Space>
        </Card>
    );
}
