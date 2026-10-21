import { getWrapped } from "@/lib/github"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params
  const result = await getWrapped(decodeURIComponent(username))

  if (!result.ok) {
    return Response.json({ message: result.message }, { status: result.status })
  }

  return Response.json(result.data)
}
