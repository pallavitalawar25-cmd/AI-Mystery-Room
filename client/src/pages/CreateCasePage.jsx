import {
  ArrowRight,
  BookOpen,
  Check,
  DoorClosed,
  FlaskConical,
  Landmark,
  Search,
  Shuffle,
  TrainFront,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card.jsx'
import PageHeading from '../components/PageHeading.jsx'
import DifficultyBadge from '../components/DifficultyBadge.jsx'
import { Button } from '../components/Button.jsx'
import { InlineError, LoadingState } from '../components/Feedback.jsx'
import { createCase, getApiErrorMessage, getCaseOptions } from '../services/api.js'

const scenarioIcons = {
  'royal-letter': BookOpen,
  'empty-compartment': TrainFront,
  'locked-room': DoorClosed,
  'missing-experiment': FlaskConical,
  'museum-heist': Landmark,
  'vanishing-evidence': Search,
}

function DifficultyChoices({ options, selected, onChange, name }) {
  return <fieldset>
    <legend className="mb-3 text-sm font-semibold text-[#ded8c9]">Choose your difficulty</legend>
    <div className="grid gap-3 sm:grid-cols-3">
      {options.map((option) => (
        <label
          key={option.name}
          className={`relative cursor-pointer rounded-xl border p-4 transition duration-200 ${
            selected === option.name
              ? 'border-[#c4a36b]/60 bg-[#c4a36b]/[.08] shadow-[0_8px_24px_rgba(0,0,0,.14)]'
              : 'border-white/[.09] bg-[#171914] hover:-translate-y-0.5 hover:border-[#c4a36b]/35'
          }`}
        >
          <input
            className="sr-only"
            type="radio"
            name={name}
            value={option.name}
            checked={selected === option.name}
            onChange={() => onChange(option.name)}
          />
          <span className="flex items-center justify-between gap-2">
            <DifficultyBadge difficulty={option.name} />
            <span className={`flex size-5 items-center justify-center rounded-full border ${
              selected === option.name
                ? 'border-[#c4a36b] bg-[#c4a36b] text-[#171813]'
                : 'border-white/20 text-transparent'
            }`}><Check size={12} strokeWidth={3} /></span>
          </span>
          <span className="mt-4 block text-xs text-[#aaa797]">
            {option.suspects} suspects · {option.clues} clues · {option.hints} hints
          </span>
          <span className="mt-1 block text-[11px] text-[#77786e]">
            {option.basePoints} base points
          </span>
        </label>
      ))}
    </div>
  </fieldset>
}

export default function CreateCasePage() {
  const [premise, setPremise] = useState('')
  const [scenarios, setScenarios] = useState([])
  const [difficulties, setDifficulties] = useState([])
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [catalogDifficulty, setCatalogDifficulty] = useState('')
  const [customDifficulty, setCustomDifficulty] = useState('')
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [optionsError, setOptionsError] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  const loadOptions = useCallback(async () => {
    try {
      const options = await getCaseOptions()
      setScenarios(options.scenarios)
      setDifficulties(options.difficulties)
      const firstDifficulty = options.difficulties[0]?.name || ''
      setCatalogDifficulty(firstDifficulty)
      setCustomDifficulty(firstDifficulty)
    } catch (requestError) {
      setOptionsError(getApiErrorMessage(requestError, 'The mystery catalogue could not be loaded.'))
    } finally {
      setOptionsLoading(false)
    }
  }, [])

  useEffect(() => { loadOptions() }, [loadOptions])

  const startCase = async (value, selectedDifficulty) => {
    const trimmed = value.trim()
    if (trimmed.length < 10 || trimmed.length > 500) {
      setError('Your premise must be between 10 and 500 characters.')
      return
    }
    if (!selectedDifficulty) {
      setError('Choose a difficulty before starting the case.')
      return
    }

    setError('')
    setBusy(true)
    try {
      const created = await createCase({ premise: trimmed, difficulty: selectedDifficulty })
      const id = created.id || created._id
      if (!id) throw new Error('The server did not return a case ID.')
      navigate(`/case/${encodeURIComponent(id)}`)
    } catch (requestError) {
      setError(requestError.message === 'The server did not return a case ID.'
        ? requestError.message
        : getApiErrorMessage(requestError, 'The case could not be generated. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  const selectScenario = (scenario) => {
    setSelectedScenario(scenario)
    setPremise(scenario.premise)
    setError('')
  }

  const surpriseMe = () => {
    if (scenarios.length === 0) return
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)]
    selectScenario(scenario)
  }

  return <div className="mx-auto max-w-6xl">
    <PageHeading
      eyebrow="Open a new file · 01 / 03"
      title="Choose Your Mystery"
      description="Every mystery hides a secret. Choose a case, follow the clues, identify the culprit, and uncover the truth."
    />

    <section aria-labelledby="case-catalogue-heading">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#c4a36b]">The case files</p>
          <h2 id="case-catalogue-heading" className="mt-2 font-serif text-2xl text-[#eee8d9]">Select an investigation</h2>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={surpriseMe}
          disabled={optionsLoading || Boolean(optionsError) || busy || scenarios.length === 0}
          className="min-h-10 px-4 py-2 text-xs"
        >
          <Shuffle size={15} /> Surprise Me
        </Button>
      </div>

      {optionsLoading && <Card className="px-5"><LoadingState label="Opening the case catalogue…" /></Card>}
      {optionsError && <Card className="p-5">
        <InlineError>{optionsError}</InlineError>
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          onClick={() => {
            setOptionsLoading(true)
            setOptionsError('')
            loadOptions()
          }}
        >Try again</Button>
      </Card>}

      {!optionsLoading && !optionsError && <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario, index) => {
            const Icon = scenarioIcons[scenario.id] || Search
            const selected = selectedScenario?.id === scenario.id
            return <article
              key={scenario.id}
              className={`group relative flex min-h-64 flex-col overflow-hidden rounded-2xl border bg-[#1d201b] p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(0,0,0,.24)] ${
                selected
                  ? 'border-[#c4a36b]/60 shadow-[0_0_0_1px_rgba(196,163,107,.12)]'
                  : 'border-white/[.09] hover:border-[#c4a36b]/35'
              }`}
            >
              <div className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-[#c4a36b]/[.045] blur-2xl transition group-hover:bg-[#c4a36b]/[.09]" />
              <div className="relative flex items-start justify-between gap-4">
                <span className="flex size-11 items-center justify-center rounded-xl border border-[#c4a36b]/20 bg-[#c4a36b]/[.07] text-[#d4b77f]">
                  <Icon size={20} strokeWidth={1.6} />
                </span>
                <span className="font-serif text-sm text-[#77786e]">CASE {String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className="relative mt-5 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#c4a36b]">{scenario.category}</p>
                <h3 className="mt-2 font-serif text-xl leading-snug text-[#eee8d9]">{scenario.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#999687]">{scenario.description}</p>
              </div>
              <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[.07] pt-4">
                <span className="text-[10px] text-[#77786e]">
                  {difficulties.map(({ name }) => name).join(' · ')}
                </span>
                <button
                  type="button"
                  className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition ${
                    selected
                      ? 'bg-[#c4a36b] text-[#171813]'
                      : 'border border-white/10 text-[#d7d1c2] hover:border-[#c4a36b]/50 hover:text-[#e3c88f]'
                  }`}
                  aria-pressed={selected}
                  disabled={busy}
                  onClick={() => selectScenario(scenario)}
                >
                  {selected ? 'Selected' : 'Play Mystery'}
                  {selected ? <Check size={14} /> : <ArrowRight size={14} />}
                </button>
              </div>
            </article>
          })}
        </div>

        {selectedScenario && <Card className="mt-5 border-[#c4a36b]/20 bg-[linear-gradient(115deg,rgba(196,163,107,.075),rgba(29,32,27,.96)_58%)] p-5 sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#c4a36b]">Case selected</p>
              <h3 className="mt-1 font-serif text-xl text-[#eee8d9]">{selectedScenario.title}</h3>
              <p className="mt-1 text-sm text-[#999687]">{selectedScenario.premise}</p>
            </div>
            <span className="rounded-full border border-[#c4a36b]/20 bg-[#171914]/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[#cbb27f]">
              Ready to investigate
            </span>
          </div>
          <DifficultyChoices
            options={difficulties}
            selected={catalogDifficulty}
            onChange={setCatalogDifficulty}
            name="catalog-difficulty"
          />
          <InlineError>{error}</InlineError>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#77786e]">The case is saved before the investigation room opens.</p>
            <Button
              type="button"
              loading={busy}
              disabled={busy || !catalogDifficulty}
              onClick={() => startCase(selectedScenario.premise, catalogDifficulty)}
            >
              {busy ? 'Creating the case…' : 'Start this mystery'}
              {!busy && <ArrowRight size={16} />}
            </Button>
          </div>
        </Card>}
      </>}
    </section>

    <section aria-labelledby="custom-premise-heading" className="mt-14 border-t border-white/[.08] pt-10">
      <div className="mb-6 max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#c4a36b]">Write your own case</p>
        <h2 id="custom-premise-heading" className="mt-2 font-serif text-3xl text-[#eee8d9]">Have Your Own Mystery Idea?</h2>
        <p className="mt-2 text-sm leading-6 text-[#999687]">Create a mystery using your own imagination.</p>
      </div>
      <Card className="p-5 sm:p-8">
        <form onSubmit={(event) => {
          event.preventDefault()
          startCase(premise, customDifficulty)
        }} noValidate>
          <label htmlFor="premise" className="mb-2 block text-sm font-semibold text-[#ded8c9]">Case premise</label>
          <textarea
            id="premise"
            value={premise}
            onChange={(event) => {
              setPremise(event.target.value)
              setSelectedScenario(null)
              setError('')
            }}
            maxLength={500}
            rows={4}
            placeholder="A sealed archive. A missing letter. Three people with a reason to lie…"
            className="w-full resize-y rounded-xl border border-white/10 bg-[#171914] px-4 py-3 text-sm leading-7 text-[#eee8d9] placeholder:text-[#67685f] focus:border-[#c4a36b]/60 focus:outline-none"
            aria-describedby="premise-count premise-help"
          />
          <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-[#858477]">
            <span id="premise-help">Use at least 10 characters. Keep names and details fictional.</span>
            <span id="premise-count" aria-live="polite">{premise.trim().length} / 500</span>
          </div>

          <div className="mt-8">
            <DifficultyChoices
              options={difficulties}
              selected={customDifficulty}
              onChange={setCustomDifficulty}
              name="custom-difficulty"
            />
          </div>
          <InlineError>{error}</InlineError>
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#77786e]">Generation can take a moment. Your case is saved before it opens.</p>
            <Button type="submit" loading={busy} disabled={busy || optionsLoading || Boolean(optionsError)}>
              {busy ? 'Creating the case…' : 'Generate mystery'}
              {!busy && <ArrowRight size={16} />}
            </Button>
          </div>
        </form>
      </Card>
    </section>
  </div>
}
