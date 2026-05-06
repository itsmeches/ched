import { Link, usePage } from '@inertiajs/react';
import {
    AppstoreOutlined,
    ApartmentOutlined,
    AuditOutlined,
    BarChartOutlined,
    BookOutlined,
    FileDoneOutlined,
    FolderOpenOutlined,
    HistoryOutlined,
    NodeIndexOutlined,
    TeamOutlined,
    UserAddOutlined,
    ClusterOutlined,
} from '@ant-design/icons';

function getNavGroupsByRole(userRole) {
    const common = [
        {
            key: 'dashboard',
            label: 'Dashboard',
            href: route('dashboard'),
            icon: AppstoreOutlined,
            activePatterns: ['dashboard', 'admin.dashboard', 'ched.dashboard', 'hei.dashboard', 'faculty.dashboard', 'student.dashboard'],
        },
    ];

    if (userRole === 'super_admin') {
        return [
            {
                key: 'main',
                items: [
                    ...common,
                    {
                        key: 'users',
                        label: 'User Management',
                        href: route('admin.users.index'),
                        icon: TeamOutlined,
                        activePatterns: ['admin.users.*'],
                    },
                    {
                        key: 'institutions',
                        label: 'Institutions',
                        href: route('admin.institutions.index'),
                        icon: ApartmentOutlined,
                        activePatterns: ['admin.institutions.*'],
                    },
                    {
                        key: 'keywords',
                        label: 'Keywords',
                        href: route('admin.keywords.index'),
                        icon: AuditOutlined,
                        activePatterns: ['admin.keywords.*'],
                    },
                    {
                        key: 'categories',
                        label: 'Categories',
                        href: route('admin.taxonomy.categories.index'),
                        icon: ClusterOutlined,
                        activePatterns: ['admin.taxonomy.categories.*'],
                    },
                    {
                        key: 'disciplines',
                        label: 'Disciplines',
                        href: route('admin.taxonomy.disciplines.index'),
                        icon: NodeIndexOutlined,
                        activePatterns: ['admin.taxonomy.disciplines.*'],
                    },
                    {
                        key: 'history',
                        label: 'History',
                        href: route('history.index'),
                        icon: HistoryOutlined,
                        activePatterns: ['history.index'],
                    },
                ],
            },
        ];
    }

    if (userRole === 'ched') {
        return [
            {
                key: 'main',
                items: [
                    ...common,
                    {
                        key: 'create-hei',
                        label: 'Create HEI',
                        href: route('accounts.create'),
                        icon: UserAddOutlined,
                        activePatterns: ['accounts.create'],
                    },
                    {
                        key: 'hierarchy',
                        label: 'Account Hierarchy',
                        href: route('accounts.hierarchy'),
                        icon: NodeIndexOutlined,
                        activePatterns: ['accounts.hierarchy'],
                    },
                    {
                        key: 'approvals',
                        label: 'Approvals',
                        href: route('research.index'),
                        icon: FileDoneOutlined,
                        activePatterns: ['research.index', 'research.show', 'research.file', 'research.edit', 'research.update', 'research.destroy'],
                    },
                    {
                        key: 'analytics',
                        label: 'Analytics',
                        href: route('ched.decisions'),
                        icon: BarChartOutlined,
                        activePatterns: ['ched.decisions'],
                    },
                    {
                        key: 'history',
                        label: 'History',
                        href: route('history.index'),
                        icon: HistoryOutlined,
                        activePatterns: ['history.index'],
                    },
                ],
            },
        ];
    }

    if (userRole === 'hei') {
        return [
            {
                key: 'main',
                items: [
                    ...common,
                    {
                        key: 'faculty-management',
                        label: 'Faculty Management',
                        href: route('accounts.create'),
                        icon: TeamOutlined,
                        activePatterns: ['accounts.create'],
                    },
                    {
                        key: 'hierarchy',
                        label: 'Account Hierarchy',
                        href: route('accounts.hierarchy'),
                        icon: NodeIndexOutlined,
                        activePatterns: ['accounts.hierarchy'],
                    },
                    {
                        key: 'reports',
                        label: 'Reports',
                        href: route('research.index', { tab: 'queue' }),
                        icon: BarChartOutlined,
                        activePatterns: ['research.index', 'research.review'],
                        tab: 'queue',
                    },
                    {
                        key: 'my-research',
                        label: 'My Research',
                        href: route('research.index', { tab: 'mine' }),
                        icon: BookOutlined,
                        activePatterns: ['research.index', 'research.show', 'research.edit', 'research.update', 'research.destroy'],
                        tab: 'mine',
                    },
                    {
                        key: 'history',
                        label: 'History',
                        href: route('history.index'),
                        icon: HistoryOutlined,
                        activePatterns: ['history.index'],
                    },
                ],
            },
        ];
    }

    if (userRole === 'faculty') {
        return [
            {
                key: 'main',
                items: [
                    ...common,
                    {
                        key: 'create-student',
                        label: 'Create Student',
                        href: route('accounts.create'),
                        icon: UserAddOutlined,
                        activePatterns: ['accounts.create'],
                    },
                    {
                        key: 'hierarchy',
                        label: 'Account Hierarchy',
                        href: route('accounts.hierarchy'),
                        icon: NodeIndexOutlined,
                        activePatterns: ['accounts.hierarchy'],
                    },
                    {
                        key: 'student-submissions',
                        label: 'Student Submissions',
                        href: route('research.index', { tab: 'queue' }),
                        icon: FolderOpenOutlined,
                        activePatterns: ['research.index', 'research.review'],
                        tab: 'queue',
                    },
                    {
                        key: 'my-research',
                        label: 'My Research',
                        href: route('research.index', { tab: 'mine' }),
                        icon: BookOutlined,
                        activePatterns: ['research.index', 'research.show', 'research.edit', 'research.update', 'research.destroy'],
                        tab: 'mine',
                    },
                    {
                        key: 'history',
                        label: 'History',
                        href: route('history.index'),
                        icon: HistoryOutlined,
                        activePatterns: ['history.index'],
                    },
                ],
            },
        ];
    }

    if (userRole === 'student') {
        return [
            {
                key: 'main',
                items: [
                    ...common,
                    {
                        key: 'my-research',
                        label: 'My Research',
                        href: route('research.index', { tab: 'mine' }),
                        icon: BookOutlined,
                        activePatterns: ['research.index', 'research.show', 'research.edit', 'research.update', 'research.destroy'],
                        tab: 'mine',
                    },
                    {
                        key: 'submit-research',
                        label: 'Submit Research',
                        href: route('research.create'),
                        icon: FileDoneOutlined,
                        activePatterns: ['research.create', 'research.store'],
                    },
                    {
                        key: 'history',
                        label: 'History',
                        href: route('history.index'),
                        icon: HistoryOutlined,
                        activePatterns: ['history.index'],
                    },
                ],
            },
        ];
    }

    return [{ key: 'main', items: common }];
}

