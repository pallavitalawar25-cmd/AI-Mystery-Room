export default function PageHeading({ eyebrow, title, description, className = '' }) {
  return <div className={`mb-8 max-w-3xl ${className}`}><p className="mb-3 text-[11px] font-bold uppercase tracking-[.24em] text-[#c4a36b]">{eyebrow}</p><h1 className="font-serif text-4xl leading-tight tracking-[-.03em] text-[#f0eadc] sm:text-5xl">{title}</h1>{description && <p className="mt-4 max-w-2xl text-base leading-7 text-[#aaa797]">{description}</p>}</div>
}
