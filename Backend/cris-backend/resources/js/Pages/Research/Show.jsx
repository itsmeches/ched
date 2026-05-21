import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import Breadcrumb from '@/Components/Breadcrumb';
import { Alert, Card, Typography, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { getReviewRemarkTemplates } from '@/utils/reviewRemarkTemplates';
import WorkflowProgress from './Show/WorkflowProgress';
import EditPermissionRequests from './Show/EditPermissionRequests';
import ResearchHeader from './Show/ResearchHeader';
import PdfViewer from './Show/PdfViewer';
import ResearchTimeline from './Show/ResearchTimeline';
import StudentLockSection from './Show/StudentLockSection';
import RejectModal from './Show/RejectModal';

const REJECT_TITLE = {
    submitted: 'Faculty Reject Submission',
    under_review_faculty: 'Faculty Reject Submission',
    under_review_hei: 'HEI Reject Submission',
    under_review_ched: 'CHED Reject Submission',
};

const REVIEW_TITLE = {
    submitted: 'Faculty Review Decision',
    under_review_faculty: 'Faculty Review Decision',
    under_review_hei: 'HEI Review Decision',
    under_review_ched: 'CHED Final Review Decision',
};

const REJECT_STARTER = {
    under_review_faculty:
        'Faculty review: Please revise and improve the submission based on stage requirements.',
    under_review_hei:
        'HEI review: Please revise and improve the submission based on institutional requirements.',
};

function defaultRejectStarter(status) {
    return (
        REJECT_STARTER[status] ??
        'CHED final review: Please revise and resubmit with required corrections.'
    );
}

function showReviewActionsFor(role, status) {
    if (role === 'faculty') return ['submitted', 'under_review_faculty'].includes(status);
    if (role === 'hei') return status === 'under_review_hei';
    if (role === 'ched') return status === 'under_review_ched';
    if (role === 'super_admin') {
        return [
            'submitted',
            'under_review_faculty',
            'under_review_hei',
            'under_review_ched',
        ].includes(status);
    }
    return false;
}

export default function ResearchShow({
    proposal,
    researchHistory = [],
    canEdit,
    canReview,
    canDelete,
    editPermission,
    pendingEditRequests,
    breadcrumbs = [],
}) {
    const { flash, auth } = usePage().props;
    const deleteForm = useForm({});
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [rejectModal, setRejectModal] = useState({
        open: false,
        comments: '',
        starter: '',
        error: '',
    });
    const [pdfOpen, setPdfOpen] = useState(false);
    const pdfCardRef = useRef(null);

    const role = auth?.user?.role;
    const isLockedForEditing = proposal.status !== 'rejected';
    const canEditFromPermission = role === 'student' && editPermission?.status === 'approved';
    const canShowEditButton = canEdit || canEditFromPermission;
    const showReviewActions = showReviewActionsFor(role, proposal.status);

    const rejectTemplates = getReviewRemarkTemplates(
        proposal.status === 'submitted' ? 'under_review_faculty' : proposal.status
    );
    const remarkTemplateOptions = rejectTemplates.map((template) => ({
        value: template,
        label: template,
    }));

    function handleViewPdf() {
        const opening = !pdfOpen;
        setPdfOpen(opening);
        if (opening) {
            setTimeout(() => {
                pdfCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
        }
    }

    useEffect(() => {
        if (flash?.success) {
            message.success(flash.success);
        }
        if (flash?.error) {
            message.error(flash.error);
        }
    }, [flash?.success, flash?.error]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const hash = window.location.hash;
        if (!hash || hash.length <= 1) {
            return;
        }

        const targetId = decodeURIComponent(hash.slice(1));

        setTimeout(() => {
            const el = document.getElementById(targetId);
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
    }, [proposal?.id]);

    function openRejectModal() {
        const starter = defaultRejectStarter(proposal.status);
        setRejectModal({ open: true, comments: starter, starter, error: '' });
    }

    function closeRejectModal() {
        setRejectModal({ open: false, comments: '', starter: '', error: '' });
    }

    function submitApprove() {
        setIsSubmittingReview(true);
        router.post(
            route('research.review', proposal.id),
            { action: 'approve' },
            { onFinish: () => setIsSubmittingReview(false) }
        );
    }

    function submitReject() {
        const remarks = String(rejectModal.comments || '').trim();

        if (!remarks) {
            setRejectModal((prev) => ({
                ...prev,
                error: 'Remarks are required when rejecting a submission.',
            }));
            return;
        }

        if (remarks === String(rejectModal.starter || '').trim()) {
            setRejectModal((prev) => ({
                ...prev,
                error: 'Please edit the default remarks before submitting rejection.',
            }));
            return;
        }

        setIsSubmittingReview(true);
        router.post(
            route('research.review', proposal.id),
            { action: 'reject', comments: remarks },
            {
                onSuccess: () => closeRejectModal(),
                onFinish: () => setIsSubmittingReview(false),
            }
        );
    }

    return (
        <AuthenticatedLayout header={<AdminPageHeader title="Research Record" />}>
            <Head title={proposal.title} />
            {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}

            <div className="space-y-4">
                {flash?.success && <Alert type="success" showIcon message={flash.success} />}
                {flash?.error && <Alert type="error" showIcon message={flash.error} />}

                <WorkflowProgress status={proposal.status} />

                <EditPermissionRequests requests={pendingEditRequests} proposalId={proposal.id} />

                <ResearchHeader
                    proposal={proposal}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    canShowEditButton={canShowEditButton}
                    showReviewActions={showReviewActions}
                    pdfOpen={pdfOpen}
                    isSubmittingReview={isSubmittingReview}
                    deleteProcessing={deleteForm.processing}
                    onTogglePdf={handleViewPdf}
                    onApprove={submitApprove}
                    onOpenReject={openRejectModal}
                    onDelete={() => deleteForm.delete(route('research.destroy', proposal.id))}
                />

                {pdfOpen && proposal.file_path && (
                    <PdfViewer
                        ref={pdfCardRef}
                        proposalId={proposal.id}
                        onClose={() => setPdfOpen(false)}
                    />
                )}

                <ResearchTimeline researchHistory={researchHistory} />

                {proposal.comments && (
                    <div id="reviewer-comments">
                        <Alert
                            type="warning"
                            showIcon
                            message="Reviewer Comments"
                            description={
                                <div>
                                    <div style={{ whiteSpace: 'pre-line' }}>
                                        {proposal.comments}
                                    </div>
                                    {proposal.reviewer && (
                                        <div style={{ marginTop: 8, color: '#854d0e' }}>
                                            - {proposal.reviewer.name}
                                        </div>
                                    )}
                                </div>
                            }
                        />
                    </div>
                )}

                {role === 'student' && !canEdit && isLockedForEditing && (
                    <StudentLockSection proposal={proposal} editPermission={editPermission} />
                )}

                {showReviewActions && (
                    <Card
                        id="review-decision"
                        className="admin-dashboard-shell"
                        bordered={false}
                        title={REVIEW_TITLE[proposal.status] ?? 'Review Decision'}
                    >
                        <Typography.Text type="secondary">
                            Use the Approve/Reject actions in the header area to review this
                            submission.
                        </Typography.Text>
                    </Card>
                )}

                <RejectModal
                    open={rejectModal.open}
                    title={REJECT_TITLE[proposal.status] ?? 'Reject Submission'}
                    templates={rejectTemplates}
                    templateOptions={remarkTemplateOptions}
                    comments={rejectModal.comments}
                    error={rejectModal.error}
                    loading={isSubmittingReview}
                    onCommentsChange={(value) =>
                        setRejectModal((prev) => ({ ...prev, comments: value, error: '' }))
                    }
                    onSubmit={submitReject}
                    onCancel={closeRejectModal}
                />
            </div>
        </AuthenticatedLayout>
    );
}
