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
    VITE_API_HOST: string
  }
}
