import { Modules } from "@medusajs/framework/utils"

type PrimaryStore = {
  id: string
  metadata?: Record<string, unknown> | null
  updated_at?: string | Date | null
}

export async function getPrimaryStore(scope: {
  resolve: (key: string) => unknown
}): Promise<PrimaryStore | null> {
  try {
    const query = scope.resolve("query") as {
      graph: (input: {
        entity: string
        fields: string[]
      }) => Promise<{ data: PrimaryStore[] }>
    }

    const { data: stores } = await query.graph({
      entity: "store",
      fields: ["id", "metadata", "updated_at"],
    })

    if (stores?.[0]) {
      return stores[0]
    }
  } catch {
    // fallback below
  }

  const storeModule = scope.resolve(Modules.STORE) as {
    listStores: (
      filters: Record<string, unknown>,
      config: { select: string[] }
    ) => Promise<PrimaryStore[]>
  }

  const stores = await storeModule.listStores(
    {},
    { select: ["id", "metadata", "updated_at"] }
  )

  return stores?.[0] ?? null
}
