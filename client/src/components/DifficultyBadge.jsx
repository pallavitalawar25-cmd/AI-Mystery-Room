export default function DifficultyBadge({ difficulty }) {
  const color = { Easy: 'text-[#9fb18e] border-[#9fb18e]/25 bg-[#9fb18e]/[.08]', Medium: 'text-[#d3b67e] border-[#d3b67e]/25 bg-[#d3b67e]/[.08]', Hard: 'text-[#d38e83] border-[#d38e83]/25 bg-[#d38e83]/[.08]' }[difficulty] || 'text-[#c9c4b4] border-white/10 bg-white/[.04]'
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[.16em] ${color}`}>{difficulty}</span>
}
