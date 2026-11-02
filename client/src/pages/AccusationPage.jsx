import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, UserRound } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Card from '../components/Card.jsx'
import PageHeading from '../components/PageHeading.jsx'
import { Button } from '../components/Button.jsx'
import { ErrorState, InlineError, LoadingState } from '../components/Feedback.jsx'
import { getApiErrorMessage, getCase, submitAccusation } from '../services/api.js'

export default function AccusationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [caseData, setCaseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setCaseData(await getCase(id)) }
    catch (requestError) {
      if (requestError.response?.status === 409) { navigate(`/case/${encodeURIComponent(id)}/result`, { replace: true }); return }
      setError(getApiErrorMessage(requestError, 'The case could not be retrieved.'))
    } finally { setLoading(false) }
  }, [id, navigate])
  useEffect(() => { load() }, [load])

  const accuse = async () => {
    if (!selected) return
    setSubmitting(true); setSubmitError('')
    try { await submitAccusation(id, selected); navigate(`/case/${encodeURIComponent(id)}/result`) }
    catch (requestError) {
      if (requestError.response?.status === 409) navigate(`/case/${encodeURIComponent(id)}/result`, { replace: true })
      else setSubmitError(getApiErrorMessage(requestError, 'Your accusation could not be submitted.'))
    } finally { setSubmitting(false) }
  }

  if (loading) return <LoadingState label="Verifying the case file…" />
  if (error || !caseData) return <ErrorState message={error || 'This case could not be found.'} onRetry={load} />
  return <div className="mx-auto max-w-3xl"><PageHeading eyebrow="Final decision · 03 / 03" title="Name your suspect." description="Choose one person. The accusation cannot be changed after it is submitted."/><Card className="mb-5 border-[#bb9560]/20 bg-[#c4a36b]/[.04] p-4"><div className="flex gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-[#c4a36b]" size={18}/><p className="text-sm leading-6 text-[#c8c1b0]">A final accusation ends the investigation. The solution and score are revealed after the server records your choice.</p></div></Card><fieldset className="space-y-3"><legend className="sr-only">Choose one suspect</legend>{caseData.suspects.map((suspect) => <label key={suspect.id} className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition ${selected === suspect.id ? 'border-[#c4a36b]/60 bg-[#c4a36b]/[.06]' : 'border-white/[.09] bg-[#1d201b] hover:border-white/20'}`}><input type="radio" name="suspect" value={suspect.id} checked={selected === suspect.id} onChange={() => { setSelected(suspect.id); setReviewing(false); setSubmitError('') }} className="sr-only"/><span className={`mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border ${selected === suspect.id ? 'border-[#c4a36b] bg-[#c4a36b] text-[#171813]' : 'border-[#76766d]'}`}>{selected === suspect.id && <CheckCircle2 size={14}/>}</span><span className="flex-1"><span className="flex items-center gap-2 font-serif text-xl text-[#eee8d9]"><UserRound size={16} className="text-[#c4a36b]"/>{suspect.name}</span><span className="mt-2 block text-sm leading-6 text-[#aaa797]">{suspect.description}</span><span className="mt-3 block text-xs leading-5 text-[#929083]"><strong className="font-semibold text-[#c4a36b]">Alibi: </strong>{suspect.alibi}</span></span></label>)}</fieldset>
    {reviewing && <Card className="mt-5 border-[#bb7169]/30 bg-[#bb7169]/[.06] p-5"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#db958a]">Final confirmation</p><p className="mt-2 text-sm leading-6 text-[#c9c1b3]">You have accused <strong className="text-[#eee8d9]">{caseData.suspects.find((person) => person.id === selected)?.name}</strong>. This ends the case and cannot be undone.</p><div className="mt-4 flex flex-wrap gap-3"><Button variant="danger" onClick={accuse} loading={submitting} disabled={submitting}>Submit final accusation</Button><Button variant="quiet" disabled={submitting} onClick={() => setReviewing(false)}>Choose again</Button></div></Card>}
    <InlineError>{submitError}</InlineError><div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row"><Link to={`/case/${encodeURIComponent(id)}`} className="inline-flex min-h-11 items-center gap-2 text-sm text-[#aaa797] hover:text-[#eee8d9]"><ArrowLeft size={15}/>Return to evidence</Link>{!reviewing && <Button disabled={!selected} onClick={() => setReviewing(true)}>Review accusation <ArrowRight size={16}/></Button>}</div></div>
}
