export type ContributionLevel = 0 | 1 | 2 | 3 | 4

export type ContributionDay = {
  date: string
  count: number
  level: ContributionLevel
}

export type YearWrapped = {
  year: number
  total: number
  activeDays: number
  days: ContributionDay[]
}

export type WrappedUser = {
  login: string
  name: string
  bio: string
  avatarDataUrl: string
  followers: number
  following: number
  createdAt: string
  yearsOnGitHub: number
  totalCommits: number
}

export type WrappedPayload = {
  user: WrappedUser
  years: YearWrapped[]
}
