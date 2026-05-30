/**
 * Medusa Admin API 請求工具
 *
 * 本機 localhost:9000 → 同源 /admin/*
 * Vercel 後台 → 同源 /admin/*（由 vercel.json rewrite 轉到 Railway）
 * 切勿在瀏覽器直接 fetch Railway 網域，否則 Cookie 無法帶入 → 401
 */

export type AdminFetchDebug = {
  requestUrl: string
  apiBase: string
  hostname: string
  mode: "local-same-origin" | "vercel-proxy" | "custom-base"
  status?: number
  statusText?: string
  responsePreview?: string
  error?: string
}

export function getAdminApiBase(): string {
  if (typeof window === "undefined") {
    return ""
  }

  const host = window.location.hostname

  if (host === "localhost" || host === "127.0.0.1") {
    return ""
  }

  // Vercel 託管 Admin：一律走同源 + rewrite
  if (host.endsWith(".vercel.app")) {
    return ""
  }

  // 自訂網域若也走 Vercel Admin，可在此擴充
  if (host === "tangsong-backend.vercel.app") {
    return ""
  }

  const envBase =
    import.meta.env.VITE_MEDUSA_BACKEND_URL ||
    import.meta.env.MEDUSA_BACKEND_URL ||
    ""

  return envBase.replace(/\/$/, "")
}

export function resolveAdminUrl(endpoint: string): string {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  const base = getAdminApiBase()
  return base ? `${base}${path}` : path
}

export async function adminFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ response: Response; data: unknown; debug: AdminFetchDebug }> {
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "unknown"
  const apiBase = getAdminApiBase()
  const requestUrl = resolveAdminUrl(endpoint)

  let mode: AdminFetchDebug["mode"] = "custom-base"
  if (!apiBase) {
    mode =
      hostname === "localhost" || hostname === "127.0.0.1"
        ? "local-same-origin"
        : "vercel-proxy"
  }

  const debug: AdminFetchDebug = {
    requestUrl,
    apiBase: apiBase || "(同源)",
    hostname,
    mode,
  }

  console.group(`🔍 [adminFetch] ${options.method || "GET"} ${requestUrl}`)
  console.log("模式:", mode)
  console.log("Host:", hostname)

  try {
    const response = await fetch(requestUrl, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body instanceof FormData
          ? options.headers
          : { "Content-Type": "application/json", ...options.headers }),
      },
    })

    const text = await response.text()
    debug.status = response.status
    debug.statusText = response.statusText
    debug.responsePreview = text.slice(0, 300)

    console.log("狀態:", response.status, response.statusText)
    console.log("回應預覽:", debug.responsePreview)

    if (!response.ok) {
      debug.error = text
      console.groupEnd()
      throw new AdminFetchError(
        `HTTP ${response.status}: ${text.slice(0, 200)}`,
        debug
      )
    }

    const data = text ? JSON.parse(text) : null
    console.groupEnd()
    return { response, data, debug }
  } catch (err) {
    if (err instanceof AdminFetchError) {
      throw err
    }
    const message = err instanceof Error ? err.message : String(err)
    debug.error = message
    console.error("網路錯誤:", message)
    console.groupEnd()
    throw new AdminFetchError(message, debug)
  }
}

export class AdminFetchError extends Error {
  debug: AdminFetchDebug

  constructor(message: string, debug: AdminFetchDebug) {
    super(message)
    this.name = "AdminFetchError"
    this.debug = debug
  }
}

export async function adminUpload(file: File): Promise<string | undefined> {
  const formData = new FormData()
  formData.append("files", file)
  const { data } = await adminFetch("/admin/uploads", {
    method: "POST",
    body: formData,
  })
  const payload = data as {
    files?: { url?: string }[]
    uploads?: { url?: string }[]
  }
  return payload.files?.[0]?.url || payload.uploads?.[0]?.url
}

export function formatAdminFetchError(err: unknown): string {
  if (err instanceof AdminFetchError) {
    const d = err.debug
    const lines = [
      `請求: ${d.requestUrl}`,
      `模式: ${d.mode}`,
      `Host: ${d.hostname}`,
    ]
    if (d.status != null) {
      lines.push(`狀態: ${d.status} ${d.statusText || ""}`.trim())
    }
    if (d.responsePreview) {
      lines.push(`回應: ${d.responsePreview}`)
    }
    if (d.status === 401) {
      lines.push(
        "提示: 401 通常是 Admin 未登入，或 Vercel/Railway CORS、backendUrl 設定錯誤。請確認已登入，且 Railway 的 ADMIN_CORS 包含 https://tangsong-backend.vercel.app"
      )
    }
    return lines.join("\n")
  }
  if (err instanceof Error) {
    return err.message
  }
  return String(err)
}
