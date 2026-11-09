/**
 * Global confirm — kisi bhi delete button se chhota "Yes / No" box kholta hai.
 *
 *   if (!(await confirmAction({ title: 'Cart se hatao?', message: book.title }))) return
 *
 * <ConfirmDialog /> app me (main.jsx) ek dafa mount hota hai.
 */
let handler = null

export const setConfirmHandler = (fn) => {
  handler = fn
}

export const confirmAction = (options = {}) => {
  const opts = typeof options === 'string' ? { message: options } : options
  if (handler) return handler(opts)

  /* fallback (dialog mount nahi hua) */
  try {
    return Promise.resolve(window.confirm(opts.message || opts.title || 'Are you sure?'))
  } catch {
    return Promise.resolve(false)
  }
}

export default confirmAction
