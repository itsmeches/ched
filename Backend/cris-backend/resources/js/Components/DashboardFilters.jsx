import { router, usePage } from '@inertiajs/react';
import { Button, Card, Select, Space, Tag, Typography } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';

const STATUS_OPTIONS = [
    { value: '', label: 'All statuses' },
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
    { value: 'rejected', label: 'Rejected' },
];

const EMPTY_FILTERS = {
    year: '',
    hei_id: '',
    discipline_code: '',
    status: '',
};

const DEBOUNCE_MS = 500;

function cleanFilterPayload(values) {
    return Object.fromEntries(
        Object.entries(values).filter(([, value]) => value !== '' && value !== null && value !== undefined),
    );
}

function normalizeFilters(values = {}) {
    return {
        year: values.year ? String(values.year) : '',
        hei_id: values.hei_id ? String(values.hei_id) : '',
        discipline_code: values.discipline_code ? String(values.discipline_code) : '',
        status: values.status ? String(values.status) : '',
    };
}

export default function DashboardFilters({
    routeName,
    filters = {},
    years = [],
    institutions = [],
    disciplines = [],
}) {
    const { auth } = usePage().props;
    const userRole = auth?.user?.role;
    const isSyncingFromServer = useRef(false);

    const [localFilters, setLocalFilters] = useState(() => normalizeFilters({ ...EMPTY_FILTERS, ...filters }));

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const nextFromServer = normalizeFilters({
            year: params.get('year') ?? filters.year ?? '',
            hei_id: params.get('hei_id') ?? filters.hei_id ?? '',
            discipline_code: params.get('discipline_code') ?? filters.discipline_code ?? '',
            status: params.get('status') ?? filters.status ?? '',
        });

        isSyncingFromServer.current = true;
        setLocalFilters(nextFromServer);
    }, [filters.year, filters.hei_id, filters.discipline_code, filters.status]);

    const showInstitutionFilter = userRole === 'super_admin' || userRole === 'ched' || userRole === 'faculty';

    const yearOptions = useMemo(() => [
        { value: '', label: 'All years' },
        ...years.map((year) => ({ value: String(year), label: String(year) })),
    ], [years]);

    const institutionOptions = useMemo(() => [
        { value: '', label: 'All institutions' },
        ...institutions.map((item) => ({
            value: String(item.id),
            label: item.code ? `${item.code} - ${item.name}` : item.name,
        })),
    ], [institutions]);

    const disciplineOptions = useMemo(() => [
        { value: '', label: 'All disciplines' },
        ...disciplines.map((item) => ({
            value: item.code,
            label: `${item.code} - ${item.name}`,
        })),
    ], [disciplines]);

    const serverPayloadSignature = useMemo(() => {
        const fromServer = normalizeFilters(filters);
        return JSON.stringify(cleanFilterPayload(fromServer));
    }, [filters]);

    function submit(nextState) {
        router.get(route(routeName), cleanFilterPayload(nextState), {
            preserveState: true,
            replace: true,
        });
    }

    useEffect(() => {
        if (isSyncingFromServer.current) {
            isSyncingFromServer.current = false;
            return;
        }

        const localPayloadSignature = JSON.stringify(cleanFilterPayload(localFilters));
        if (localPayloadSignature === serverPayloadSignature) {
            return;
        }

        const timerId = setTimeout(() => {
            submit(localFilters);
        }, DEBOUNCE_MS);

        return () => clearTimeout(timerId);
    }, [localFilters, routeName, serverPayloadSignature]);

    function updateFilter(key, value) {
        setLocalFilters((prev) => ({
            ...prev,
            [key]: value ?? '',
        }));
    }

    function resetFilters() {
        setLocalFilters(EMPTY_FILTERS);
        submit(EMPTY_FILTERS);
    }

    const activeFilterChips = useMemo(() => {
        const chips = [];

        if (localFilters.year) {
            chips.push({ key: 'year', label: `Year: ${localFilters.year}` });
        }

        if (showInstitutionFilter && localFilters.hei_id) {
            const institution = institutionOptions.find((item) => item.value === localFilters.hei_id);
            chips.push({ key: 'hei_id', label: `Institution: ${institution?.label ?? localFilters.hei_id}` });
        }

        if (localFilters.discipline_code) {
            const discipline = disciplineOptions.find((item) => item.value === localFilters.discipline_code);
            chips.push({ key: 'discipline_code', label: `Discipline: ${discipline?.label ?? localFilters.discipline_code}` });
        }

        if (localFilters.status) {
            const status = STATUS_OPTIONS.find((item) => item.value === localFilters.status);
            chips.push({ key: 'status', label: `Status: ${status?.label ?? localFilters.status}` });
        }

        return chips;
    }, [disciplineOptions, institutionOptions, localFilters, showInstitutionFilter]);

    return (
        <Card className="admin-dashboard-shell dashboard-filters-shell" bordered={false}>
            <Space direction="vertical" size={14} style={{ width: '100%' }}>
                <div className="dashboard-filters-header">
                    <Typography.Title level={5} style={{ margin: 0 }}>
                        Dashboard Filters
                    </Typography.Title>
                    <Typography.Text type="secondary">
                        Refine charts and tables by year, institution, discipline, and status.
                    </Typography.Text>
                </div>

                <div className="dashboard-filter-toolbar">
                <Select
                    size="middle"
                    className="dashboard-filter-control dashboard-filter-year"
                    value={localFilters.year || ''}
                    options={yearOptions}
                    onChange={(value) => updateFilter('year', value)}
                    aria-label="Filter dashboard by year"
                />

                {showInstitutionFilter && (
                    <Select
                        size="middle"
                        className="dashboard-filter-control dashboard-filter-institution"
                        value={localFilters.hei_id || ''}
                        options={institutionOptions}
                        onChange={(value) => updateFilter('hei_id', value)}
                        aria-label="Filter dashboard by institution"
                        showSearch
                        optionFilterProp="label"
                    />
                )}

                <Select
                    size="middle"
                    className="dashboard-filter-control dashboard-filter-discipline"
                    value={localFilters.discipline_code || ''}
                    options={disciplineOptions}
                    onChange={(value) => updateFilter('discipline_code', value)}
                    aria-label="Filter dashboard by discipline"
                    showSearch
                    optionFilterProp="label"
                />

                <Select
                    size="middle"
                    className="dashboard-filter-control dashboard-filter-status"
                    value={localFilters.status || ''}
                    options={STATUS_OPTIONS}
                    onChange={(value) => updateFilter('status', value)}
                    aria-label="Filter dashboard by status"
                />

                    <Button className="dashboard-filter-reset" onClick={resetFilters}>Reset</Button>
                </div>

                {activeFilterChips.length > 0 && (
                    <div className="dashboard-filter-chips">
                        {activeFilterChips.map((chip) => (
                            <Tag
                                key={chip.key}
                                closable
                                onClose={(event) => {
                                    event.preventDefault();
                                    updateFilter(chip.key, '');
                                }}
                            >
                                {chip.label}
                            </Tag>
                        ))}
                    </div>
                )}
            </Space>
        </Card>
    );
}
