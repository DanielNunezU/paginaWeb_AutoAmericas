import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const Home = () => {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchVehicles()
  }, [])

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
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
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

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Bienvenido a AutoAmericas</h1>
          <p className="text-xl text-blue-100">
            Encuentra el vehículo perfecto para ti. Calidad garantizada y precios competitivos.
          </p>
        </div>
      </div>

      {/* Vehículos disponibles */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Vehículos Disponibles</h2>

        {vehicles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚗</div>
            <p className="text-xl text-gray-600">
              No hay vehículos disponibles en este momento
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((vehicle) => (
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
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
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

                  <div className="text-2xl font-bold text-blue-600">
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

export default Home
