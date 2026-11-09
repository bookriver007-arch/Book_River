import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { apiDelete, apiList, apiSend, swapOrder } from '../lib/api'
import { confirmAction } from '../lib/confirm'

/**
 * Ek collection (slides / books / products …) ke liye chhota sa CRUD hook.
 * load · add · update · remove · move (order swap) — sab yahin.
 */
export default function useCollection(url, { label = 'Data' } = {}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [saving, setSaving] = useState(false)

  const reload = useCallback(async () => {
    try {
      const data = await apiList(url)
      setItems(Array.isArray(data) ? data : [])
    } catch {
      toast.error(`${label} did not load — is the backend (port 5000) running?`)
    } finally {
      setLoading(false)
    }
  }, [url, label])

  useEffect(() => {
    reload()
  }, [reload])

  /** add — body JSON ya FormData (isForm: true) */
  const create = async (body, { isForm = false, success = 'Added ✅' } = {}) => {
    setSaving(true)
    try {
      await apiSend(url, isForm ? { form: body } : { body })
      toast.success(success)
      await reload()
      return true
    } catch (err) {
      toast.error(err.message)
      return false
    } finally {
      setSaving(false)
    }
  }

  /** field edit — onBlur par chupchaap save */
  const update = async (id, body, { success } = {}) => {
    setBusyId(id)
    try {
      await apiSend(`${url}/${id}`, { method: 'PATCH', body })
      if (success) toast.success(success)
      await reload()
      return true
    } catch (err) {
      toast.error(err.message)
      return false
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (item, name) => {
    const ok = await confirmAction({
      title: 'Delete?',
      message: `"${name}" will be deleted permanently.`,
      confirmLabel: 'Yes, delete',
    })
    if (!ok) return
    setBusyId(item._id)
    try {
      await apiDelete(`${url}/${item._id}`)
      toast.success('Deleted')
      await reload()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  /** dir = -1 (up) or +1 (down) */
  const move = async (item, dir) => {
    const i = items.findIndex((x) => x._id === item._id)
    const neighbour = items[i + dir]
    if (!neighbour) return
    setBusyId(item._id)
    try {
      await swapOrder(url, item, neighbour)
      await reload()
    } catch {
      toast.error('Move failed')
    } finally {
      setBusyId(null)
    }
  }

  return { items, loading, busyId, saving, reload, create, update, remove, move }
}
