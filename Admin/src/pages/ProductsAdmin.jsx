import { useRef, useState } from 'react'
import { ChevronDown, ChevronUp, ImagePlus, LayoutGrid, Loader2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { ENDPOINTS } from '../lib/api'
import useCollection from '../hooks/useCollection'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'

const EMPTY = { title: '', author: '', tag: '', price: '', description: '' }

/** Products — Frontend par ek row me 5 covers, click par book khulti hai. */
export default function ProductsAdmin() {
  const { items, loading, busyId, saving, create, remove, move, update } = useCollection(
    ENDPOINTS.products,
    { label: 'Products' },
  )
  const [form, setForm] = useState(EMPTY)
  const fileRef = useRef(null)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return toast.error('Cover picture select karo')
    if (!form.title.trim()) return toast.error('Title likho')

    const fd = new FormData()
    fd.append('image', file)
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))

    const ok = await create(fd, { isForm: true, success: 'Product add ho gaya ✅' })
    if (ok) {
      setForm(EMPTY)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const save = (product, field, value) => {
    const clean = String(value ?? '').trim()
    if (clean === String(product[field] ?? '').trim()) return
    update(product._id, { [field]: clean })
  }

  const onBlurSave = (product, field) => (e) => save(product, field, e.target.value)
  const onEnterBlur = (e) => {
    if (e.key === 'Enter') e.currentTarget.blur()
  }

  return (
    <>
      <PageHeader
        eyebrow="Collection"
        title="Products — Grid"
        subtitle="Frontend par ek row me 5 covers dikhte hain; cover par click karne se book khulti hai."
      />

      <section className="card">
        <div className="card-head">
          <h2 className="card-title">
            <ImagePlus className="h-4 w-4 text-brand-600" /> Naya product
          </h2>
          <span className="count-pill">{items.length}</span>
        </div>
        <form onSubmit={submit} className="card-body grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="prod-file">
              Picture / Cover (jpg / png / webp — max 5 MB)
            </label>
            <input id="prod-file" ref={fileRef} type="file" accept="image/*" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="prod-title">
              Title
            </label>
            <input
              id="prod-title"
              value={form.title}
              onChange={set('title')}
              placeholder="The Salt & the Stars"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="prod-price">
              Price
            </label>
            <input
              id="prod-price"
              value={form.price}
              onChange={set('price')}
              placeholder="Rs. 1,200"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="prod-author">
              Author (optional)
            </label>
            <input
              id="prod-author"
              value={form.author}
              onChange={set('author')}
              placeholder="A. M. Rivers"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="prod-tag">
              Tag (optional)
            </label>
            <input
              id="prod-tag"
              value={form.tag}
              onChange={set('tag')}
              placeholder="Fiction"
              className="input"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="prod-desc">
              Short description
            </label>
            <textarea
              id="prod-desc"
              rows={2}
              value={form.description}
              onChange={set('description')}
              placeholder="Chhoti si description…"
              className="input"
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              Add product
            </button>
          </div>
        </form>
      </section>

      <section className="card mt-4">
        <div className="card-head">
          <h2 className="card-title">
            <LayoutGrid className="h-4 w-4 text-brand-600" /> Products{' '}
            <span className="count-pill">{items.length}</span>
          </h2>
          <span className="text-xs text-slate-400">Field par click karke edit — blur par save</span>
        </div>
        <div className="card-body">
          {loading ? (
            <Spinner />
          ) : items.length === 0 ? (
            <p className="empty">
              Abhi koi product nahi hai — Frontend par demo covers dikh rahe hain. Upar se cover +
              title add karo.
            </p>
          ) : (
            <ul className="space-y-2">
              {items.map((product, i) => (
                <li key={product._id} className="row items-start">
                  <span className="row-index mt-2">#{i + 1}</span>
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="thumb h-20 w-16 object-cover"
                  />
                  <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <input
                      defaultValue={product.title}
                      onBlur={onBlurSave(product, 'title')}
                      onKeyDown={onEnterBlur}
                      className="input"
                      title="Title"
                    />
                    <input
                      defaultValue={product.price}
                      onBlur={onBlurSave(product, 'price')}
                      onKeyDown={onEnterBlur}
                      className="input"
                      title="Price"
                    />
                    <input
                      defaultValue={product.author}
                      onBlur={onBlurSave(product, 'author')}
                      onKeyDown={onEnterBlur}
                      className="input"
                      title="Author"
                    />
                    <input
                      defaultValue={product.tag}
                      onBlur={onBlurSave(product, 'tag')}
                      onKeyDown={onEnterBlur}
                      className="input"
                      title="Tag"
                    />
                    <textarea
                      defaultValue={product.description}
                      onBlur={onBlurSave(product, 'description')}
                      rows={2}
                      className="input sm:col-span-2 lg:col-span-4"
                      title="Description"
                    />
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => move(product, -1)}
                      disabled={i === 0 || busyId !== null}
                      className="icon-btn"
                      title="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(product, 1)}
                      disabled={i === items.length - 1 || busyId !== null}
                      className="icon-btn"
                      title="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(product, product.title)}
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
