import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { fetchProductById, updateProduct } from '../services/products'
import type { UpdateProductPayload } from '../services/products'

const CATEGORIES = [
  { value: 'casual', label: 'Casual' },
  { value: 'deportivo', label: 'Deportivo' },
  { value: 'formal', label: 'Formal' },
] as const

export default function AdminEditProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState<UpdateProductPayload['category']>('casual')
  const [imageUrl, setImageUrl] = useState('')
  const [active, setActive] = useState(true)
  const [inventory, setInventory] = useState<{ size: string; quantity: string }[]>([
    { size: '', quantity: '' },
  ])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/iniciar-sesion', { replace: true })
      return
    }
    if (user.role !== 'ADMIN') {
      navigate('/', { replace: true })
      return
    }
  }, [user, navigate])

  useEffect(() => {
    if (!id || !user || user.role !== 'ADMIN') return
    setLoading(true)
    setError(null)
    fetchProductById(id)
      .then((product) => {
        if (!product) {
          setError('Producto no encontrado')
          return
        }
        setName(product.name)
        setDescription(product.description ?? '')
        setPrice(String(product.price))
        setCategory(product.category as UpdateProductPayload['category'])
        setImageUrl(product.imageUrl ?? '')
        setActive(product.active)
        if (product.inventory?.length) {
          setInventory(
            product.inventory.map((i) => ({ size: i.size, quantity: String(i.quantity) }))
          )
        } else {
          setInventory([{ size: '', quantity: '' }])
        }
      })
      .catch(() => setError('Error al cargar el producto'))
      .finally(() => setLoading(false))
  }, [id, user])

  const addInventoryRow = () => {
    setInventory((prev) => [...prev, { size: '', quantity: '' }])
  }

  const removeInventoryRow = (index: number) => {
    setInventory((prev) => prev.filter((_, i) => i !== index))
  }

  const updateInventoryRow = (index: number, field: 'size' | 'quantity', value: string) => {
    setInventory((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!id) return
    setError(null)
    const trimmedName = name.trim()
    const priceNum = parseFloat(price.replace(/,/g, '.'))
    if (!trimmedName) {
      setError('El nombre es obligatorio')
      return
    }
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError('El precio debe ser un número válido mayor o igual a 0')
      return
    }
    const inv = inventory
      .filter((row) => row.size.trim() && row.quantity.trim())
      .map((row) => ({
        size: row.size.trim(),
        quantity: Math.max(0, parseInt(row.quantity, 10) || 0),
      }))
    setSaving(true)
    try {
      await updateProduct(id, {
        name: trimmedName,
        description: description.trim() || null,
        price: priceNum,
        category,
        imageUrl: imageUrl.trim() || null,
        active,
        inventory: inv,
      })
      toast.success('Producto actualizado')
      navigate(`/productos/${id}`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el producto')
      toast.error(err instanceof Error ? err.message : 'Error al actualizar')
    } finally {
      setSaving(false)
    }
  }

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-6 bg-neutral-200 rounded w-32 animate-pulse mb-8" />
        <div className="space-y-4">
          <div className="h-12 bg-neutral-200 rounded animate-pulse" />
          <div className="h-12 bg-neutral-200 rounded animate-pulse" />
          <div className="h-12 bg-neutral-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (error && !name) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-neutral-600 mb-4">{error}</p>
        <Link to="/dashboard" className="text-blue-600 hover:underline">
          Volver al dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to={`/productos/${id}`} className="text-neutral-600 hover:text-neutral-900 text-sm mb-6 inline-block">
        ← Volver al producto
      </Link>
      <h1 className="text-2xl font-bold text-neutral-900 mb-8">Editar producto</h1>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            placeholder="Ej: Zapatilla deportiva X"
            disabled={saving}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Descripción (opcional)
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            placeholder="Descripción del producto"
            disabled={saving}
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Precio (COP) <span className="text-red-500">*</span>
          </label>
          <input
            id="price"
            type="text"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            placeholder="Ej: 199900"
            disabled={saving}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as UpdateProductPayload['category'])}
            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            disabled={saving}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-neutral-700 mb-1.5">
            URL de imagen (opcional)
          </label>
          <input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            placeholder="https://..."
            disabled={saving}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="active"
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
            disabled={saving}
          />
          <label htmlFor="active" className="text-sm font-medium text-neutral-700">
            Producto visible en catálogo
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-neutral-700">
              Inventario por talla
            </label>
            <button
              type="button"
              onClick={addInventoryRow}
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              + Añadir talla
            </button>
          </div>
          <div className="space-y-2">
            {inventory.map((row, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={row.size}
                  onChange={(e) => updateInventoryRow(index, 'size', e.target.value)}
                  placeholder="Talla (ej. 38)"
                  className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  disabled={saving}
                />
                <input
                  type="number"
                  min={0}
                  value={row.quantity}
                  onChange={(e) => updateInventoryRow(index, 'quantity', e.target.value)}
                  placeholder="Cantidad"
                  className="w-24 px-3 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={() => removeInventoryRow(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                  aria-label="Quitar fila"
                  disabled={saving || inventory.length === 1}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Al guardar, el inventario se reemplaza por completo con las tallas indicadas.
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <Link
            to={`/productos/${id}`}
            className="px-6 py-3 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
