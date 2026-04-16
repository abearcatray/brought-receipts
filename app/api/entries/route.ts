import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date_of_work: z.string(),
  project: z.string().optional(),
  impact: z.string().optional(),
  tags: z.array(z.string()).default([]),
  links: z.array(z.object({ url: z.string(), label: z.string() })).default([]),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const { title, description, date_of_work, project, impact, tags, links } = parsed.data

  const { data: entry, error } = await supabase
    .from('entries')
    .insert({ user_id: user.id, title, description: description || null, date_of_work, project: project || null, impact: impact || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (tags.length > 0) {
    await supabase.from('entry_tags').insert(tags.map(tag => ({ entry_id: entry.id, tag })))
  }

  const validLinks = links.filter(l => l.url.trim())
  if (validLinks.length > 0) {
    await supabase.from('entry_links').insert(
      validLinks.map(l => ({ entry_id: entry.id, url: l.url, label: l.label || null }))
    )
  }

  return NextResponse.json(entry, { status: 201 })
}
