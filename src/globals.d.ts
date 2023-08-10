declare global {
  namespace NodeJS {
    interface ProcessEnv {
      outputDir?: string
      levelIdx?: string
      seed?: string
    }
  }
}

export {}
