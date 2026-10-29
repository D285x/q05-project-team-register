import { useEffect, useRef, useState } from 'react'
import { API, TITLE, NOUN, FIELDS } from './config'

const emptyForm = () => Object.fromEntries(FIELDS.map(f => [f.name, '']))

export default function App() {
  const [records, setRecords] = useState([])
  const [form, setForm] = useState(emptyForm())
  const [editingId, setEditingId] = useState(null)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const timer = useRef(null)

  const load = async () => {
    try {
      const res = await fetch(API)
      if (!res.ok) throw new Error('bad status')
      const data = await res.json()
      if (!Array.isArray(data)) throw new Error('bad payload')
      // Keep a stable order (Postgres can reorder rows after an update)
      setRecords([...data].sort((a, b) => a.id - b.id))
    } catch {
      notify('error', 'Cannot reach the server. Is the backend running?')
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!pendingDelete) return
    const onKey = e => { if (e.key === 'Escape') setPendingDelete(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pendingDelete])

  const notify = (type, text) => {
    clearTimeout(timer.current)
    setMessage({ type, text })
    timer.current = setTimeout(() => setMessage(null), 4000)
  }

  const fieldError = (f, raw) => {
    const v = String(raw ?? '').trim()
    if (f.required && v === '') return f.label + ' is required'
    if (f.type === 'email' && v !== '' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return 'Enter a valid email address'
    if ((f.type === 'number' || f.type === 'decimal') && v !== '' && Number.isNaN(Number(v))) return f.label + ' must be a number'
    if ((f.type === 'number' || f.type === 'decimal') && v !== '' && Number(v) < 0) return f.label + ' cannot be negative'
    if (f.type === 'number' && v !== '' && !Number.isInteger(Number(v))) return f.label + ' must be a whole number'
    return null
  }

  const validate = () => {
    const found = {}
    FIELDS.forEach(f => {
      const msg = fieldError(f, form[f.name])
      if (msg) found[f.name] = msg
    })
    setErrors(found)
    return Object.keys(found).length === 0
  }

  // Inline validation: check a field as soon as the user leaves it
  const handleBlur = f => {
    const msg = fieldError(f, form[f.name])
    setErrors(prev => {
      const next = { ...prev }
      if (msg) next[f.name] = msg
      else delete next[f.name]
      return next
    })
  }

  const handleChange = e => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    if (errors[name]) setErrors(prev => { const next = { ...prev }; delete next[name]; return next })
  }

  const reset = () => { setForm(emptyForm()); setEditingId(null); setErrors({}) }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) { notify('error', 'Please fix the highlighted fields'); return }
    const payload = {}
    FIELDS.forEach(f => {
      const v = form[f.name]
      if (f.type === 'number' || f.type === 'decimal') payload[f.name] = v === '' ? null : Number(v)
      else payload[f.name] = v === '' ? (f.type === 'date' ? null : '') : v
    })
    try {
      const res = await fetch(editingId ? API + '/' + editingId : API, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        notify('success', editingId ? NOUN + ' updated successfully' : NOUN + ' added successfully')
        reset()
        load()
      } else if (res.status === 400) {
        let body = {}
        try { body = await res.json() } catch { body = {} }
        setErrors(body && typeof body === 'object' ? body : {})
        notify('error', 'Server rejected the data, check the fields')
      } else {
        notify('error', 'Something went wrong while saving')
      }
    } catch {
      notify('error', 'Cannot reach the server. Is the backend running?')
    }
  }

  const handleEdit = r => {
    const next = {}
    FIELDS.forEach(f => { next[f.name] = r[f.name] ?? '' })
    setForm(next)
    setEditingId(r.id)
    setErrors({})
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  const confirmDelete = async () => {
    const id = pendingDelete
    setPendingDelete(null)
    try {
      const res = await fetch(API + '/' + id, { method: 'DELETE' })
      if (res.ok) {
        notify('success', NOUN + ' deleted successfully')
        if (editingId === id) reset()
        load()
      } else {
        notify('error', 'Could not delete the record')
      }
    } catch {
      notify('error', 'Cannot reach the server. Is the backend running?')
    }
  }

  const renderInput = f => {
    const common = {
      name: f.name,
      value: form[f.name],
      onChange: handleChange,
      onBlur: () => handleBlur(f),
      className: errors[f.name] ? 'invalid' : '',
      'aria-invalid': errors[f.name] ? 'true' : undefined
    }
    if (f.type === 'select') {
      return (
        <select {...common}>
          <option value="">Select</option>
          {f.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )
    }
    if (f.type === 'textarea') return <textarea rows="3" {...common} />
    const type = f.type === 'decimal' ? 'number' : f.type
    const numeric = f.type === 'number' || f.type === 'decimal'
    return (
      <input
        type={type}
        step={f.type === 'decimal' ? 'any' : undefined}
        min={numeric ? '0' : undefined}
        inputMode={numeric ? 'decimal' : undefined}
        {...common}
      />
    )
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <h1>{TITLE}</h1>
          <span className="count">{records.length} {records.length === 1 ? 'record' : 'records'}</span>
        </div>
      </header>

      {message && <div className={'message ' + message.type} role="status" aria-live="polite">{message.text}</div>}

      <main className="container">
        <form className="card" onSubmit={handleSubmit} noValidate>
          <h2>{editingId ? 'Edit ' + NOUN : 'Add ' + NOUN}</h2>
          <div className="grid">
            {FIELDS.map(f => (
              <label key={f.name}>
                <span>{f.label}{f.required && <b className="star"> *</b>}</span>
                {renderInput(f)}
                {errors[f.name] && <small className="error">{errors[f.name]}</small>}
              </label>
            ))}
          </div>
          <div className="actions">
            <button type="submit" className="primary">{editingId ? 'Update' : 'Save'}</button>
            {editingId && <button type="button" onClick={reset}>Cancel</button>}
          </div>
        </form>

        <section className="card">
          <h2>All Records ({records.length})</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  {FIELDS.map(f => <th key={f.name}>{f.label}</th>)}
                  <th><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 && (
                  <tr>
                    <td colSpan={FIELDS.length + 2} className="empty">
                      <strong>No records yet</strong>
                      Add your first {NOUN.toLowerCase()} using the form above.
                    </td>
                  </tr>
                )}
                {records.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    {FIELDS.map(f => <td key={f.name}>{r[f.name]}</td>)}
                    <td className="row-actions">
                      <button onClick={() => handleEdit(r)}>Edit</button>
                      <button className="danger" onClick={() => setPendingDelete(r.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {pendingDelete !== null && (
        <div className="scrim" onClick={() => setPendingDelete(null)}>
          <div className="sheet" role="alertdialog" aria-modal="true" aria-labelledby="del-title" onClick={e => e.stopPropagation()}>
            <h3 id="del-title">Delete this {NOUN.toLowerCase()}?</h3>
            <p>This action cannot be undone.</p>
            <div className="stack">
              <button className="danger-solid" onClick={confirmDelete} autoFocus>Delete</button>
              <button onClick={() => setPendingDelete(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
