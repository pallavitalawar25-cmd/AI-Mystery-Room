import { useCallback, useEffect, useState } from 'react'
import { discoverClue, getApiErrorMessage, getCase, requestHint } from '../services/api.js'

export function useCase(caseId) {
  const [caseData, setCaseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [action, setAction] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setCaseData(await getCase(caseId))
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'This case could not be found.'))
    } finally {
      setLoading(false)
    }
  }, [caseId])

  useEffect(() => { reload() }, [reload])

  const findClue = async (clueId) => {
    setAction(`clue:${clueId}`)
    try {
      const result = await discoverClue(caseId, clueId)
      setCaseData((current) => current ? {
        ...current,
        discoveredClueIds: result.progress?.discoveredClueIds ?? current.discoveredClueIds,
      } : current)
      return { result }
    } catch (requestError) {
      return { error: getApiErrorMessage(requestError, 'This clue could not be recorded.') }
    } finally { setAction('') }
  }

  const askHint = async () => {
    setAction('hint')
    try {
      const result = await requestHint(caseId)
      setCaseData((current) => current ? {
        ...current,
        hintsUsed: result.hintsUsed ?? current.hintsUsed + 1,
        hintsRemaining: result.hintsRemaining ?? Math.max(0, current.hintsRemaining - 1),
      } : current)
      return { result }
    } catch (requestError) {
      return { error: getApiErrorMessage(requestError, 'A hint is not available right now.') }
    } finally { setAction('') }
  }

  return { caseData, loading, error, action, reload, findClue, askHint }
}
