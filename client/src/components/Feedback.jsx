import { AlertCircle, LoaderCircle, RefreshCw } from 'lucide-react'
import { Button, LinkButton } from './Button.jsx'
import Card from './Card.jsx'

export function LoadingState({ label = 'Opening the case…' }) {
  return <div role="status" className="flex min-h-56 flex-col items-center justify-center gap-4 text-sm text-[#aaa797]"><LoaderCircle className="animate-spin text-[#c4a36b]" size={25} /><span>{label}</span></div>
}

export function ErrorState({ message, onRetry, linkTo = '/create', linkLabel = 'Start a new case' }) {
  return <Card className="mx-auto max-w-xl p-7 text-center sm:p-10"><AlertCircle className="mx-auto mb-4 text-[#d48b7f]" size={28} /><h2 className="font-serif text-2xl text-[#eee8d9]">We hit a snag</h2><p role="alert" className="mt-2 text-sm leading-6 text-[#aaa797]">{message}</p><div className="mt-6 flex flex-wrap justify-center gap-3">{onRetry && <Button variant="secondary" onClick={onRetry}><RefreshCw size={15} />Try again</Button>}<LinkButton to={linkTo}>{linkLabel}</LinkButton></div></Card>
}

export function InlineError({ children }) {
  if (!children) return null
  return <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg border border-[#bb7169]/25 bg-[#bb7169]/[.08] px-3 py-2.5 text-sm text-[#e4a49a]"><AlertCircle size={16} className="mt-0.5 shrink-0" />{children}</p>
}
