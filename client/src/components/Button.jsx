import { LoaderCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const styles = {
  primary: 'bg-[#c4a36b] text-[#171813] hover:bg-[#d4b77f]',
  secondary: 'border border-white/15 bg-white/[.04] text-[#eee8d9] hover:border-[#c4a36b]/60 hover:bg-white/[.07]',
  quiet: 'text-[#c9c4b4] hover:bg-white/[.06] hover:text-[#eee8d9]',
  danger: 'border border-[#bb7169]/50 bg-[#bb7169]/10 text-[#e8aaa1] hover:bg-[#bb7169]/20',
}

export function Button({ children, variant = 'primary', loading = false, disabled = false, className = '', ...props }) {
  return <button className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`} disabled={disabled || loading} {...props}>
    {loading && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}{children}
  </button>
}

export function LinkButton({ to, children, variant = 'primary', className = '', ...props }) {
  return <Link to={to} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${styles[variant]} ${className}`} {...props}>{children}</Link>
}
