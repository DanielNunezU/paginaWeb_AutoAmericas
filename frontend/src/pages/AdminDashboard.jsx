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
    engine: '',
    youtube_url: ''
  })
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [draggedIndex, setDraggedIndex] = useState(null)
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
    const files = Array.from(e.target.files)
    setImages(prev => [...prev, ...files])

    // Crear previsualizaciones
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, { file, preview: reader.result }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleDragStart = (index) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    // Reordenar previsualizaciones
    const newPreviews = [...imagePreviews]
    const draggedItem = newPreviews[draggedIndex]
    newPreviews.splice(draggedIndex, 1)
    newPreviews.splice(index, 0, draggedItem)
    setImagePreviews(newPreviews)

    // Reordenar archivos
    const newImages = [...images]
    const draggedFile = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedFile)
    setImages(newImages)

    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const removeExistingImage = async (imageId) => {
    if (!confirm('¿Eliminar esta imagen?')) return
    try {
      await axios.delete(`/api/vehicles/images/${imageId}`)
      setExistingImages(prev => prev.filter(img => img.id !== imageId))
    } catch (error) {
      console.error('Error al eliminar imagen:', error)
      alert('Error al eliminar imagen')
    }
  }

  const setAsPrimaryImage = async (imageId) => {
    try {
      await axios.put(`/api/vehicles/images/${imageId}/primary`)
      setExistingImages(prev => prev.map(img => ({
        ...img,
        is_primary: img.id === imageId ? 1 : 0
      })).sort((a, b) => b.is_primary - a.is_primary))
    } catch (error) {
      console.error('Error al cambiar imagen principal:', error)
      alert('Error al cambiar imagen principal')
    }
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

  const handleEdit = async (vehicle) => {
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
      engine: vehicle.engine || '',
      youtube_url: vehicle.youtube_url || ''
    })

    // Cargar imagenes existentes del vehiculo
    try {
      const response = await axios.get(`/api/vehicles/${vehicle.slug}`)
      if (response.data.images && response.data.images.length > 0) {
        setExistingImages(response.data.images.sort((a, b) => b.is_primary - a.is_primary))
      }
    } catch (error) {
      console.error('Error al cargar imagenes:', error)
    }

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
      engine: '',
      youtube_url: ''
    })
    setImages([])
    setImagePreviews([])
    setExistingImages([])
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
    <div className="min-h-screen bg-black py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-500">Panel de Administración</h1>
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
          <div className="bg-gray-800 border border-yellow-600/30 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-yellow-500">Gestionar Marcas</h2>

            {/* Formulario para agregar marca */}
            <form onSubmit={handleAddBrand} className="mb-8 p-4 bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-100">Agregar Nueva Marca</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre de la Marca
                  </label>
                  <input
                    type="text"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    placeholder="Ej: Tesla"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoría
                  </label>
                  <select
                    value={newBrandCategory}
                    onChange={(e) => setNewBrandCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
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
                    <h3 className="text-lg font-semibold mb-3 text-gray-100">
                      {categoryLabel} ({categoryBrands.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {categoryBrands.map((brand) => (
                        <div
                          key={brand.id}
                          className="flex items-center justify-between bg-gray-700 px-3 py-2 rounded-lg border border-gray-600"
                        >
                          <span className="text-sm font-medium text-gray-200">{brand.name}</span>
                          <button
                            onClick={() => handleDeleteBrand(brand.id)}
                            className="text-red-400 hover:text-red-300 text-sm font-medium"
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
          <div className="bg-gray-800 border border-yellow-600/30 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-yellow-500">
              {editingVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    placeholder="Ej: Toyota Corolla 2020"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoría *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                  >
                    <option value="carro">Carro / Camioneta</option>
                    <option value="moto">Moto</option>
                    <option value="carga">Carga Pesada</option>
                    <option value="maquinaria">Maquinaria Amarilla</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Marca *
                  </label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Línea *
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    placeholder="Ej: Corolla"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
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
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Precio *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    placeholder="Ej: 50000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Kilometraje
                  </label>
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    placeholder="Ej: 45000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Combustible
                  </label>
                  <select
                    name="fuel_type"
                    value={formData.fuel_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Transmisión
                  </label>
                  <select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    placeholder="Ej: Negro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Motor
                  </label>
                  <input
                    type="text"
                    name="engine"
                    value={formData.engine}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    placeholder="Ej: 2.0L Turbo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                  >
                    <option value="available">Disponible</option>
                    <option value="sold">Vendido</option>
                    <option value="reserved">Reservado</option>
                  </select>
                </div>

                {(formData.category === 'carga' || formData.category === 'maquinaria') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Capacidad de Carga
                    </label>
                    <input
                      type="text"
                      name="load_capacity"
                      value={formData.load_capacity}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                      placeholder="Ej: 10 toneladas"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Caracteristicas
                </label>
                <textarea
                  name="features"
                  value={formData.features}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                  placeholder="Lista las caracteristicas principales..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video de YouTube (opcional)
                </label>
                <input
                  type="url"
                  name="youtube_url"
                  value={formData.youtube_url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Imagenes
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-600 file:text-white file:cursor-pointer"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Puedes seleccionar hasta 25 imagenes (max 5MB cada una). Arrastra para reordenar.
                </p>

                {existingImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">
                      Imagenes actuales ({existingImages.length}) - Clic en una imagen para hacerla principal
                    </p>
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                      {existingImages.map((img, index) => (
                        <div
                          key={img.id}
                          className={`relative group cursor-pointer ${img.is_primary ? 'ring-2 ring-yellow-500' : ''}`}
                          onClick={() => !img.is_primary && setAsPrimaryImage(img.id)}
                        >
                          <img
                            src={img.image_url}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          {img.is_primary ? (
                            <span className="absolute top-1 left-1 bg-yellow-500 text-black text-xs px-1 rounded font-bold">
                              Principal
                            </span>
                          ) : null}
                          <span className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                            {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeExistingImage(img.id); }}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {imagePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">
                      {imagePreviews.length} imagen(es) nueva(s) - Arrastra para reordenar
                    </p>
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                      {imagePreviews.map((img, index) => (
                        <div
                          key={index}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`relative group cursor-move ${
                            draggedIndex === index ? 'opacity-50' : ''
                          } ${index === 0 && existingImages.length === 0 ? 'ring-2 ring-yellow-500' : ''}`}
                        >
                          <img
                            src={img.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          {index === 0 && existingImages.length === 0 && (
                            <span className="absolute top-1 left-1 bg-yellow-500 text-black text-xs px-1 rounded font-bold">
                              Principal
                            </span>
                          )}
                          <span className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                            +{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-gray-800 border border-yellow-600/30 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-yellow-500">
              Vehículos ({vehicles.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Vehículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-16 flex-shrink-0 bg-gray-700 rounded overflow-hidden">
                          {vehicle.primary_image ? (
                            <img
                              src={vehicle.primary_image}
                              alt={vehicle.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-100">{vehicle.title}</div>
                          <div className="text-sm text-gray-400">
                            {vehicle.brand} {vehicle.model} • {vehicle.year}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-yellow-500">
                        ${vehicle.price.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        vehicle.status === 'available'
                          ? 'bg-green-900/50 text-green-400 border border-green-600'
                          : vehicle.status === 'sold'
                          ? 'bg-red-900/50 text-red-400 border border-red-600'
                          : 'bg-yellow-900/50 text-yellow-400 border border-yellow-600'
                      }`}>
                        {vehicle.status === 'available' ? 'Disponible' :
                         vehicle.status === 'sold' ? 'Vendido' : 'Reservado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(vehicle.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => window.open(`/vehiculo/${vehicle.slug}`, '_blank')}
                        className="text-blue-400 hover:text-blue-300 mr-4"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="text-yellow-400 hover:text-yellow-300 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="text-red-400 hover:text-red-300"
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
