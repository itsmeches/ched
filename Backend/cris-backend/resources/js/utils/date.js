const DATE_LOCALE = 'en-PH';

const dateFormatter = new Intl.DateTimeFormat(DATE_LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat(DATE_LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
});

export function formatDate(value) {
    if (!value) {
        return '—';
    }

    return dateFormatter.format(new Date(value));
}

export function formatDateTime(value) {
    if (!value) {
        return '—';
    }

    return dateTimeFormatter.format(new Date(value));
}
