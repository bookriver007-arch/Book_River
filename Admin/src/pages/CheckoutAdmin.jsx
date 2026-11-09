import { useCallback, useEffect, useState } from 'react'
import { CreditCard, Loader2, Plus, Receipt, Save, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { ENDPOINTS, apiList, apiSend } from '../lib/api'

/**
 * Checkout — payment methods + tax / shipping charges.
 * Yahan se jo bhi badlo, Frontend ke cart/checkout par turant lagta hai.
 */
const EMPTY_METHOD = { key: '', title: '', desc: '', enabled: true }

export default function CheckoutAdmin() {
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiList(ENDPOINTS.checkout)
      setForm({
        paymentMethods: (data.paymentMethods || []).map((m) => ({ ...m })),
        taxEnabled: Boolean(data.taxEnabled),
        taxLabel: data.taxLabel || 'Tax',
        taxPercent: String(data.taxPercent ?? 0),
        shippingFee: String(data.shippingFee ?? 0),
        freeShippingOver: String(data.freeShippingOver ?? 0),
      })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const patch = (changes) => setForm((prev) => ({ ...prev, ...changes }))

  const patchMethod = (index, changes) =>
    setForm((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((method, i) =>
        i === index ? { ...method, ...changes } : method,
      ),
    }))

  const addMethod = () =>
    setForm((prev) => ({ ...prev, paymentMethods: [...prev.paymentMethods, { ...EMPTY_METHOD }] }))

  const removeMethod = (index) =>
    setForm((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter((_, i) => i !== index),
    }))

  const save = async () => {
    if (!form) return
    setSaving(true)
    try {
      const data = await apiSend(ENDPOINTS.checkout, { method: 'PUT', body: form })
      setForm((prev) => ({ ...prev, paymentMethods: data.paymentMethods }))
      toast.success('Checkout settings saved ✅')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Checkout"
        subtitle="Add / disable payment methods, and set tax + shipping charges."
        actions={
          <button type="button" onClick={save} disabled={saving || loading} className="btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </button>
        }
      />

      {loading || !form ? (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* ---------- payment methods ---------- */}
          <section className="card lg:col-span-2">
            <div className="card-head">
              <h2 className="card-title">
                <CreditCard className="h-4 w-4 text-brand-600" /> Payment methods
              </h2>
              <span className="count-pill">{form.paymentMethods.length} methods</span>
            </div>

            <div className="card-body space-y-3">
              {form.paymentMethods.map((method, index) => (
                <div
                  key={`${method.key}-${index}`}
                  className="grid gap-2 rounded-xl border border-slate-200 bg-white/70 p-3 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
                >
                  <label className="flex items-center gap-2 text-[0.72rem] font-bold text-slate-600">
                    <input
                      type="checkbox"
                      checked={method.enabled !== false}
                      onChange={(e) => patchMethod(index, { enabled: e.target.checked })}
                      className="h-4 w-4 accent-brand-600"
                    />
                    On
                  </label>

                  <div>
                    <span className="label">Title</span>
                    <input
                      value={method.title}
                      onChange={(e) => patchMethod(index, { title: e.target.value })}
                      placeholder="e.g. Bank Transfer"
                      className="input"
                      maxLength={40}
                    />
                  </div>

                  <div>
                    <span className="label">Note (short line)</span>
                    <input
                      value={method.desc}
                      onChange={(e) => patchMethod(index, { desc: e.target.value })}
                      placeholder="e.g. IBFT / online transfer"
                      className="input"
                      maxLength={60}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeMethod(index)}
                    title="Remove method"
                    className="btn-outline justify-center !px-3"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={addMethod} className="btn-outline">
                  <Plus className="h-4 w-4" /> Add payment method
                </button>
                <p className="hint">
                  On the frontend only <strong>On</strong> methods appear — add a new method, write its title, and it reaches the cart as soon as you save.
                </p>
              </div>
            </div>
          </section>

          {/* ---------- tax ---------- */}
          <section className="card">
            <div className="card-head">
              <h2 className="card-title">
                <Receipt className="h-4 w-4 text-brand-600" /> Tax
              </h2>
              <span className="count-pill">{form.taxEnabled ? 'on' : 'off'}</span>
            </div>
            <div className="card-body space-y-3">
              <label className="flex items-center gap-2 text-[0.8rem] font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.taxEnabled}
                  onChange={(e) => patch({ taxEnabled: e.target.checked })}
                  className="h-4 w-4 accent-brand-600"
                />
                Apply tax (added to the checkout total)
              </label>

              <div>
                <span className="label">Tax label</span>
                <input
                  value={form.taxLabel}
                  onChange={(e) => patch({ taxLabel: e.target.value })}
                  placeholder="Tax / GST / Sales Tax"
                  className="input"
                  maxLength={24}
                />
              </div>

              <div>
                <span className="label">Tax (%)</span>
                <input
                  value={form.taxPercent}
                  onChange={(e) => patch({ taxPercent: e.target.value })}
                  inputMode="decimal"
                  placeholder="e.g. 5"
                  className="input"
                />
                <p className="hint">Applies to the subtotal — e.g. 5% × Rs. 2,000 = Rs. 100</p>
              </div>
            </div>
          </section>

          {/* ---------- shipping ---------- */}
          <section className="card">
            <div className="card-head">
              <h2 className="card-title">Shipping charges</h2>
              <span className="count-pill">Rs.</span>
            </div>
            <div className="card-body space-y-3">
              <div>
                <span className="label">Delivery fee (Rs.)</span>
                <input
                  value={form.shippingFee}
                  onChange={(e) => patch({ shippingFee: e.target.value })}
                  inputMode="numeric"
                  placeholder="e.g. 60"
                  className="input"
                />
              </div>

              <div>
                <span className="label">Free shipping above this amount (Rs.)</span>
                <input
                  value={form.freeShippingOver}
                  onChange={(e) => patch({ freeShippingOver: e.target.value })}
                  inputMode="numeric"
                  placeholder="e.g. 999"
                  className="input"
                />
                <p className="hint">Enter 0 to turn the free shipping rule off.</p>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  )
}

