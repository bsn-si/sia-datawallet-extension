declare const __DEV__: boolean
/** Extension name, defined in packageJson.name */
declare const __NAME__: string

declare module '*.vue' {
  const component: any
  export default component
}

interface ImportMeta {
  env: {
    BASE_URL: string
    VITE_API_HOST: string,
    VITE_SIG_V2_SYMMETRIC: string,
    VITE_SIG_V2_ASYMMETRIC: string,
    VITE_SUBSCRIPTION_PAY_ADDRESS: string,
    VITE_SUBSCRIPTION_SMALL: string,
    VITE_SUBSCRIPTION_MEDIUM: string,
    VITE_SUBSCRIPTION_LARGE: string,
  }
}
