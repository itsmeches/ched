import { Card, Steps } from 'antd';

const STATUS_STEP_MAP = {
    submitted: 0,
    under_review_faculty: 1,
    under_review_hei: 2,
    under_review_ched: 3,
    approved: 4,
    rejected: -1,
    needs_revision: -1,
};

export default function WorkflowProgress({ status }) {
    const currentStep = STATUS_STEP_MAP[status] ?? 0;
    const isRejected = status === 'rejected' || status === 'needs_revision';
    const lastTitle =
        status === 'rejected'
            ? 'Rejected'
            : status === 'needs_revision'
              ? 'Needs Revision'
              : 'Approved';

    return (
        <Card className="admin-dashboard-shell" bordered={false}>
            <Steps
                current={currentStep}
                status={isRejected ? 'error' : status === 'approved' ? 'finish' : 'process'}
                size="small"
                items={[
                    { title: 'Submitted' },
                    { title: 'Faculty Review' },
                    { title: 'HEI Review' },
                    { title: 'CHED Review' },
                    { title: lastTitle },
                ]}
            />
        </Card>
    );
}
