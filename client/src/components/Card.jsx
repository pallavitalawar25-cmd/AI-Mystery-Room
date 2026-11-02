export default function Card({ children, className = '', ...props }) {
  return <section className={`rounded-2xl border border-white/[.09] bg-[#1d201b] ${className}`} {...props}>{children}</section>
}
