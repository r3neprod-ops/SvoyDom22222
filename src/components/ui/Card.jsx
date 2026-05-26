export default function Card({ children, className = '', ...props }) {
  return <article className={`card hover-lift p-6 md:p-8 ${className}`} {...props}>{children}</article>;
}
