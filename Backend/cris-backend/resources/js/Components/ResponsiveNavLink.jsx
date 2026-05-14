import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700 focus:border-indigo-700 focus:bg-indigo-100 focus:text-indigo-800 dark:border-blue-400 dark:bg-[#1a2540] dark:text-blue-300 dark:focus:border-blue-300 dark:focus:bg-[#243054] dark:focus:text-blue-200'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:border-gray-300 focus:bg-gray-50 focus:text-gray-800 dark:text-slate-300 dark:hover:border-[#2a3a5c] dark:hover:bg-[#1a2540] dark:hover:text-blue-100 dark:focus:border-[#2a3a5c] dark:focus:bg-[#1a2540] dark:focus:text-blue-100'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
