import { Link } from '@inertiajs/react';
import { Dropdown as AntDropdown } from 'antd';

export default function DesktopNav({ items, isActive }) {
    return (
        <div className="hidden md:flex items-center gap-1">
            {items.map((item) =>
                item.dropdown ? (
                    <AntDropdown
                        key="settings-dropdown"
                        trigger={['click']}
                        placement="bottomLeft"
                        dropdownRender={() => (
                            <div className="min-w-[192px] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-[#1e2d47] dark:bg-[#111827]">
                                {item.children.map((child) => {
                                    const childActive = child.activePatterns?.some((p) =>
                                        route().current(p)
                                    );
                                    return (
                                        <Link
                                            key={child.href}
                                            href={child.href}
                                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                                                childActive
                                                    ? 'bg-blue-50 text-blue-900 dark:bg-[#1a2540] dark:text-blue-300'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[#1a2540] dark:hover:text-blue-100'
                                            }`}
                                        >
                                            {child.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    >
                        <button
                            type="button"
                            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive(item)
                                    ? 'bg-blue-50 dark:bg-[#1a2540] text-blue-900 dark:text-blue-300 border-b-2'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a2540] hover:text-slate-900 dark:hover:text-blue-100'
                            }`}
                            style={isActive(item) ? { borderColor: '#0033a0' } : {}}
                        >
                            {item.label}
                            <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>
                    </AntDropdown>
                ) : (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isActive(item)
                                ? 'bg-blue-50 dark:bg-[#1a2540] text-blue-900 dark:text-blue-300 border-b-2'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a2540] hover:text-slate-900 dark:hover:text-blue-100'
                        }`}
                        style={isActive(item) ? { borderColor: '#0033a0' } : {}}
                    >
                        {item.label}
                    </Link>
                )
            )}
        </div>
    );
}
