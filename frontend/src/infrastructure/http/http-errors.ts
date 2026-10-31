// Every error body from the backend is { "error": code }. Anything else leaves the code unknown.
export async function errorCode(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.json()) as { error?: unknown }
    return typeof body.error === 'string' ? body.error : undefined
  } catch {
    return undefined
  }
}
