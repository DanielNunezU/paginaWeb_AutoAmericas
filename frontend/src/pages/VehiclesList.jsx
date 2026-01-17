import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'

const VehiclesList = () => {
  const [vehicles, setVehicles] = useState([])
  const [filteredVehicles, setFilteredVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    const marca = searchParams.get('marca')
    const categoria = searchParams.get('categoria')
    const busqueda = searchParams.get('busqueda')

    let filtered = vehicles

    if (categoria) {
      filtered = filtered.filter(v =>
        v.category && v.category.toLowerCase() === categoria.toLowerCase()
      )
    }

    if (marca) {
      filtered = filtered.filter(v =>
        v.brand.toLowerCase() === marca.toLowerCase()
      )
    }

    if (busqueda) {
      const searchLower = busqueda.toLowerCase()
      filtered = filtered.filter(v => {
        return (
          (v.title && v.title.toLowerCase().includes(searchLower)) ||
          (v.brand && v.brand.toLowerCase().includes(searchLower)) ||
          (v.model && v.model.toLowerCase().includes(searchLower)) ||
          (v.year && v.year.toString().includes(searchLower)) ||
          (v.color && v.color.toLowerCase().includes(searchLower)) ||
          (v.description && v.description.toLowerCase().includes(searchLower))
        )
      })
    }

    setFilteredVehicles(filtered)
  }, [searchParams, vehicles])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/vehicles')
      setVehicles(response.data)
      setError(null)
    } catch (err) {
      setError('Error al cargar los vehículos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 bg-gray-900 min-h-screen">
        <div className="bg-red-900/50 border border-red-600 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  const marca = searchParams.get('marca')
  const categoria = searchParams.get('categoria')
  const busqueda = searchParams.get('busqueda')

  const getCategoryLabel = (cat) => {
    if (cat === 'carro') return 'Carros y Camionetas'
    if (cat === 'moto') return 'Motos'
    if (cat === 'carga') return 'Carga Pesada'
    if (cat === 'maquinaria') return 'Maquinaria Amarilla'
    return ''
  }

  const getPageTitle = () => {
    if (busqueda) {
      return `Resultados de búsqueda: "${busqueda}"`
    }
    if (marca && categoria) {
      return `${marca} - ${getCategoryLabel(categoria)}`
    }
    if (marca) {
      return `Vehículos ${marca}`
    }
    if (categoria) {
      return getCategoryLabel(categoria)
    }
    return 'Todos los Vehículos'
  }

  const hasFilter = marca || categoria || busqueda

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-yellow-500">
            {getPageTitle()}
          </h2>
          <div className="flex gap-4">
            {hasFilter && (
              <Link
                to="/vehiculos"
                className="text-yellow-500 hover:text-yellow-400 font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar filtros
              </Link>
            )}
            <Link
              to="/"
              className="text-yellow-500 hover:text-yellow-400 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio
            </Link>
          </div>
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚗</div>
            <p className="text-xl text-gray-300">
              {hasFilter
                ? `No hay vehículos disponibles con los filtros seleccionados`
                : 'No hay vehículos disponibles en este momento'
              }
            </p>
            {hasFilter && (
              <Link to="/vehiculos" className="text-yellow-500 hover:underline mt-4 inline-block">
                Ver todos los vehículos
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                to={`/vehiculo/${vehicle.slug}`}
                className="bg-gray-800 border border-yellow-600/30 rounded-lg overflow-hidden hover:border-yellow-500 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <div className="aspect-video bg-gray-700 overflow-hidden">
                  {vehicle.primary_image ? (
                    <img
                      src={vehicle.primary_image}
                      alt={vehicle.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <span className="text-6xl">🚗</span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-100">
                    {vehicle.title}
                  </h3>

                  <div className="flex items-center gap-2 mb-2 text-gray-400">
                    <span className="font-semibold">{vehicle.brand}</span>
                    <span>•</span>
                    <span>{vehicle.model}</span>
                    <span>•</span>
                    <span>{vehicle.year}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {vehicle.transmission && (
                      <span className="px-3 py-1 bg-yellow-600/20 text-yellow-500 rounded-full text-sm border border-yellow-600/30">
                        {vehicle.transmission}
                      </span>
                    )}
                    {vehicle.fuel_type && (
                      <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm border border-green-600/30">
                        {vehicle.fuel_type}
                      </span>
                    )}
                    {vehicle.mileage && (
                      <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm border border-gray-600">
                        {vehicle.mileage.toLocaleString()} km
                      </span>
                    )}
                  </div>

                  <div className="text-2xl font-bold text-yellow-500">
                    {formatPrice(vehicle.price)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VehiclesList
