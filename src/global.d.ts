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
    VITE_SMALL_PRICE: string,
    VITE_SMALL_VOL_LABEL: string,
    VITE_MEDIUM_PRICE: string,
    VITE_MEDIUM_VOL_LABEL: string,
    VITE_LARGE_PRICE: string,
    VITE_LARGE_VOL_LABEL: string,
    VITE_SMALL_PLAN_LIMIT: string,
    VITE_MEDIUM_PLAN_LIMIT: string,
    VITE_LARGE_PLAN_LIMIT: string,
  }
}
