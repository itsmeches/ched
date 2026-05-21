import { Link } from '@inertiajs/react';

export default function MobileNav({ items, user, isActive, onClose }) {
    return (
        <div
            id="mobile-nav-menu"
            className="md:hidden border-t border-slate-200 dark:border-[#1e2d47] bg-slate-50 dark:bg-[#0d1526] py-2"
        >
            <div className="space-y-1">
                {items.map((item) =>
                    item.dropdown ? (
                        <div key="settings-mobile">
                            <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                {item.label}
                            </div>
                            {item.children.map((child) => {
                                const childActive = child.activePatterns?.some((p) =>
                                    route().current(p)
                                );
                                const cls = `block pl-7 pr-4 py-2 text-sm font-medium transition-all duration-200 ${
                                    childActive
                                        ? 'bg-blue-50 dark:bg-[#1a2540] text-blue-900 dark:text-blue-300'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#1a2540] hover:text-slate-900 dark:hover:text-blue-100'
                                }`;
                                return child.isLink ? (
                                    <Link
                                        key={child.href}
                                        href={child.href}
                                        className={cls}
                                        onClick={onClose}
                                    >
                                        {child.label}
                                    </Link>
                                ) : (
                                    <a
                                        key={child.href}
                                        href={child.href}
                                        className={cls}
                                        onClick={onClose}
                                    >
                                        {child.label}
                                    </a>
                                );
                            })}
                        </div>
                    ) : (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive(item)
                                    ? 'bg-blue-50 dark:bg-[#1a2540] text-blue-900 dark:text-blue-300'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#1a2540] hover:text-slate-900 dark:hover:text-blue-100'
                            }`}
                            onClick={onClose}
                        >
                            {item.label}
                        </Link>
                    )
                )}
            </div>
            <div className="border-t border-slate-200 dark:border-[#1e2d47] mt-2 px-4 py-3">
                <p className="text-sm font-semibold leading-none text-slate-900 dark:text-white">
                    {user.name}
                </p>
                <p className="mt-1 text-xs leading-none text-slate-500 dark:text-slate-400 mb-2">
                    {user.email}
                </p>
                <Link
                    href={route('profile.edit')}
                    className="block text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-blue-100 mb-2"
                >
                    Profile Settings
                </Link>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="block w-full text-left text-sm text-red-600 hover:text-red-700 font-medium"
                >
                    Sign Out
                </Link>
            </div>
        </div>
    );
}
