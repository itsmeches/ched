export type ReviewStage = 'under_review_faculty' | 'under_review_hei' | 'under_review_ched';

const TEMPLATES: Record<ReviewStage, string[]> = {
    under_review_faculty: [
        'Faculty review: Please strengthen the problem statement, objectives, and alignment between methods and findings.',
        'Faculty review: Please revise the formatting, clarify the abstract, and ensure the references are complete and consistent.',
        'Faculty review: Please improve the methodology section and explain the sampling, instruments, and analysis more clearly.',
    ],
    under_review_hei: [
        'HEI review: Please address institutional formatting requirements and clarify the research scope before resubmission.',
        'HEI review: Please revise the manuscript to improve academic quality, citation consistency, and internal section alignment.',
        'HEI review: Please update the submission based on institutional review comments and resubmit with complete revisions.',
    ],
    under_review_ched: [
        'CHED final review: Please revise and resubmit with required corrections.',
        'CHED final review: Please strengthen the policy relevance, research clarity, and overall compliance before resubmission.',
        'CHED final review: Please address the noted deficiencies in structure, supporting detail, and final presentation, then resubmit.',
    ],
};

export function getReviewRemarkTemplates(stage: string | null | undefined): string[] {
    if (stage && stage in TEMPLATES) {
        return TEMPLATES[stage as ReviewStage];
    }
    return TEMPLATES.under_review_ched;
}
