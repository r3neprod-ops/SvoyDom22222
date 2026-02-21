const variants = {
  primary: 'button-base button-primary',
  secondary: 'button-base button-secondary',
  ghost: 'button-base button-ghost',
};

export default function Button({ as: Comp = 'button', variant = 'primary', className = '', ...props }) {
  return <Comp className={`${variants[variant] || variants.primary} ${className}`} {...props} />;
}
