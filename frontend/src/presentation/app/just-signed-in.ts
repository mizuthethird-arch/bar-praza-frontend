// The navigation state the sign-in screen sends with the first page after a successful login.
export function justSignedIn(state: unknown): boolean {
  return (state as { arrived?: boolean } | null)?.arrived === true
}
