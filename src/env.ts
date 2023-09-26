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
}
