export function getReviewRemarkTemplates(stage) {
    const templates = {
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

    return templates[stage] ?? templates.under_review_ched;
}