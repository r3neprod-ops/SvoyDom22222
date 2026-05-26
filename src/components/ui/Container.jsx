export default function Container({ children, className = '' }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-10 ${className}`}>{children}</div>;
}
