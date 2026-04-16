import { createClient } from '@/lib/supabase/server'
import type { Entry, EntryFilters, EntryFormData } from '@/lib/types'

export async function getEntries(filters?: EntryFilters): Promise<Entry[]> {
  const supabase = await createClient()

  let query = supabase
    .from('entries')
    .select(`
      *,
      tags:entry_tags(tag),
      links:entry_links(id, url, label),
      files:entry_files(id, storage_path, original_filename, mime_type, file_size)
    `)
    .order('date_of_work', { ascending: false })

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,impact.ilike.%${filters.search}%`)
  }
  if (filters?.project) {
    query = query.ilike('project', `%${filters.project}%`)
  }
  if (filters?.dateFrom) {
    query = query.gte('date_of_work', filters.dateFrom)
  }
  if (filters?.dateTo) {
    query = query.lte('date_of_work', filters.dateTo)
  }

  const { data, error } = await query
  if (error) throw error

  return (data ?? []).map(normalizeEntry).filter((e): e is Entry => {
    if (!filters?.tags?.length) return true
    return filters.tags.every(tag => e.tags?.includes(tag))
  })
}

export async function getEntry(id: string): Promise<Entry | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('entries')
    .select(`
      *,
      tags:entry_tags(tag),
      links:entry_links(id, url, label),
      files:entry_files(id, storage_path, original_filename, mime_type, file_size)
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return normalizeEntry(data)
}

export async function createEntry(formData: EntryFormData): Promise<Entry> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: entry, error } = await supabase
    .from('entries')
    .insert({
      user_id: user.id,
      title: formData.title,
      description: formData.description || null,
      date_of_work: formData.date_of_work,
      project: formData.project || null,
      impact: formData.impact || null,
    })
    .select()
    .single()

  if (error) throw error

  if (formData.tags.length > 0) {
    await supabase.from('entry_tags').insert(
      formData.tags.map(tag => ({ entry_id: entry.id, tag }))
    )
  }

  if (formData.links.length > 0) {
    await supabase.from('entry_links').insert(
      formData.links.filter(l => l.url).map(l => ({
        entry_id: entry.id,
        url: l.url,
        label: l.label || null,
      }))
    )
  }

  return entry
}

export async function updateEntry(id: string, formData: EntryFormData): Promise<Entry> {
  const supabase = await createClient()

  const { data: entry, error } = await supabase
    .from('entries')
    .update({
      title: formData.title,
      description: formData.description || null,
      date_of_work: formData.date_of_work,
      project: formData.project || null,
      impact: formData.impact || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // Replace tags
  await supabase.from('entry_tags').delete().eq('entry_id', id)
  if (formData.tags.length > 0) {
    await supabase.from('entry_tags').insert(
      formData.tags.map(tag => ({ entry_id: id, tag }))
    )
  }

  // Replace links
  await supabase.from('entry_links').delete().eq('entry_id', id)
  if (formData.links.length > 0) {
    await supabase.from('entry_links').insert(
      formData.links.filter(l => l.url).map(l => ({
        entry_id: id,
        url: l.url,
        label: l.label || null,
      }))
    )
  }

  return entry
}

export async function deleteEntry(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('entries').delete().eq('id', id)
  if (error) throw error
}

function normalizeEntry(raw: Record<string, unknown>): Entry {
  return {
    ...raw,
    tags: Array.isArray(raw.tags)
      ? (raw.tags as { tag: string }[]).map(t => t.tag)
      : [],
  } as Entry
}
