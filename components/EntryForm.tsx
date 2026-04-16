'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Entry } from '@/lib/types'
import FileUpload from '@/components/FileUpload'
import TagInput from '@/components/TagInput'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date_of_work: z.string().min(1, 'Date is required'),
  project: z.string().optional(),
  impact: z.string().optional(),
  tags: z.array(z.string()),
  links: z.array(z.object({ url: z.string(), label: z.string() })),
})

type FormValues = z.infer<typeof schema>

export default function EntryForm({
  entry,
  entryId,
}: {
  entry?: Entry
  entryId?: string
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdit = !!entryId

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: entry?.title ?? '',
      description: entry?.description ?? '',
      date_of_work: entry?.date_of_work ?? new Date().toISOString().slice(0, 10),
      project: entry?.project ?? '',
      impact: entry?.impact ?? '',
      tags: entry?.tags ?? [],
      links: entry?.links?.map(l => ({ url: l.url, label: l.label ?? '' })) ?? [],
    },
  })

  const { fields: linkFields, append: addLink, remove: removeLink } = useFieldArray({
    control,
    name: 'links',
  })

  async function onSubmit(values: FormValues) {
    setSaving(true)
    setError(null)

    const url = isEdit ? `/api/entries/${entryId}` : '/api/entries'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Something went wrong.')
      setSaving(false)
      return
    }

    const data = await res.json()
    router.push(`/dashboard/entries/${data.id ?? entryId}`)
    router.refresh()
  }

  const inputClass = "w-full rounded-md border border-border bg-muted px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
  const labelClass = "block text-xs uppercase tracking-wide text-muted-foreground mb-1.5"

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className={labelClass} style={{ fontFamily: 'var(--font-mono)' }}>
          Win *
        </label>
        <input
          {...register('title')}
          placeholder="What did you accomplish?"
          className={inputClass}
          style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 500 }}
        />
        {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
      </div>

      {/* Date + Project row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} style={{ fontFamily: 'var(--font-mono)' }}>Date</label>
          <input
            type="date"
            {...register('date_of_work')}
            className={inputClass}
            style={{ fontFamily: 'var(--font-mono)', colorScheme: 'dark' }}
          />
        </div>
        <div>
          <label className={labelClass} style={{ fontFamily: 'var(--font-mono)' }}>Project</label>
          <input
            {...register('project')}
            placeholder="e.g. Platform redesign"
            className={inputClass}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={labelClass} style={{ fontFamily: 'var(--font-mono)' }}>Description</label>
        <textarea
          {...register('description')}
          placeholder="What exactly did you do? Include context."
          rows={4}
          className={inputClass + ' resize-none'}
        />
      </div>

      {/* Impact */}
      <div>
        <label className={labelClass} style={{ fontFamily: 'var(--font-mono)' }}>Impact</label>
        <textarea
          {...register('impact')}
          placeholder="Why did it matter? What was the outcome or effect?"
          rows={3}
          className={inputClass + ' resize-none'}
        />
      </div>

      {/* Tags */}
      <div>
        <label className={labelClass} style={{ fontFamily: 'var(--font-mono)' }}>Tags</label>
        <TagInput
          value={watch('tags')}
          onChange={tags => setValue('tags', tags)}
        />
      </div>

      {/* Links */}
      <div>
        <label className={labelClass} style={{ fontFamily: 'var(--font-mono)' }}>
          Evidence links
        </label>
        <div className="space-y-2">
          {linkFields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`links.${i}.url`)}
                placeholder="https://..."
                className={inputClass + ' flex-1'}
              />
              <input
                {...register(`links.${i}.label`)}
                placeholder="Label (optional)"
                className={inputClass + ' w-40'}
              />
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="px-3 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors text-sm"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addLink({ url: '', label: '' })}
            className="text-xs text-muted-foreground hover:text-primary transition-colors py-1 flex items-center gap-1.5"
          >
            <span className="text-base leading-none">+</span>
            Add link
          </button>
        </div>
      </div>

      {/* File upload */}
      {entryId && (
        <div>
          <label className={labelClass} style={{ fontFamily: 'var(--font-mono)' }}>
            File attachments
          </label>
          <FileUpload
            entryId={entryId}
            existingFiles={entry?.files ?? []}
          />
        </div>
      )}

      {!entryId && (
        <p className="text-xs text-muted-foreground">
          File attachments can be added after saving the entry.
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md px-5 py-2.5 text-sm font-medium transition-opacity disabled:opacity-60"
          style={{
            background: 'var(--gold)',
            color: 'oklch(0.12 0.005 60)',
          }}
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Log win'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
