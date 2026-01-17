import { useState, useEffect } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import axios from 'axios'

const Home = () => {
  const [vehicles, setVehicles] = useState([])
  const [filteredVehicles, setFilteredVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const [randomSeed, setRandomSeed] = useState(Date.now())
  const [sortOrder, setSortOrder] = useState('default')

  // Actualizar seed cada vez que se hace clic en inicio/logo para mostrar vehículos diferentes
  useEffect(() => {
    setRandomSeed(Date.now())
  }, [location.state])

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    const marca = searchParams.get('marca')
    const categoria = searchParams.get('categoria')
    const busqueda = searchParams.get('busqueda')

    let filtered = vehicles

    // Filtrar por categoría si existe
    if (categoria) {
      filtered = filtered.filter(v =>
        v.category && v.category.toLowerCase() === categoria.toLowerCase()
      )
    }

    // Filtrar por marca si existe
    if (marca) {
      filtered = filtered.filter(v =>
        v.brand.toLowerCase() === marca.toLowerCase()
      )
    }

    // Filtrar por búsqueda si existe
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  const marca = searchParams.get('marca')
  const categoria = searchParams.get('categoria')
  const busqueda = searchParams.get('busqueda')

  // Función para ordenar vehículos
  const sortVehicles = (vehicleList) => {
    if (sortOrder === 'price_asc') {
      return [...vehicleList].sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
    } else if (sortOrder === 'price_desc') {
      return [...vehicleList].sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
    }
    return vehicleList
  }

  // Si no hay filtros, mostrar solo 6 vehículos aleatorios (uno de cada categoría si es posible)
  // Se usa randomSeed para forzar recálculo al hacer clic en inicio/logo
  const getDisplayVehicles = () => {
    // Usar randomSeed para que React detecte el cambio y recalcule
    const _ = randomSeed
    const hasFilter = marca || categoria || busqueda

    // Si hay ordenamiento activo, aplicarlo a todos los vehículos filtrados
    if (sortOrder !== 'default') {
      return sortVehicles(filteredVehicles)
    }

    if (hasFilter) {
      return filteredVehicles
    }

    // Función para mezclar array aleatoriamente (Fisher-Yates shuffle)
    const shuffleArray = (array) => {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    }

    // Mezclar vehículos aleatoriamente
    const shuffledVehicles = shuffleArray(filteredVehicles)

    // Sin filtros: seleccionar uno aleatorio de cada categoría
    const categories = ['carro', 'moto', 'carga', 'maquinaria']
    const selected = []

    // Primero agregar uno aleatorio de cada categoría
    categories.forEach(cat => {
      const vehicleOfCategory = shuffledVehicles.find(
        v => v.category === cat && !selected.includes(v)
      )
      if (vehicleOfCategory) {
        selected.push(vehicleOfCategory)
      }
    })

    // Completar hasta 6 con vehículos aleatorios restantes
    shuffledVehicles.forEach(v => {
      if (selected.length < 6 && !selected.includes(v)) {
        selected.push(v)
      }
    })

    return selected.slice(0, 6)
  }

  const displayVehicles = getDisplayVehicles()

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
    return 'Vehículos Disponibles'
  }

  const hasFilter = marca || categoria || busqueda

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center bg-no-repeat text-white py-24 md:py-32 lg:py-40"
        style={{ backgroundImage: "url('/images/fondo.jpeg')" }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <p className="text-2xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
            Encuentra el vehículo perfecto para ti
          </p>
          <p className="text-lg md:text-2xl mt-4 text-gray-100 drop-shadow-md">
            Calidad garantizada y precios competitivos
          </p>
        </div>
      </div>

      {/* Vehículos disponibles */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            {getPageTitle()}
          </h2>
          <div className="flex items-center gap-4">
            {/* Filtro de ordenamiento por precio */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 cursor-pointer"
            >
              <option value="default">Ordenar por precio</option>
              <option value="price_asc">Menor a mayor precio</option>
              <option value="price_desc">Mayor a menor precio</option>
            </select>
            {hasFilter && (
              <Link
                to="/"
                className="text-amber-600 hover:text-amber-800 font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar filtros
              </Link>
            )}
          </div>
        </div>

        {displayVehicles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚗</div>
            <p className="text-xl text-gray-600">
              {hasFilter
                ? `No hay vehículos disponibles con los filtros seleccionados`
                : 'No hay vehículos disponibles en este momento'
              }
            </p>
            {hasFilter && (
              <Link to="/" className="text-red-600 hover:underline mt-4 inline-block">
                Ver todos los vehículos
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayVehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                to={`/vehiculo/${vehicle.slug}`}
                className="card hover:scale-105 transition-transform duration-300"
              >
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  {vehicle.primary_image ? (
                    <img
                      src={vehicle.primary_image}
                      alt={vehicle.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-6xl">🚗</span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-800">
                    {vehicle.title}
                  </h3>

                  <div className="flex items-center gap-2 mb-2 text-gray-600">
                    <span className="font-semibold">{vehicle.brand}</span>
                    <span>•</span>
                    <span>{vehicle.model}</span>
                    <span>•</span>
                    <span>{vehicle.year}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {vehicle.transmission && (
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                        {vehicle.transmission}
                      </span>
                    )}
                    {vehicle.fuel_type && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {vehicle.fuel_type}
                      </span>
                    )}
                    {vehicle.mileage && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        {vehicle.mileage.toLocaleString()} km
                      </span>
                    )}
                  </div>

                  <div className="text-2xl font-bold text-amber-600">
                    {formatPrice(vehicle.price)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Botón Ver todos los vehículos (solo cuando no hay filtros y hay más vehículos) */}
        {!hasFilter && filteredVehicles.length > 6 && (
          <div className="text-center mt-10">
            <Link
              to="/vehiculos"
              className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300"
            >
              Ver todos los vehículos
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
