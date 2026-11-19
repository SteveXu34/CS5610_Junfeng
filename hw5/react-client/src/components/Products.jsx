
import { useState, useEffect } from 'react'

const API_BASE = 'https://cs-5610-junfeng-hw4-server.vercel.app'

function Products() {
  // Store products returned from FastAPI.
  const [products, setProducts] = useState([])

  // Track loading and error states.
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch products when the component mounts.
  useEffect(() => {
    fetch(`${API_BASE}/products`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        return response.json()
      })
      .then(data => {
        // Update React state with product data.
        setProducts(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Handle loading, error, and empty states.
  if (loading) return <p>Loading products...</p>
  if (error) return <p>Error: {error}</p>
  if (products.length === 0) return <p>No products available.</p>

  // Render products from the database.
  return (
    <section>
      <h1>Products</h1>

      {products.map(product => (
        <article key={product.id}>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
        </article>
      ))}
    </section>
  )
}

export default Products
