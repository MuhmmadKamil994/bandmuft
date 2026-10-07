// Locked button component — rang hamesha globals.css se. Props se rang mat badlo.
export default function Button({ variant = 'primary', size, block, className = '', ...props }) {
  const v = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
  }[variant] || 'btn-primary';
  const s = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  return (
    <button className={`${v} ${s} ${block ? 'btn-block' : ''} ${className}`} {...props} />
  );
}
