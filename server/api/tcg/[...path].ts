/**
 * Pokemon TCG API Proxy
 *
 * Resolves CORS issues by proxying requests through the server
 * Uses axios for better connection handling
 */

import axios from 'axios'
import https from 'node:https'

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

async function fetchWithRetry(url: string, headers: Record<string, string>, params: any, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axiosInstance.get(url, {
        headers,
        params,
      })
      return response.data
    }
    catch (error: any) {
      const isLastRetry = i === retries - 1
      const isNetworkError = error.code === 'ECONNRESET'
        || error.code === 'ETIMEDOUT'
        || error.code === 'ECONNABORTED'
        || error.message?.includes('timeout')

      if (isLastRetry || !isNetworkError) {
        throw error
      }

      // Wait before retry with exponential backoff
      const delay = Math.min(1000 * (2 ** i), 5000)
      console.log(`[TCG API Proxy] Retry ${i + 1}/${retries} after ${delay}ms (${error.code || error.message})`)
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
  catch (error: any) {
    console.error('[TCG API Proxy] Error:', {
      message: error?.message,
      code: error?.code,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      url,
    })

    const statusCode = error?.response?.status || 500
    const message = error?.response?.data?.message
      || error?.message
      || 'Failed to fetch from Pokemon TCG API'

    throw createError({
      statusCode,
      message,
    })
  }
})
