import { useState } from 'react'
import { ChevronDown, ChevronUp, Loader2, Plus, Tags, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { ENDPOINTS } from '../lib/api'
import useCollection from '../hooks/useCollection'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'

/** Category boxes — Frontend ke orange/gold ribbon me scroll hote hain. */
export default function CategoriesAdmin() {
  const { items, loading, busyId, saving, create, remove, move, update } = useCollection(
    ENDPOINTS.categories,
    { label: 'Categories' },
  )
  const [name, setName] = useState('')

  const add = async (e) => {
    e.preventDefault()
    const clean = name.trim()
    if (!clean) return toast.error('Category ka naam likho')
    const ok = await create({ name: clean }, { success: 'Box add ho gaya ✅' })
    if (ok) setName('')
  }

  const rename = (cat, value) => {
    const clean = value.trim()
    if (!clean || clean === cat.name) return
    update(cat._id, { name: clean })
  }

  return (
    <>
      <PageHeader
        eyebrow="Ribbon"
        title="Category Boxes"
        subtitle="Frontend par yehi boxes orange/gold ban ke right → left scroll karte hain."
      />

      <section className="card">
        <div className="card-head">
          <h2 className="card-title">
            <Tags className="h-4 w-4 text-brand-600" /> Naya box / category name
          </h2>
          <span className="count-pill">{items.length}</span>
        </div>
        <form onSubmit={add} className="card-body flex flex-wrap items-end gap-3">
          <div className="min-w-[14rem] flex-1">
            <label className="label" htmlFor="cat-name">
              Category name (e.g. Poetry Books)
            </label>
            <input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Poetry Books"
              className="input"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add
          </button>
        </form>
      </section>

      <section className="card mt-4">
        <div className="card-head">
          <h2 className="card-title">
            Boxes <span className="count-pill">{items.length}</span>
          </h2>
          <span className="text-xs text-slate-400">Naam par click karke rename kar sakte ho</span>
        </div>
        <div className="card-body">
          {loading ? (
            <Spinner />
          ) : items.length === 0 ? (
            <p className="empty">
              Abhi koi box nahi hai — Frontend par demo categories dikh rahi hain. Upar se naam add
              karo.
            </p>
          ) : (
            <ul className="space-y-2">
              {items.map((cat, i) => (
                <li key={cat._id} className="row">
                  <span className="row-index">#{i + 1}</span>
                  <input
                    defaultValue={cat.name}
                    onBlur={(e) => rename(cat, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.currentTarget.blur()
                    }}
                    className="input min-w-0 flex-1"
                    title="Rename"
                  />
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => move(cat, -1)}
                      disabled={i === 0 || busyId !== null}
                      className="icon-btn"
                      title="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(cat, 1)}
                      disabled={i === items.length - 1 || busyId !== null}
                      className="icon-btn"
                      title="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(cat, cat.name)}
                      disabled={busyId !== null}
                      className="icon-btn icon-btn--danger"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}
