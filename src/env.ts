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
  // API_HOST: import.meta.env.VITE_API_HOST || '',
  // API_HOST: 'http://localhost:9880' || '',
  API_HOST: 'http://localhost:3000' || '',
}
