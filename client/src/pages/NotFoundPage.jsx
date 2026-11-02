import { Link } from 'react-router-dom'
import Card from '../components/Card.jsx'

export default function NotFoundPage() {
  return <Card className="mx-auto max-w-xl p-8 text-center sm:p-12"><p className="font-mono text-xs tracking-[.2em] text-[#c4a36b]">FILE NOT FOUND · 404</p><h1 className="mt-4 font-serif text-3xl text-[#eee8d9]">This trail ends here.</h1><p className="mt-3 text-sm leading-6 text-[#aaa797]">That address does not match an open room. Return to the case desk and choose where to begin.</p><Link to="/" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#c4a36b] px-5 py-2.5 text-sm font-semibold text-[#171813] hover:bg-[#d4b77f]">Back to the room</Link></Card>
}