export default function Sidebar({ collapsed = false, mobileOpen = false, onCloseMobile }) {
    const page = usePage();
    const { auth } = page.props;
    const user = auth?.user;
    const currentTab = new URLSearchParams((page.url || '').split('?')[1] || '').get('tab');
    const navGroups = getNavGroupsByRole(user?.role);

    const isActive = (item) => {
        if (item.tab && route().current('research.index')) {
            return currentTab === item.tab;
        }

        return item.activePatterns?.some((pattern) => route().current(pattern));
    };

    return (
        <>
            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={onCloseMobile}
                    className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-[2px] lg:hidden"
                />
            )}

            <aside
                className={`sidebar-shell fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col overflow-hidden border-r border-blue-900/40 bg-gradient-to-b from-[#02153a] via-[#042a6a] to-[#02153a] text-white transition-transform duration-300 lg:static lg:z-30 lg:translate-x-0 ${
                    collapsed ? 'lg:w-20' : 'lg:w-72'
                } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="pointer-events-none absolute -top-14 left-8 h-40 w-40 rounded-full bg-cyan-300/15 blur-3xl" />
                <div className="pointer-events-none absolute bottom-8 right-0 h-36 w-36 rounded-full bg-blue-300/15 blur-3xl" />

                <div className={`relative border-b border-blue-800/50 ${collapsed ? 'h-[76px] px-2 py-2' : 'h-[76px] px-4 py-2'}`}>
                    {collapsed ? (
                        <div className="hidden h-full items-center justify-center lg:flex">
                            <Link href={route('dashboard')} className="inline-flex" onClick={onCloseMobile}>
                                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
                                    <img src="/cris-mark.svg" alt="CRIS" className="h-5.5 w-5.5" />
                                </span>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex h-full items-center gap-2">
                            <Link href={route('dashboard')} className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden" onClick={onCloseMobile}>
                                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
                                    <img src="/cris-mark.svg" alt="CRIS" className="h-6 w-6" />
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate text-[15px] font-semibold leading-[1.03] tracking-wide text-white">CRIS Workspace</p>
                                    <p className="-mt-0.5 truncate text-[10.5px] leading-[1.02] text-blue-100/85">Research Management</p>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>

                <div className="sidebar-scroll relative flex-1 overflow-y-auto px-3 py-4">
                    {!collapsed && <p className="mb-2 px-2 text-[11px] uppercase tracking-[0.14em] text-blue-100/65">Navigation</p>}

                    {navGroups.map((group) => (
                        <div key={group.key} className="space-y-1.5">
                            {group.items.map((item) => {
                                const Icon = item.icon || AppstoreOutlined;
                                const active = isActive(item);

                                return (
                                    <Link
                                        key={item.key}
                                        href={item.href}
                                        onClick={onCloseMobile}
                                        title={collapsed ? item.label : undefined}
                                        className={`group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                            active
                                                ? 'bg-white/14 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)]'
                                                : 'text-blue-100/90 hover:-translate-y-[1px] hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <span
                                            className={`absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-cyan-300 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                                active ? 'opacity-100' : 'opacity-0'
                                            }`}
                                        />
                                        <span
                                            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                                active
                                                    ? 'bg-white/18 text-cyan-100 ring-white/30'
                                                    : 'bg-white/8 text-blue-100 ring-white/15 group-hover:bg-white/15 group-hover:scale-105'
                                            }`}
                                        >
                                            <Icon className="text-[15px]" />
                                        </span>
                                        {!collapsed && <span className="truncate">{item.label}</span>}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {!collapsed && user && (
                    <div className="relative border-t border-blue-800/50 px-4 py-3">
                        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-blue-100/80 backdrop-blur-sm">
                            <p className="truncate text-sm font-semibold leading-tight text-white">{user.name}</p>
                            <p className="truncate text-xs leading-tight">{user.email}</p>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}
