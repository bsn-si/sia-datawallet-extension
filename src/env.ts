const forbiddenProtocols = [
  'chrome-extension://',
  'chrome-search://',
  'chrome://',
  'devtools://',
  'edge://',
  'https://chrome.google.com/webstore',
]

export function isForbiddenUrl(url: string): boolean {
  return forbiddenProtocols.some(protocol => url.startsWith(protocol))
}

export const isFirefox = navigator.userAgent.includes('Firefox')

export const CONFIG = {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  API_HOST: import.meta.env.VITE_API_HOST || '',
  SIG_V2_SYMMETRIC: import.meta.env.VITE_SIG_V2_SYMMETRIC,
  SIG_V2_ASYMMETRIC: import.meta.env.VITE_SIG_V2_ASYMMETRIC,
  SMALL_PRICE_LABEL: import.meta.env.VITE_SMALL_PRICE_LABEL,
  SMALL_VOL_LABEL: import.meta.env.VITE_SMALL_VOL_LABEL,
  MEDIUM_PRICE_LABEL: import.meta.env.VITE_MEDIUM_PRICE_LABEL,
  MEDIUM_VOL_LABEL: import.meta.env.VITE_MEDIUM_VOL_LABEL,
  LARGE_PRICE_LABEL: import.meta.env.VITE_LARGE_PRICE_LABEL,
  LARGE_VOL_LABEL: import.meta.env.VITE_LARGE_VOL_LABEL,
  SMALL_PLAN_LIMIT: import.meta.env.VITE_SMALL_PLAN_LIMIT,
  MEDIUM_PLAN_LIMIT: import.meta.env.VITE_MEDIUM_PLAN_LIMIT,
  LARGE_PLAN_LIMIT: import.meta.env.VITE_LARGE_PLAN_LIMIT,
}
