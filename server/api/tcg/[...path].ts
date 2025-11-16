/**
 * Pokemon TCG API Proxy
 *
 * Resolves CORS issues by proxying requests through the server
 * Uses axios for better connection handling
 */

import https from 'node:https'
import axios from 'axios'

// Create axios instance with custom config
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 3000,
    maxSockets: 50,
    maxFreeSockets: 10,
    timeout: 60000,
    rejectUnauthorized: true,
  }),
  timeout: 30000,
  headers: {
    'User-Agent': 'Nuxt-Pokemon-TCG-App/1.0',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate',
  },
})

async function fetchWithRetry(url: string, headers: Record<string, string>, params: Record<string, unknown>, retries = 3): Promise<unknown> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axiosInstance.get(url, {
        headers,
        params,
      })
      return response.data
    }
    catch (error: unknown) {
      const err = error as { code?: string, message?: string }
      const isLastRetry = i === retries - 1
      const isNetworkError = err.code === 'ECONNRESET'
        || err.code === 'ETIMEDOUT'
        || err.code === 'ECONNABORTED'
        || err.message?.includes('timeout')

      if (isLastRetry || !isNetworkError) {
        throw error
      }

      // Wait before retry with exponential backoff
      const delay = Math.min(1000 * (2 ** i), 5000)
      console.log(`[TCG API Proxy] Retry ${i + 1}/${retries} after ${delay}ms (${err.code || err.message})`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const path = event.context.params?.path || ''
  const query = getQuery(event)

  const url = `https://api.pokemontcg.io/v2/${path}`

  try {
    const headers: Record<string, string> = {}

    // Only add API key if it's configured
    if (config.public.pokemonTcgApiKey && config.public.pokemonTcgApiKey !== 'your_api_key_here') {
      headers['X-Api-Key'] = config.public.pokemonTcgApiKey as string
    }

    const data = await fetchWithRetry(url, headers, query)
    return data
  }
  catch (error: unknown) {
    const err = error as { message?: string, code?: string, response?: { status?: number, statusText?: string, data?: { message?: string } } }
    console.error('[TCG API Proxy] Error:', {
      message: err?.message,
      code: err?.code,
      status: err?.response?.status,
      statusText: err?.response?.statusText,
      url,
    })

    const statusCode = err?.response?.status || 500
    const message = err?.response?.data?.message
      || err?.message
      || 'Failed to fetch from Pokemon TCG API'

    throw createError({
      statusCode,
      message,
    })
  }
})
