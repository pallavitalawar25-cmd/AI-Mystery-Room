import { ArrowRight, BadgeCheck, BadgeX, RotateCcw, Scale } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Card from '../components/Card.jsx'
import { LinkButton } from '../components/Button.jsx'
import { ErrorState, LoadingState } from '../components/Feedback.jsx'
import { getApiErrorMessage, getResult } from '../services/api.js'

export default function ResultPage() {
  const { id } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setResult(await getResult(id)) }
    catch (requestError) { setError(getApiErrorMessage(requestError, 'The result could not be loaded.')) }
    finally { setLoading(false) }
  }, [id])
  useEffect(() => { load() }, [load])

  if (loading) return <LoadingState label="Unsealing the result…" />
  if (error || !result) {
    const isNotFinished = error.toLowerCase().includes('final accusation') || error.toLowerCase().includes('completed')
    return <ErrorState message={error || 'The result is unavailable.'} onRetry={load} linkTo={isNotFinished ? `/case/${encodeURIComponent(id)}` : '/create'} linkLabel={isNotFinished ? 'Return to the case' : 'Start a new case'} />
  }
  const correct = result.verdict === 'correct'
  const score = result.score || {}
  return <div className="mx-auto max-w-4xl"><div className="relative mb-6 overflow-hidden rounded-3xl border border-[#c4a36b]/25 bg-[#1d201b] p-7 text-center sm:p-12"><div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c4a36b]/70 to-transparent"/><div className={`mx-auto flex size-14 items-center justify-center rounded-full border ${correct ? 'border-[#9fb18e]/30 bg-[#9fb18e]/[.08] text-[#b5c8a2]' : 'border-[#bb7169]/30 bg-[#bb7169]/[.08] text-[#db958a]'}`}>{correct ? <BadgeCheck size={27}/> : <BadgeX size={27}/>}</div><p className="mt-5 text-[10px] font-bold uppercase tracking-[.23em] text-[#c4a36b]">Case closed</p><h1 className="mt-2 font-serif text-4xl text-[#f0eadc] sm:text-5xl">{correct ? 'Your reasoning held.' : 'The evidence had another story.'}</h1><p className="mt-3 text-sm text-[#aaa797]">{correct ? 'You identified the person behind the case.' : 'Your accusation was not the culprit.'}</p><div className="mx-auto mt-8 max-w-md border-y border-white/[.08] py-5"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#858477]">The culprit</p><p className="mt-1 font-serif text-3xl text-[#d4b77f]">{result.culprit?.name || 'Unknown'}</p></div><p className="mt-7 text-[10px] font-bold uppercase tracking-[.18em] text-[#858477]">Final score</p><p className="mt-1 font-serif text-5xl text-[#eee8d9]">{score.finalScore ?? 0}<span className="ml-2 font-sans text-sm text-[#8e8c80]">points</span></p></div>
    <div className="grid gap-5 md:grid-cols-[1.3fr_.7fr]"><Card className="p-6 sm:p-7"><h2 className="flex items-center gap-2 font-serif text-2xl text-[#eee8d9]"><Scale size={18} className="text-[#c4a36b]"/>What happened</h2><p className="mt-4 text-sm leading-7 text-[#b2ae9f]">{result.explanation}</p><div className="mt-5 border-t border-white/[.08] pt-4"><p className="text-[10px] font-bold uppercase tracking-[.17em] text-[#c4a36b]">How the evidence fits</p><p className="mt-2 text-sm leading-7 text-[#999687]">{result.reasoning}</p></div></Card><Card className="p-6"><h2 className="font-serif text-xl text-[#eee8d9]">Score breakdown</h2><div className="mt-5 space-y-4 text-sm"><div className="flex justify-between gap-3 text-[#aaa797]"><span>Correct accusation base</span><span className="text-[#d8d1c3]">{score.basePoints ?? 0}</span></div><div className="flex justify-between gap-3 text-[#aaa797]"><span>Clue points</span><span className="text-[#b5c8a2]">+{score.cluePoints ?? 0}</span></div><div className="flex justify-between gap-3 text-[#aaa797]"><span>Hint penalties</span><span className="text-[#db958a]">−{score.hintPenalty ?? 0}</span></div><div className="flex justify-between border-t border-white/[.08] pt-4 font-semibold text-[#eee8d9]"><span>Total</span><span>{score.finalScore ?? 0}</span></div></div></Card></div>
    <div className="mt-7 flex flex-wrap justify-center gap-3"><LinkButton to="/create"><RotateCcw size={16}/>Play Again</LinkButton><Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/10 px-5 py-2.5 text-sm text-[#c9c4b4] hover:bg-white/[.04]">Back to the room <ArrowRight size={15}/></Link></div></div>
}
