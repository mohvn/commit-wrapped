const USERNAME_RE =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/

export function parseGithubInput(raw: string): string | null {
  const input = raw.trim()
  if (!input) return null

  try {
    const withProtocol = input.includes("://") ? input : `https://${input}`
    const url = new URL(withProtocol)
    if (
      url.hostname === "github.com" ||
      url.hostname === "www.github.com"
    ) {
      const segment = url.pathname.split("/").filter(Boolean)[0]
      if (segment && USERNAME_RE.test(segment)) return segment
    }
  } catch {
    // Not a URL — treat as a nickname.
  }

  const nick = input.replace(/^@/, "")
  if (USERNAME_RE.test(nick)) return nick
  return null
}
