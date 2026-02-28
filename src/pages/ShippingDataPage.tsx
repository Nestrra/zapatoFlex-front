import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { getMe, updateProfile } from '../services/auth'

export default function ShippingDataPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const from = searchParams.get('from') || '/carrito'
  const { user, setUser } = useAuth()

  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    getMe()
      .then((profile) => {
        setAddress(profile.address ?? '')
        setPhone(profile.phone ?? '')
      })
      .catch(() => setError('No se pudo cargar el perfil'))
      .finally(() => setLoading(false))
  }, [user])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedAddress = address.trim()
    if (!trimmedAddress) {
      toast.error('La dirección de envío es obligatoria')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const updated = await updateProfile({
        address: trimmedAddress || null,
        phone: phone.trim() || null,
      })
      setUser(updated)
      toast.success('Datos de envío guardados')
      navigate(from, { replace: true })
    } catch {
      setError('Error al guardar. Intenta de nuevo.')
      toast.error('Error al guardar los datos')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <p className="text-neutral-600 mb-4">Inicia sesión para gestionar tus datos de envío.</p>
        <Link to="/iniciar-sesion" className="text-blue-600 hover:underline">
          Iniciar sesión
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="h-10 bg-neutral-200 rounded animate-pulse w-1/3 mb-8" />
        <div className="space-y-4">
          <div className="h-12 bg-neutral-200 rounded animate-pulse" />
          <div className="h-12 bg-neutral-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">Datos de envío</h1>
      <p className="text-neutral-600 text-sm mb-8">
        Completa tu dirección y teléfono para poder realizar tu pedido.
      </p>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Dirección de envío <span className="text-red-500">*</span>
          </label>
          <textarea
            id="address"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            placeholder="Calle, número, barrio, ciudad"
            disabled={saving}
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Teléfono (opcional)
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            placeholder="Ej: 300 123 4567"
            disabled={saving}
          />
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
          <Link
            to={from}
            className="px-6 py-3 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
