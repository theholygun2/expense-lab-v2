import { useEffect } from "react"
import { api } from "@/lib/api"

export default function App() {
  useEffect(() => {
   api.transactions.$get({ query: {} })
  .then(r => {
    if (!r.ok) throw new Error("Failed to fetch transactions")
    return r.json()
  })
  .then(console.log)
  }, [])

  return <div>check console</div>
}