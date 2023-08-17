declare global {
  namespace NodeJS {
    interface ProcessEnv {
      outputDir?: string
      levelIdx?: string
      seed?: string
      version?: string
      calculateLighting?: string
      mode?: string
    }
  }
}

export {}
