import { Transition } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { createContext, useContext, useEffect, useState } from 'react';

const DropDownContext = createContext();

const Dropdown = ({ children }) => {
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="relative">{children}</div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }) => {
    const { open, setOpen, toggleOpen } = useContext(DropDownContext);

    return (
        <>
            <button
                type="button"
                onClick={toggleOpen}
                aria-haspopup="menu"
                aria-expanded={open}
                className="cursor-pointer bg-transparent p-0"
            >
                {children}
            </button>

            {open && (
                <div
                    aria-hidden="true"
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                ></div>
            )}
        </>
    );
};

const Content = ({
    align = 'right',
    width = '48',
    contentClasses = 'py-1 bg-white dark:bg-[#111827]',
    children,
}) => {
    const { open, setOpen } = useContext(DropDownContext);

    let alignmentClasses = 'origin-top';

    if (align === 'left') {
        alignmentClasses = 'ltr:origin-top-left rtl:origin-top-right start-0';
    } else if (align === 'right') {
        alignmentClasses = 'ltr:origin-top-right rtl:origin-top-left end-0';
    }

    let widthClasses = '';

    if (width === '48') {
        widthClasses = 'w-48';
    }

    return (
        <>
            <Transition
                show={open}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div
                    className={`absolute z-50 mt-2 rounded-md shadow-lg ${alignmentClasses} ${widthClasses}`}
                    role="menu"
                    tabIndex={-1}
                    onClick={() => setOpen(false)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') setOpen(false);
                    }}
                >
                    <div
                        className={
                            `rounded-md ring-1 ring-black ring-opacity-5 dark:ring-[#1e2d47] ` +
                            contentClasses
                        }
                    >
                        {children}
                    </div>
                </div>
            </Transition>
        </>
    );
};

const DropdownLink = ({ className = '', children, ...props }) => {
    return (
        <Link
            {...props}
            className={
                'block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 dark:text-slate-300 transition duration-150 ease-in-out hover:bg-gray-100 dark:hover:bg-[#1a2540] focus:bg-gray-100 dark:focus:bg-[#1a2540] focus:outline-none ' +
                className
            }
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
