/**
 * Global confirm — admin me kisi bhi delete par chhota "Yes / No" box.
 * `apiDelete` khud isse use karta hai (saare delete buttons cover ho jate hain).
 */
let handler = null

export const setConfirmHandler = (fn) => {
  handler = fn
}

export const confirmAction = (options = {}) => {
  const opts = typeof options === 'string' ? { message: options } : options
  if (handler) return handler(opts)

  try {
    return Promise.resolve(window.confirm(opts.message || opts.title || 'Are you sure?'))
  } catch {
    return Promise.resolve(false)
  }
}

export default confirmAction
