import { createClient } from '@/lib/supabase/server'

export async function getAllTags(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('entry_tags')
    .select('tag')
    .order('tag')

  if (error) return []

  const unique = [...new Set((data ?? []).map(r => r.tag as string))]
  return unique.sort()
}

export async function getAllProjects(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('entries')
    .select('project')
    .not('project', 'is', null)
    .order('project')

  if (error) return []

  const unique = [...new Set((data ?? []).map(r => r.project as string).filter(Boolean))]
  return unique.sort()
}
