// Generate citation strings for an approved research proposal.
// Pure functions — no DOM access — so they're easy to test or reuse.

function splitAuthors(authors) {
    return String(authors || '')
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter(Boolean);
}

export function buildBibtex(proposal) {
    const firstAuthorLast = (splitAuthors(proposal.authors)[0] || 'anon')
        .split(/\s+/)
        .pop()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
    const key = `${firstAuthorLast}${proposal.year || ''}`;
    const lines = [
        `@article{${key},`,
        `  title   = {${proposal.title || ''}},`,
        `  author  = {${splitAuthors(proposal.authors).join(' and ') || 'Anonymous'}},`,
        proposal.year ? `  year    = {${proposal.year}},` : null,
        proposal.institution?.name ? `  institution = {${proposal.institution.name}},` : null,
        proposal.keywords ? `  keywords = {${proposal.keywords}},` : null,
        proposal.abstract ? `  abstract = {${proposal.abstract.replace(/[{}]/g, '')}},` : null,
        `}`,
    ].filter(Boolean);
    return lines.join('\n');
}

export function buildRis(proposal) {
    const lines = ['TY  - JOUR'];
    splitAuthors(proposal.authors).forEach((a) => lines.push(`AU  - ${a}`));
    lines.push(`TI  - ${proposal.title || ''}`);
    if (proposal.year) lines.push(`PY  - ${proposal.year}`);
    if (proposal.institution?.name) lines.push(`PB  - ${proposal.institution.name}`);
    if (proposal.keywords) {
        proposal.keywords.split(/[,;]/).map((k) => k.trim()).filter(Boolean).forEach((kw) => lines.push(`KW  - ${kw}`));
    }
    if (proposal.abstract) lines.push(`AB  - ${proposal.abstract.replace(/\r?\n/g, ' ')}`);
    lines.push('ER  - ');
    return lines.join('\r\n') + '\r\n';
}

export function buildApa(proposal) {
    const authors = splitAuthors(proposal.authors);
    const authorStr = authors.length > 0
        ? authors.map((a) => {
            const parts = a.split(/\s+/);
            const last = parts.pop();
            const initials = parts.map((p) => `${p[0]?.toUpperCase()}.`).join(' ');
            return `${last}, ${initials}`.trim();
        }).join(', ')
        : 'Anonymous';
    const year = proposal.year ? ` (${proposal.year})` : '';
    const inst = proposal.institution?.name ? `. ${proposal.institution.name}` : '';
    return `${authorStr}${year}. ${proposal.title}${inst}.`;
}

export function downloadText(filename, contents, mime = 'text/plain') {
    const blob = new Blob([contents], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
