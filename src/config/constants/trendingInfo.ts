export enum TrendingId {
  DEX = 1,
  CMCTRENDING,
  CMCRECENT,
  TWITTER,
  MIXED,
}

export interface TrendingInfo {
  readonly trendingName: string
  readonly logo: string
}

export type TrendingInfoMap = { readonly [trendingId: number]: TrendingInfo}

export const TRENDING_INFO: TrendingInfoMap = {
  [TrendingId.DEX]: {
    trendingName: 'Dextools',
    logo: "images/charts/dextoolsIcon.png"
  },
  [TrendingId.CMCTRENDING]: {
    trendingName: 'CMC Trending',
    logo: "images/charts/cmcIcon.png"
  },
  [TrendingId.CMCRECENT]: {
    trendingName: 'CMC Recent',
    logo: "images/charts/cmcIcon.png"
  },
  [TrendingId.TWITTER]: {
    trendingName: 'Twitter',
    logo: "images/charts/twitterIcon.png"
  },
  [TrendingId.MIXED]: {
    trendingName: 'Mixed',
    logo: "images/charts/mixedIcon.png"
  },
}

