import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import axios from 'axios'

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showBrandsMenu, setShowBrandsMenu] = useState(false)
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false)
  const [brands, setBrands] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('carro')
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Cargar marcas al montar
  useEffect(() => {
    fetchBrands(selectedCategory)
  }, [selectedCategory])

  // Cerrar menús al cambiar de página
  useEffect(() => {
    setShowBrandsMenu(false)
    setShowCategoriesMenu(false)
  }, [location])

  const fetchBrands = async (category) => {
    try {
      const response = await axios.get(`/api/brands?category=${category}`)
      setBrands(response.data)
    } catch (error) {
      console.error('Error al obtener marcas:', error)
    }
  }

  const handleBrandClick = (brand) => {
    navigate(`/?marca=${brand}&categoria=${selectedCategory}`)
    setShowBrandsMenu(false)
  }

  const handleCategoryClick = (category) => {
    setSelectedCategory(category)
    navigate(`/?categoria=${category}`)
    setShowCategoriesMenu(false)
  }

  const handleAllVehicles = () => {
    navigate('/')
    setShowBrandsMenu(false)
    setShowCategoriesMenu(false)
    setSearchQuery('')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?busqueda=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/')
    }
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        {/* Primera fila: Logo, Búsqueda y Autenticación */}
        <div className="flex justify-between items-center py-4 border-b border-blue-500">
          <Link to="/" className="text-2xl font-bold hover:text-blue-100 transition-colors flex-shrink-0">
            🚗 AutoAmericas
          </Link>

          {/* Barra de Búsqueda */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar vehículos por marca, modelo, año..."
                className="w-full px-4 py-2 pr-12 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Autenticación */}
          {isAuthenticated && (
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-sm">Hola, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>

        {/* Segunda fila: Navegación */}
        <div className="flex items-center gap-6 py-3">
            <Link to="/" className="hover:text-blue-100 transition-colors font-medium">
              Inicio
            </Link>

            {/* Dropdown de Categorías */}
            <div className="relative">
              <button
                onClick={() => setShowCategoriesMenu(!showCategoriesMenu)}
                className="hover:text-blue-100 transition-colors font-medium flex items-center gap-1"
              >
                Categorías
                <svg className={`w-4 h-4 transition-transform ${showCategoriesMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showCategoriesMenu && (
                <div className="absolute top-full mt-2 right-0 bg-white text-gray-800 rounded-lg shadow-xl py-2 w-48 z-50">
                  <button
                    onClick={handleAllVehicles}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors font-medium"
                  >
                    Todos los vehículos
                  </button>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    onClick={() => handleCategoryClick('carro')}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors"
                  >
                    🚗 Carros
                  </button>
                  <button
                    onClick={() => handleCategoryClick('moto')}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors"
                  >
                    🏍️ Motos
                  </button>
                  <button
                    onClick={() => handleCategoryClick('carga')}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors"
                  >
                    🚚 Carga Pesada
                  </button>
                </div>
              )}
            </div>

            {/* Dropdown de Marcas */}
            <div className="relative">
              <button
                onClick={() => setShowBrandsMenu(!showBrandsMenu)}
                className="hover:text-blue-100 transition-colors font-medium flex items-center gap-1"
              >
                Marcas
                <svg className={`w-4 h-4 transition-transform ${showBrandsMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showBrandsMenu && (
                <div className="absolute top-full mt-2 right-0 bg-white text-gray-800 rounded-lg shadow-xl py-2 w-48 z-50 max-h-96 overflow-y-auto">
                  <button
                    onClick={handleAllVehicles}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors font-medium"
                  >
                    Todas las marcas
                  </button>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    {selectedCategory === 'carro' ? 'Carros' : selectedCategory === 'moto' ? 'Motos' : 'Carga Pesada'}
                  </div>
                  {brands.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => handleBrandClick(brand.name)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors"
                    >
                      {brand.name}
                    </button>
                  ))}
                  {brands.length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No hay marcas disponibles
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link to="/contacto" className="hover:text-blue-100 transition-colors font-medium">
              Contáctenos
            </Link>

            {isAuthenticated && (
              <Link to="/admin/dashboard" className="hover:text-blue-100 transition-colors font-medium">
                Panel Admin
              </Link>
            )}
          </div>
      </div>
    </nav>
  )
}

export default Navbar
