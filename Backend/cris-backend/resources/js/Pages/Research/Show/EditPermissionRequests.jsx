import { router } from '@inertiajs/react';
import { Button, Card, Popconfirm, Space, Tag, Typography } from 'antd';
import { KeyOutlined } from '@ant-design/icons';

export default function EditPermissionRequests({ requests, proposalId }) {
    if (!requests?.length) {
        return null;
    }

    const decide = (editRequestId, decision) =>
        router.post(
            route('research.edit-permission.decide', {
                proposal: proposalId,
                editRequest: editRequestId,
            }),
            { decision }
        );

    return (
        <Card
            id="edit-permission-requests"
            className="admin-dashboard-shell"
            bordered={false}
            title={
                <Space>
                    <KeyOutlined style={{ color: '#d97706' }} />
                    <span>Edit Permission Requests</span>
                    <Tag color="orange">{requests.length}</Tag>
                </Space>
            }
        >
            <Space direction="vertical" style={{ width: '100%' }} size={10}>
                {requests.map((req) => (
                    <div
                        key={req.id}
                        className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 bg-amber-50/50 px-4 py-3"
                    >
                        <div className="min-w-0">
                            <Typography.Text strong>{req.requester?.name}</Typography.Text>
                            {req.reason ? (
                                <Typography.Paragraph
                                    style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}
                                >
                                    {req.reason}
                                </Typography.Paragraph>
                            ) : (
                                <Typography.Text
                                    type="secondary"
                                    style={{ display: 'block', fontSize: 13, marginTop: 2 }}
                                >
                                    No reason provided
                                </Typography.Text>
                            )}
                        </div>
                        <Space>
                            <Popconfirm
                                title="Approve this edit request?"
                                description="The HEI will be able to edit this submission once."
                                okText="Approve"
                                onConfirm={() => decide(req.id, 'approved')}
                            >
                                <Button type="primary" size="small">
                                    Approve
                                </Button>
                            </Popconfirm>
                            <Popconfirm
                                title="Deny this edit request?"
                                okText="Deny"
                                okButtonProps={{ danger: true }}
                                onConfirm={() => decide(req.id, 'denied')}
                            >
                                <Button danger size="small">
                                    Deny
                                </Button>
                            </Popconfirm>
                        </Space>
                    </div>
                ))}
            </Space>
        </Card>
    );
}
