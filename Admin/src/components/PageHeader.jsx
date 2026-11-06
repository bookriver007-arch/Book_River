/**
 * Har page ka heading block — eyebrow + title + description + actions.
 * `.page-header` class isliye hai ki single-page (embedded) mode me ise hide kiya ja sake.
 */
export default function PageHeader({ eyebrow, title, subtitle, actions = null }) {
  return (
    <div className="page-header mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? (
          <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-brand-700">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-brand-900 sm:text-[1.7rem]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
