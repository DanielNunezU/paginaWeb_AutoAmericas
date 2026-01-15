import { useState, useEffect } from 'react'
import axios from '../utils/axios'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FUEL_TYPES, TRANSMISSION_TYPES } from '../constants/vehicles'

const AdminDashboard = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    fuel_type: '',
    transmission: '',
    color: '',
    description: '',
    features: '',
    category: 'carro',
    status: 'available',
    load_capacity: '',
    engine: ''
  })
  const [images, setImages] = useState([])
  const [brands, setBrands] = useState([])
  const [allBrands, setAllBrands] = useState([])
  const [showBrandManager, setShowBrandManager] = useState(false)
  const [newBrandName, setNewBrandName] = useState('')
  const [newBrandCategory, setNewBrandCategory] = useState('carro')

  useEffect(() => {
    fetchVehicles()
    fetchAllBrands()
  }, [])

  useEffect(() => {
    fetchBrandsByCategory(formData.category)
  }, [formData.category])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      // En admin, traer TODOS los vehículos sin importar el estado
      const response = await axios.get('/api/vehicles?status=all')
      setVehicles(response.data)
    } catch (error) {
      console.error('Error al obtener vehículos:', error)
      alert('Error al cargar vehículos')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllBrands = async () => {
    try {
      const response = await axios.get('/api/brands')
      setAllBrands(response.data)
    } catch (error) {
      console.error('Error al obtener marcas:', error)
    }
  }

  const fetchBrandsByCategory = async (category) => {
    try {
      const response = await axios.get(`/api/brands?category=${category}`)
      setBrands(response.data)
    } catch (error) {
      console.error('Error al obtener marcas:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = new FormData()

      // Al editar, enviar TODOS los campos (incluso los vacíos)
      // Al crear nuevo, solo enviar campos con valor
      Object.keys(formData).forEach(key => {
        const value = formData[key]

        if (editingVehicle) {
          // Siempre enviar el campo cuando editamos
          data.append(key, value !== null && value !== undefined ? value : '')
        } else {
          // Solo enviar campos con valor cuando creamos
          if (value) {
            data.append(key, value)
          }
        }
      })

      images.forEach(image => {
        data.append('images', image)
      })

      if (editingVehicle) {
        await axios.put(`/api/vehicles/${editingVehicle.id}`, data)
        alert('Vehículo actualizado exitosamente')
      } else {
        await axios.post('/api/vehicles', data)
        alert('Vehículo creado exitosamente')
      }

      resetForm()
      fetchVehicles()
    } catch (error) {
      console.error('Error al guardar vehículo:', error)

      if (error.response?.status === 401) {
        alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.')
        logout()
        navigate('/admin')
      } else {
        alert(error.response?.data?.message || 'Error al guardar vehículo')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle)
    setFormData({
      title: vehicle.title,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price,
      mileage: vehicle.mileage || '',
      fuel_type: vehicle.fuel_type || '',
      transmission: vehicle.transmission || '',
      color: vehicle.color || '',
      description: vehicle.description || '',
      features: vehicle.features || '',
      category: vehicle.category || 'carro',
      status: vehicle.status,
      load_capacity: vehicle.load_capacity || '',
      engine: vehicle.engine || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este vehículo?')) return

    try {
      await axios.delete(`/api/vehicles/${id}`)
      alert('Vehículo eliminado exitosamente')
      fetchVehicles()
    } catch (error) {
      console.error('Error al eliminar vehículo:', error)

      if (error.response?.status === 401) {
        alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.')
        logout()
        navigate('/admin')
      } else {
        alert('Error al eliminar vehículo')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      price: '',
      mileage: '',
      fuel_type: '',
      transmission: '',
      color: '',
      description: '',
      features: '',
      category: 'carro',
      status: 'available',
      load_capacity: '',
      engine: ''
    })
    setImages([])
    setEditingVehicle(null)
    setShowForm(false)
  }

  const handleAddBrand = async (e) => {
    e.preventDefault()
    if (!newBrandName.trim()) return

    try {
      await axios.post('/api/brands', {
        name: newBrandName.trim(),
        category: newBrandCategory
      })
      alert('Marca agregada exitosamente')
      setNewBrandName('')
      fetchAllBrands()
      fetchBrandsByCategory(formData.category)
    } catch (error) {
      console.error('Error al agregar marca:', error)
      alert(error.response?.data?.message || 'Error al agregar marca')
    }
  }

  const handleDeleteBrand = async (brandId) => {
    if (!confirm('¿Estás seguro de eliminar esta marca?')) return

    try {
      await axios.delete(`/api/brands/${brandId}`)
      alert('Marca eliminada exitosamente')
      fetchAllBrands()
      fetchBrandsByCategory(formData.category)
    } catch (error) {
      console.error('Error al eliminar marca:', error)
      alert('Error al eliminar marca')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowBrandManager(!showBrandManager)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {showBrandManager ? 'Cerrar' : 'Gestionar Marcas'}
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
            >
              {showForm ? 'Cancelar' : '+ Nuevo Vehículo'}
            </button>
          </div>
        </div>

        {showBrandManager && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Gestionar Marcas</h2>

            {/* Formulario para agregar marca */}
            <form onSubmit={handleAddBrand} className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Agregar Nueva Marca</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Marca
                  </label>
                  <input
                    type="text"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    required
                    className="input-field"
                    placeholder="Ej: Tesla"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={newBrandCategory}
                    onChange={(e) => setNewBrandCategory(e.target.value)}
                    className="input-field"
                  >
                    <option value="carro">Carros y Camionetas</option>
                    <option value="moto">Motos</option>
                    <option value="carga">Carga Pesada</option>
                    <option value="maquinaria">Maquinaria Amarilla</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button type="submit" className="btn-primary w-full">
                    Agregar Marca
                  </button>
                </div>
              </div>
            </form>

            {/* Lista de marcas por categoría */}
            <div className="space-y-6">
              {['carro', 'moto', 'carga', 'maquinaria'].map((category) => {
                const categoryBrands = allBrands.filter(b => b.category === category)
                const categoryLabel = category === 'carro' ? 'Carros y Camionetas' : category === 'moto' ? 'Motos' : category === 'carga' ? 'Carga Pesada' : 'Maquinaria Amarilla'

                return (
                  <div key={category}>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">
                      {categoryLabel} ({categoryBrands.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {categoryBrands.map((brand) => (
                        <div
                          key={brand.id}
                          className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg"
                        >
                          <span className="text-sm font-medium text-gray-700">{brand.name}</span>
                          <button
                            onClick={() => handleDeleteBrand(brand.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {categoryBrands.length === 0 && (
                        <p className="text-gray-500 text-sm col-span-full">No hay marcas en esta categoría</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Ej: Toyota Corolla 2020"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    <option value="carro">Carro / Camioneta</option>
                    <option value="moto">Moto</option>
                    <option value="carga">Carga Pesada</option>
                    <option value="maquinaria">Maquinaria Amarilla</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca *
                  </label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    <option value="">Seleccionar marca</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.name}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Ej: Corolla"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Año *
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="input-field"
                    placeholder="Ej: 50000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kilometraje
                  </label>
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleInputChange}
                    min="0"
                    className="input-field"
                    placeholder="Ej: 45000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Combustible
                  </label>
                  <select
                    name="fuel_type"
                    value={formData.fuel_type}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">Seleccionar</option>
                    {FUEL_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transmisión
                  </label>
                  <select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">Seleccionar</option>
                    {TRANSMISSION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Ej: Negro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motor
                  </label>
                  <input
                    type="text"
                    name="engine"
                    value={formData.engine}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Ej: 2.0L Turbo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="available">Disponible</option>
                    <option value="sold">Vendido</option>
                    <option value="reserved">Reservado</option>
                  </select>
                </div>

                {(formData.category === 'carga' || formData.category === 'maquinaria') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacidad de Carga
                    </label>
                    <input
                      type="text"
                      name="load_capacity"
                      value={formData.load_capacity}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Ej: 10 toneladas"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Características
                </label>
                <textarea
                  name="features"
                  value={formData.features}
                  onChange={handleInputChange}
                  rows="4"
                  className="input-field"
                  placeholder="Lista las características principales..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imágenes
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="input-field"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Puedes seleccionar múltiples imágenes (máx 5MB cada una)
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : editingVehicle ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">
              Vehículos ({vehicles.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vehículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-16 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                          {vehicle.primary_image ? (
                            <img
                              src={vehicle.primary_image}
                              alt={vehicle.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-2xl">
                              🚗
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{vehicle.title}</div>
                          <div className="text-sm text-gray-500">
                            {vehicle.brand} {vehicle.model} • {vehicle.year}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${vehicle.price.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        vehicle.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : vehicle.status === 'sold'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {vehicle.status === 'available' ? 'Disponible' :
                         vehicle.status === 'sold' ? 'Vendido' : 'Reservado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(vehicle.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => window.open(`/vehiculo/${vehicle.slug}`, '_blank')}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {vehicles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay vehículos registrados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
