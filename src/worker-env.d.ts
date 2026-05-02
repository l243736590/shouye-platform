type D1Result<T = unknown> = {
  results?: T[]
  success: boolean
  error?: string
  meta: unknown
}

type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = unknown>(): Promise<T | null>
  all<T = unknown>(): Promise<D1Result<T>>
  run(): Promise<D1Result>
}

type D1Database = {
  prepare(query: string): D1PreparedStatement
}

type Fetcher = {
  fetch(request: Request): Promise<Response>
}
