import { Fingerprint, Menu, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function SiteNav() {
  const [open, setOpen] = useState(false)
  const navClass = ({ isActive }) => `rounded-md px-3 py-2 text-sm transition-colors ${isActive ? 'text-[#d4b77f]' : 'text-[#aaa797] hover:text-[#eee8d9]'}`
  return <header className="relative z-10 border-b border-white/[.08]">
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8" aria-label="Main navigation">
      <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}><span className="flex size-9 items-center justify-center rounded-lg border border-[#c4a36b]/30 bg-[#c4a36b]/[.08] text-[#d4b77f]"><Fingerprint size={19} /></span><span className="text-sm font-semibold tracking-[.16em] text-[#eee8d9]">MYSTERY <span className="text-[#c4a36b]">ROOM</span></span></Link>
      <div className="hidden items-center gap-2 md:flex"><NavLink to="/" end className={navClass}>The room</NavLink><NavLink to="/create" className={navClass}>New case</NavLink><Link to="/create" className="ml-2 inline-flex items-center gap-2 rounded-lg bg-[#c4a36b] px-4 py-2.5 text-sm font-semibold text-[#171813] transition hover:bg-[#d4b77f]"><Plus size={16} />Begin investigation</Link></div>
      <button type="button" className="flex size-10 items-center justify-center rounded-lg border border-white/10 text-[#eee8d9] md:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <X size={19} /> : <Menu size={19} />}</button>
    </nav>
    {open && <div className="absolute inset-x-0 top-full border-b border-white/10 bg-[#1d201b] px-5 py-3 shadow-xl md:hidden"><NavLink to="/" end onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-sm text-[#c5c0af]">The room</NavLink><NavLink to="/create" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-sm text-[#c5c0af]">New case</NavLink></div>}
  </header>
}
