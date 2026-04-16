'use client'

import { useState, useRef, KeyboardEvent } from 'react'

export default function TagInput({
  value,
  onChange,
}: {
  value: string[]
  onChange: (tags: string[]) => void
}) {
  const [input, setInput] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, '-')
    if (tag && !value.includes(tag)) {
      onChange([...value, tag])
    }
    setInput('')
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div
      className="flex flex-wrap gap-1.5 rounded-md border border-border bg-muted px-3 py-2 min-h-[42px] cursor-text focus-within:ring-1 focus-within:ring-primary/50 transition-all"
      onClick={() => ref.current?.focus()}
    >
      {value.map(tag => (
        <span
          key={tag}
          className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-sm"
          style={{ background: 'var(--gold-dim)', color: 'var(--gold)', fontFamily: 'var(--font-body)' }}
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter(t => t !== tag))}
            className="hover:opacity-70 leading-none ml-0.5 text-sm"
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={ref}
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => input && addTag(input)}
        placeholder={value.length === 0 ? 'Type a tag, press Enter…' : ''}
        className="flex-1 min-w-24 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
        style={{ fontFamily: 'var(--font-body)' }}
      />
    </div>
  )
}
