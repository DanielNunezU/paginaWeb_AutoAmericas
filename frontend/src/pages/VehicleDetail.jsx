import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'

const VehicleDetail = () => {
  const { slug } = useParams()
  const [vehicle, setVehicle] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchVehicle()
  }, [slug])

  const fetchVehicle = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/vehicles/${slug}`)
      setVehicle(response.data)
      if (response.data.images && response.data.images.length > 0) {
        setSelectedImage(response.data.images[0].image_url)
      }
      setError(null)
    } catch (err) {
      setError('Vehículo no encontrado')
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

  // Lista de asesores para sorteo aleatorio
  const asesores = [
    '573133490087',
    '573209669384',
    '573106440913',
    '573144018594',
    '573133473617',
    '573203866321',
    '573112371347'
  ]

  // Función para obtener un asesor aleatorio y abrir WhatsApp
  const handleWhatsAppClick = () => {
    const asesorAleatorio = asesores[Math.floor(Math.random() * asesores.length)]
    const mensaje = encodeURIComponent(`Hola, estoy interesado en el vehículo: ${vehicle?.title || 'vehículo'}`)
    const url = `https://api.whatsapp.com/send?phone=${asesorAleatorio}&text=${mensaje}`
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
        <Link to="/" className="text-blue-600 hover:underline">
          ← Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <Link to="/" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Volver al listado
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Galería de imágenes */}
            <div>
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={vehicle.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-8xl">🚗</span>
                  </div>
                )}
              </div>

              {vehicle.images && vehicle.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {vehicle.images.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(image.image_url)}
                      className={`aspect-video bg-gray-200 rounded-lg overflow-hidden border-2 ${
                        selectedImage === image.image_url
                          ? 'border-blue-600'
                          : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image.image_url}
                        alt={`${vehicle.title} - imagen ${image.id}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Información del vehículo */}
            <div>
              <h1 className="text-4xl font-bold mb-4 text-gray-800">
                {vehicle.title}
              </h1>

              <div className="text-3xl font-bold text-blue-600 mb-6">
                {formatPrice(vehicle.price)}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-600 text-sm mb-1">Marca</div>
                  <div className="font-semibold text-lg">{vehicle.brand}</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-600 text-sm mb-1">Modelo</div>
                  <div className="font-semibold text-lg">{vehicle.model}</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-600 text-sm mb-1">Año</div>
                  <div className="font-semibold text-lg">{vehicle.year}</div>
                </div>

                {vehicle.mileage && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 text-sm mb-1">Kilometraje</div>
                    <div className="font-semibold text-lg">
                      {vehicle.mileage.toLocaleString()} km
                    </div>
                  </div>
                )}

                {vehicle.transmission && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 text-sm mb-1">Transmisión</div>
                    <div className="font-semibold text-lg">{vehicle.transmission}</div>
                  </div>
                )}

                {vehicle.fuel_type && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 text-sm mb-1">Combustible</div>
                    <div className="font-semibold text-lg">{vehicle.fuel_type}</div>
                  </div>
                )}

                {vehicle.color && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 text-sm mb-1">Color</div>
                    <div className="font-semibold text-lg">{vehicle.color}</div>
                  </div>
                )}

                {vehicle.engine && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 text-sm mb-1">Motor</div>
                    <div className="font-semibold text-lg">{vehicle.engine}</div>
                  </div>
                )}

                {vehicle.load_capacity && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 text-sm mb-1">Capacidad de Carga</div>
                    <div className="font-semibold text-lg">{vehicle.load_capacity}</div>
                  </div>
                )}
              </div>

              {vehicle.features && (
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-3 text-gray-800">
                    Características
                  </h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {vehicle.features}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3 text-blue-900">
                  ¿Interesado en este vehículo?
                </h3>
                <p className="text-blue-800 mb-4">
                  Contáctanos para más información o para agendar una prueba de manejo.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleWhatsAppClick}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-center cursor-pointer"
                  >
                    💬 WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default VehicleDetail
