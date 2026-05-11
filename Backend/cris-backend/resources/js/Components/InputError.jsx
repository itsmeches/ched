export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p
            {...props}
            role="alert"
            className={'mt-1 text-sm font-medium text-red-600 dark:text-red-400 ' + className}
        >
            {message}
        </p>
    ) : null;
}
