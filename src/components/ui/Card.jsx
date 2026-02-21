export default function Card({ children, className = '' }) {
  return <article className={`card hover-lift p-6 md:p-8 ${className}`}>{children}</article>;
}
