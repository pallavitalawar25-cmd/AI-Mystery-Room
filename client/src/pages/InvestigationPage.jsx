import { ArrowRight, Check, Eye, Lightbulb, LockKeyhole, Search, UserRound } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Card from '../components/Card.jsx'
import DifficultyBadge from '../components/DifficultyBadge.jsx'
import { Button } from '../components/Button.jsx'
import { ErrorState, InlineError, LoadingState } from '../components/Feedback.jsx'
import { useCase } from '../hooks/useCase.js'

export default function InvestigationPage() {
  const { id } = useParams()
  const { caseData, loading, error, action, reload, findClue, askHint } = useCase(id)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [hints, setHints] = useState([])
  useEffect(() => {
    try {
      const savedHints = JSON.parse(sessionStorage.getItem(`mystery-room:hints:${id}`) || '[]')
      setHints(Array.isArray(savedHints) ? savedHints : [])
    } catch {
      setHints([])
    }
  }, [id])
  const found = caseData?.discoveredClueIds || []
  const score = caseData ? Math.max(0, ({ Easy: 100, Medium: 150, Hard: 200 }[caseData.difficulty] || 0) + found.length * 5 - caseData.hintsUsed * 10) : 0

  const onFind = async (clueId) => {
    setActionError(''); setActionMessage('')
    const { result, error: message } = await findClue(clueId)
    if (message) setActionError(message)
    else setActionMessage(result.pointsAwarded ? 'Clue recorded · +5 evidence points.' : 'This clue was already recorded; no additional points were awarded.')
  }
  const onHint = async () => {
    setActionError(''); setActionMessage('')
    const { result, error: message } = await askHint()
    if (message) setActionError(message)
    else {
      setHints((current) => {
        const nextHints = [...current, result.hint]
        try { sessionStorage.setItem(`mystery-room:hints:${id}`, JSON.stringify(nextHints)) } catch { /* Hint remains available for this visit. */ }
        return nextHints
      })
      setActionMessage('Hint received · 10 points deducted.')
    }
  }

  if (loading) return <LoadingState label="Retrieving the case file…" />
  if (error || !caseData) return <ErrorState message={error || 'This case could not be found.'} onRetry={reload} />
  if (caseData.status !== 'active') return <ErrorState message="This investigation is complete. The result is ready." linkTo={`/case/${id}/result`} linkLabel="View the result" />

  return <div className="mx-auto max-w-6xl"><div className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#c4a36b]">Active investigation</p><div className="flex flex-wrap items-center gap-3"><h1 className="font-serif text-3xl text-[#f0eadc] sm:text-4xl">{caseData.title}</h1><DifficultyBadge difficulty={caseData.difficulty}/></div>{caseData.generationSource === 'template' && <p role="status" className="mt-2 text-xs text-[#bca979]">Template-generated mystery — AI service temporarily unavailable.</p>}</div><span className="inline-flex items-center gap-2 text-xs text-[#8e8c80]"><LockKeyhole size={14} className="text-[#c4a36b]"/>Solution sealed</span></div>
    <Card className="mb-6 overflow-hidden"><div className="border-b border-white/[.08] px-5 py-4 sm:px-7"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#c4a36b]">Case briefing</p></div><p className="max-w-4xl px-5 py-5 font-serif text-lg leading-8 text-[#d7d1c2] sm:px-7 sm:py-6">{caseData.story}</p></Card>
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]"><div className="space-y-7"><section><div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 font-serif text-2xl"><UserRound size={19} className="text-[#c4a36b]"/>Persons of interest</h2><span className="text-xs text-[#858477]">{caseData.suspects.length} suspects</span></div><div className="grid gap-3 sm:grid-cols-2">{caseData.suspects.map((suspect, index) => <Card key={suspect.id} className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#8d8b7f]">Person {String(index+1).padStart(2,'0')}</p><h3 className="mt-1 font-serif text-xl text-[#eee8d9]">{suspect.name}</h3></div><span className="mt-1 size-2 rounded-full border border-[#c4a36b]/60"/></div><p className="mt-3 text-sm leading-6 text-[#aaa797]">{suspect.description}</p><div className="mt-4 border-t border-white/[.07] pt-3"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#c4a36b]">Alibi</p><p className="mt-1 text-xs leading-5 text-[#969384]">{suspect.alibi}</p>{suspect.motive && <><p className="mt-3 text-[10px] font-bold uppercase tracking-[.15em] text-[#c4a36b]">Possible motive</p><p className="mt-1 text-xs leading-5 text-[#969384]">{suspect.motive}</p></>}</div></Card>)}</div></section>
      <section><div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 font-serif text-2xl"><Search size={19} className="text-[#c4a36b]"/>Evidence log</h2><span className="text-xs text-[#858477]">{found.length} / {caseData.clues.length} recorded</span></div><div className="space-y-3">{caseData.clues.map((clue, index) => { const isFound = found.includes(clue.id); const busy = action === `clue:${clue.id}`; return <Card key={clue.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><span className="mt-0.5 font-mono text-xs text-[#c4a36b]/75">{String(index+1).padStart(2,'0')}</span><div><h3 className="font-semibold text-[#e2dccd]">{clue.title}</h3><p className="mt-1 text-sm leading-6 text-[#999687]">{clue.description}</p></div></div><Button variant={isFound ? 'secondary' : 'quiet'} className="shrink-0" disabled={busy || Boolean(action)} loading={busy} onClick={() => onFind(clue.id)}>{isFound ? <><Check size={15}/>Recorded</> : <><Eye size={15}/>Record clue</>}</Button></Card> })}</div></section></div>
      <aside className="space-y-4"><Card className="p-5"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#c4a36b]">Investigation progress</p><p className="mt-3 font-serif text-4xl text-[#eee8d9]">{found.length}<span className="text-xl text-[#838276]"> / {caseData.clues.length}</span></p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[.08]"><div className="h-full rounded-full bg-[#c4a36b] transition-all" style={{width:`${Math.min(100, found.length/caseData.clues.length*100)}%`}}/></div><p className="mt-2 text-xs text-[#8e8c80]">Unique clues found</p><div className="mt-5 border-t border-white/[.08] pt-4"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#8e8c80]">Potential score if correct</p><p className="mt-1 font-serif text-2xl text-[#d4b77f]">{score} <span className="font-sans text-xs text-[#8e8c80]">points</span></p><p className="mt-1 text-[10px] leading-5 text-[#77786e]">Estimate only · the server calculates your result</p></div></Card>
        <Card className="p-5"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-semibold text-[#e2dccd]"><Lightbulb size={16} className="text-[#c4a36b]"/>Ask for a hint</h2><span className="text-xs text-[#969384]">{caseData.hintsRemaining} left</span></div><p className="mt-2 text-xs leading-5 text-[#929083]">Each hint costs 10 points. Use it only when you need direction.</p><Button variant="secondary" className="mt-4 w-full" onClick={onHint} loading={action === 'hint'} disabled={action === 'hint' || caseData.hintsRemaining <= 0}>Request a hint</Button>{hints.map((hint, index) => <div key={`${index}-${hint}`} className="mt-3 rounded-lg border border-[#c4a36b]/15 bg-[#c4a36b]/[.04] p-3"><p className="mb-1 text-[9px] font-bold uppercase tracking-[.15em] text-[#c4a36b]">Hint {index + 1}</p><p className="text-xs leading-5 text-[#c8c1b0]">{hint}</p></div>)}</Card>
        <Card className="border-[#c4a36b]/20 bg-[#c4a36b]/[.04] p-5"><p className="font-serif text-lg text-[#e2dccd]">Ready to decide?</p><p className="mt-1 text-xs leading-5 text-[#999687]">Your accusation is final. Review each alibi and clue before choosing.</p><Link to={`/case/${encodeURIComponent(id)}/accuse`} className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#c4a36b] px-4 py-2.5 text-sm font-semibold text-[#171813] transition hover:bg-[#d4b77f]">Review suspects <ArrowRight size={15}/></Link></Card>
      </aside></div><InlineError>{actionError}</InlineError>{actionMessage && <p role="status" className="mt-4 text-sm text-[#b8c8a6]">{actionMessage}</p>}</div>
}
