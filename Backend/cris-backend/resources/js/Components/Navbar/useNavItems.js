export function useNavItems(user) {
    const commonItems = [
        {
            label: 'Dashboard',
            href: route('dashboard'),
            activePatterns: [
                'dashboard',
                'admin.dashboard',
                'ched.dashboard',
                'hei.dashboard',
                'faculty.dashboard',
                'student.dashboard',
            ],
        },
    ];

    if (user.role === 'super_admin') {
        return [
            ...commonItems,
            {
                label: 'User Management',
                href: route('admin.users.index'),
                activePatterns: ['admin.users.*'],
            },
            {
                label: 'Settings',
                dropdown: true,
                activePatterns: ['admin.institutions.*', 'admin.keywords.*', 'admin.taxonomy.*'],
                children: [
                    {
                        label: 'Institutions',
                        href: route('admin.institutions.index'),
                        activePatterns: ['admin.institutions.*'],
                        isLink: true,
                    },
                    {
                        label: 'Keywords',
                        href: route('admin.keywords.index'),
                        activePatterns: ['admin.keywords.*'],
                        isLink: true,
                    },
                    {
                        label: 'Categories',
                        href: route('admin.taxonomy.categories.index'),
                        activePatterns: ['admin.taxonomy.categories.*'],
                        isLink: true,
                    },
                    {
                        label: 'Disciplines',
                        href: route('admin.taxonomy.disciplines.index'),
                        activePatterns: ['admin.taxonomy.disciplines.*'],
                        isLink: true,
                    },
                ],
            },
            {
                label: 'History',
                href: route('history.index'),
                activePatterns: ['history.index'],
            },
        ];
    }

    if (user.role === 'ched') {
        return [
            ...commonItems,
            {
                label: 'Create HEI',
                href: route('accounts.create'),
                activePatterns: ['accounts.create'],
            },
            {
                label: 'Account Hierarchy',
                href: route('accounts.hierarchy'),
                activePatterns: ['accounts.hierarchy'],
            },
            {
                label: 'Research Queue',
                href: route('research.index'),
                activePatterns: [
                    'research.index',
                    'research.show',
                    'research.file',
                    'research.edit',
                    'research.update',
                    'research.destroy',
                ],
            },
            {
                label: 'My Decisions',
                href: route('ched.decisions'),
                activePatterns: ['ched.decisions'],
            },
            {
                label: 'History',
                href: route('history.index'),
                activePatterns: ['history.index'],
            },
        ];
    }

    if (['hei', 'faculty', 'student'].includes(user.role)) {
        const accountItem =
            user.role === 'hei'
                ? {
                      label: 'Create Faculty',
                      href: route('accounts.create'),
                      activePatterns: ['accounts.create'],
                  }
                : user.role === 'faculty'
                  ? {
                        label: 'Create Student',
                        href: route('accounts.create'),
                        activePatterns: ['accounts.create'],
                    }
                  : null;

        const hierarchyItem = ['hei', 'faculty'].includes(user.role)
            ? {
                  label: 'Account Hierarchy',
                  href: route('accounts.hierarchy'),
                  activePatterns: ['accounts.hierarchy'],
              }
            : null;

        const reviewItem =
            user.role === 'student'
                ? null
                : {
                      label: 'Review Queue',
                      href: route('research.index', { tab: 'queue' }),
                      activePatterns: ['research.index', 'research.review'],
                      tab: 'queue',
                  };

        return [
            ...commonItems,
            ...(accountItem ? [accountItem] : []),
            ...(hierarchyItem ? [hierarchyItem] : []),
            ...(reviewItem ? [reviewItem] : []),
            {
                label: 'My Research',
                href: route('research.index', { tab: 'mine' }),
                activePatterns: [
                    'research.index',
                    'research.show',
                    'research.edit',
                    'research.update',
                    'research.destroy',
                ],
                tab: 'mine',
            },
            ...(user.role === 'student'
                ? [
                      {
                          label: 'Submit Paper',
                          href: route('research.create'),
                          activePatterns: ['research.create', 'research.store'],
                      },
                  ]
                : []),
            {
                label: 'History',
                href: route('history.index'),
                activePatterns: ['history.index'],
            },
        ];
    }

    return commonItems;
}

export function getRoleLabel(role) {
    switch (role) {
        case 'super_admin':
            return 'Admin';
        case 'ched':
            return 'CHED Reviewer';
        case 'hei':
            return 'HEI Researcher';
        case 'faculty':
            return 'Faculty';
        case 'student':
            return 'Student';
        default:
            return 'User';
    }
}
