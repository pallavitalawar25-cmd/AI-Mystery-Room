import { Outlet } from 'react-router-dom'
import SiteNav from './SiteNav.jsx'

export default function AppLayout() {
  return <div className="min-h-screen overflow-hidden bg-[#151713] text-[#eee8d9]"><div className="room-glow pointer-events-none fixed inset-0" aria-hidden="true" /><SiteNav /><main className="relative mx-auto min-h-[calc(100vh-130px)] w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14"><Outlet /></main><footer className="relative border-t border-white/[.08]"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs tracking-wide text-[#77786e] sm:flex-row sm:items-center sm:justify-between sm:px-8"><span>AI MYSTERY ROOM · A case is only as strong as its evidence.</span><span>Think carefully. Accusations are final.</span></div></footer></div>
}
