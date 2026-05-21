import { Link } from '@inertiajs/react';
import { Skeleton, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

export default function ResultsList({
    isFiltering,
    cardBg,
    cardBorder,
    hoverCard,
    textSecond,
    textMeta,
    proposals,
    categoryLabelMap,
    formatDisciplineLabel,
    setSearch,
    isLiveFilterEnabled,
    runIndexRequest,
    yearFrom,
    yearTo,
    school,
    institutionId,
    category,
    disciplineCode,
    sort,
}) {
    return (
        <div className="space-y-3">
            {isFiltering ? (
                Array.from({ length: 3 }).map((_, idx) => (
                    <div
                        key={`skeleton-${idx}`}
                        className={`rounded-2xl border px-5 py-4 ${cardBg} ${cardBorder}`}
                    >
                        <Skeleton active paragraph={{ rows: 2 }} title={{ width: '65%' }} />
                    </div>
                ))
            ) : proposals.data.length === 0 ? (
                <div
                    className={`rounded-2xl border px-6 py-16 text-center ${cardBg} ${cardBorder}`}
                >
                    <SearchOutlined
                        className={`block mx-auto mb-3 ${textSecond}`}
                        style={{ fontSize: 40 }}
                    />
                    <p className={textSecond}>No approved papers found for this search.</p>
                </div>
            ) : (
                proposals.data.map((row) => {
                    const rawCategory = row.research_category || row.category;
                    const categoryLabel = rawCategory
                        ? (categoryLabelMap[rawCategory] ?? rawCategory)
                        : null;
                    const disciplineLabel = row.discipline_label
                        ? formatDisciplineLabel(row.discipline_label)
                        : null;
                    const keywordTags = String(row.keywords || '')
                        .split(',')
                        .map((item) => item.trim())
                        .filter((item) => item.length > 0)
                        .slice(0, 5);

                    return (
                        <div
                            key={row.id}
                            className={`rounded-2xl border px-5 py-4 transition-all ${cardBg} ${cardBorder} ${hoverCard} hover:shadow-lg`}
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0 flex-1 space-y-2">
                                    <Link
                                        href={route('research.public.show', row.id)}
                                        className="block text-base font-semibold leading-snug text-[#0b3ea9] hover:text-[#001f66] hover:underline dark:text-blue-300 dark:hover:text-blue-100 dark:hover:underline transition-colors"
                                    >
                                        {row.title}
                                    </Link>

                                    {(categoryLabel || disciplineLabel) && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {categoryLabel && (
                                                <Tag color="geekblue" style={{ margin: 0 }}>
                                                    {categoryLabel}
                                                </Tag>
                                            )}
                                            {disciplineLabel && (
                                                <Tag color="cyan" style={{ margin: 0 }}>
                                                    {disciplineLabel}
                                                </Tag>
                                            )}
                                        </div>
                                    )}

                                    {keywordTags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {keywordTags.map((item) => (
                                                <Tag
                                                    key={`${row.id}-tag-${item}`}
                                                    color="blue"
                                                    style={{ margin: 0, cursor: 'pointer' }}
                                                    onClick={() => {
                                                        setSearch(item);
                                                        isLiveFilterEnabled.current = true;
                                                        runIndexRequest({
                                                            search: item,
                                                            year_from: yearFrom,
                                                            year_to: yearTo,
                                                            school,
                                                            institution_id: institutionId,
                                                            category,
                                                            discipline_code: disciplineCode,
                                                            sort,
                                                            page: 1,
                                                        });
                                                    }}
                                                >
                                                    #{item}
                                                </Tag>
                                            ))}
                                        </div>
                                    )}

                                    <div
                                        className={`flex flex-wrap gap-x-4 gap-y-0.5 text-xs ${textSecond}`}
                                    >
                                        {row.authors && (
                                            <span>
                                                <span className={`font-medium ${textMeta}`}>
                                                    Author:
                                                </span>{' '}
                                                {row.authors}
                                            </span>
                                        )}
                                        {row.school && (
                                            <span>
                                                <span className={`font-medium ${textMeta}`}>
                                                    School:
                                                </span>{' '}
                                                {row.school}
                                            </span>
                                        )}
                                        {row.institution?.name && (
                                            <Link
                                                href={route(
                                                    'research.public.institution',
                                                    row.institution.id
                                                )}
                                                className="font-medium text-[#0b3ea9] hover:text-[#001f66] hover:underline dark:text-blue-300 dark:hover:text-blue-100 dark:hover:underline"
                                            >
                                                {row.institution.name}
                                            </Link>
                                        )}
                                        {row.year && (
                                            <span>
                                                <span className={`font-medium ${textMeta}`}>
                                                    Year:
                                                </span>{' '}
                                                {row.year}
                                            </span>
                                        )}
                                    </div>

                                    {row.abstract_snippet && (
                                        <p
                                            className={`line-clamp-2 text-xs leading-relaxed ${textSecond}`}
                                        >
                                            {row.abstract_snippet}
                                        </p>
                                    )}
                                </div>

                                <div className="flex-shrink-0 sm:pl-4">
                                    <Link href={route('research.public.show', row.id)}>
                                        <button
                                            type="button"
                                            className="rounded-lg bg-[#0033a0] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 active:scale-95"
                                        >
                                            View Paper
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
