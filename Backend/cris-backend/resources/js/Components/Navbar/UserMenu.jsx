import { Link, router } from '@inertiajs/react';
import { Dropdown as AntDropdown } from 'antd';
import { getRoleLabel } from './useNavItems';

export default function UserMenu({ user }) {
    return (
        <AntDropdown
            trigger={['click']}
            placement="bottomRight"
            dropdownRender={() => (
                <div className="min-w-[200px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-[#1e2d47] dark:bg-[#111827]">
                    <div className="border-b border-slate-200 px-4 py-2 dark:border-[#1e2d47]">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {user.name}
                        </p>
                        <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
                            {user.email}
                        </p>
                        <p className="text-xs font-medium text-[#0033a0] dark:text-blue-300">
                            {getRoleLabel(user.role)}
                        </p>
                    </div>
                    <div className="py-1">
                        <Link
                            href={route('profile.edit')}
                            className="block px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-[#1a2540]"
                        >
                            Profile Settings
                        </Link>
                        <button
                            type="button"
                            className="block w-full px-4 py-2 text-left text-sm text-rose-600 transition-colors hover:bg-slate-50 dark:text-rose-400 dark:hover:bg-[#1a2540]"
                            onClick={() => router.post(route('logout'))}
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        >
            <button
                type="button"
                aria-label="Open user menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm transition-shadow hover:shadow-md"
                style={{
                    background: 'linear-gradient(to bottom right, #0047d4, #0033a0)',
                }}
            >
                {user.name.charAt(0).toUpperCase()}
            </button>
        </AntDropdown>
    );
}
