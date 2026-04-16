export type Entry = {
  id: string
  user_id: string
  title: string
  description: string | null
  date_of_work: string
  project: string | null
  impact: string | null
  visibility: 'private' | 'manager'
  created_at: string
  updated_at: string
  tags?: string[]
  links?: EntryLink[]
  files?: EntryFile[]
}

export type EntryLink = {
  id: string
  entry_id: string
  url: string
  label: string | null
}

export type EntryFile = {
  id: string
  entry_id: string
  storage_path: string
  original_filename: string
  mime_type: string | null
  file_size: number | null
}

export type EntryFilters = {
  search?: string
  project?: string
  tags?: string[]
  dateFrom?: string
  dateTo?: string
}

export type EntryFormData = {
  title: string
  description?: string
  date_of_work: string
  project?: string
  impact?: string
  tags: string[]
  links: { url: string; label: string }[]
}

export type ExportFormat = 'bullets' | 'structured' | 'timeline'
