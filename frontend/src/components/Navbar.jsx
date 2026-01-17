import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const BUILD_VERSION = '2.0.1'
const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showBrandsMenu, setShowBrandsMenu] = useState(false)
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false)
  const [showMobileCategories, setShowMobileCategories] = useState(false)
  const [showMobileBrands, setShowMobileBrands] = useState(false)

  // Log version on mount for debugging
  useEffect(() => { console.log('Navbar version:', BUILD_VERSION) }, [])
  const [brands, setBrands] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('carro')
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const categoriesRef = useRef(null)
  const brandsRef = useRef(null)

  // Cerrar menús desktop al hacer click fuera (solo para desktop)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Solo aplicar para menús desktop
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setShowCategoriesMenu(false)
      }
      if (brandsRef.current && !brandsRef.current.contains(event.target)) {
        setShowBrandsMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handlers para el menú de categorías
  const handleCategoriesClick = () => {
    setShowCategoriesMenu(!showCategoriesMenu)
    setShowBrandsMenu(false)
  }

  // Handlers para el menú de marcas
  const handleBrandsClick = () => {
    setShowBrandsMenu(!showBrandsMenu)
    setShowCategoriesMenu(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Cargar marcas al montar
  useEffect(() => {
    fetchBrands(selectedCategory)
  }, [selectedCategory])

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
  }

  const handleCategoryClick = (category) => {
    setSelectedCategory(category)
    navigate(`/?categoria=${category}`)
  }

  const handleAllVehicles = () => {
    navigate('/', { state: { refresh: Date.now() } })
    setSearchQuery('')
  }

  // Navegar al inicio con refresh para mostrar vehículos aleatorios diferentes
  const handleHomeClick = (e) => {
    e.preventDefault()
    navigate('/', { state: { refresh: Date.now() } })
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
    <nav className="bg-black text-white shadow-lg">
      <div className="container mx-auto px-4">
        {/* Primera fila: Logo, Búsqueda y Autenticación */}
        <div className="flex justify-between items-center py-4 border-b border-yellow-600/30">
          {/* Logo */}
          <a href="/" onClick={handleHomeClick} className="flex items-center hover:opacity-90 transition-opacity flex-shrink-0 cursor-pointer">
            <img
              src="/images/logo-autos-duitama.png"
              alt="Autos Duitama"
              className="h-16 md:h-20 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <span className="text-xl md:text-2xl font-bold hidden items-center gap-2">
              🚗 <span>Autos Duitama</span>
            </span>
          </a>

          {/* Barra de Búsqueda - Oculta en móvil */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-12">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar vehículos..."
                className="w-full px-4 py-2 pr-12 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-yellow-600 hover:bg-yellow-500 text-white p-2 rounded-md transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Autenticación y Menú Hamburguesa */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-sm">Hola, {user?.username}</span>
                <button
                  onClick={handleLogout}
                  className="bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}

            {/* Botón Menú Hamburguesa - Solo móvil */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Barra de búsqueda móvil */}
        <div className="md:hidden py-3 border-b border-yellow-600/30">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar vehículos..."
                className="w-full px-4 py-2 pr-12 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-yellow-600 hover:bg-yellow-500 text-white p-2 rounded-md transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Segunda fila: Navegación Desktop */}
        <div className="hidden md:flex items-center gap-8 lg:gap-14 xl:gap-16 py-3">
            <a href="/" onClick={handleHomeClick} className="hover:text-yellow-500 transition-colors font-medium cursor-pointer">
              Inicio
            </a>

            {/* Dropdown de Categorías */}
            <div
              className="relative"
              ref={categoriesRef}
            >
              <button
                onClick={handleCategoriesClick}
                className="hover:text-yellow-500 transition-colors font-medium flex items-center gap-1"
              >
                Categorías
                <svg className={`w-4 h-4 transition-transform ${showCategoriesMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showCategoriesMenu && (
                <div className="absolute top-full mt-2 left-0 bg-gray-900 text-gray-100 rounded-lg shadow-xl py-2 w-48 z-50 border border-yellow-600/30">
                  <button
                    onClick={handleAllVehicles}
                    className="w-full text-left px-4 py-2 hover:bg-gray-800 hover:text-yellow-500 transition-colors font-medium"
                  >
                    Todos los vehículos
                  </button>
                  <div className="border-t border-yellow-600/30 my-2"></div>
                  <button
                    onClick={() => handleCategoryClick('carro')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-800 hover:text-yellow-500 transition-colors"
                  >
                    Carros y Camionetas
                  </button>
                  <button
                    onClick={() => handleCategoryClick('moto')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-800 hover:text-yellow-500 transition-colors"
                  >
                    Motos
                  </button>
                  <button
                    onClick={() => handleCategoryClick('carga')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-800 hover:text-yellow-500 transition-colors"
                  >
                    Carga Pesada
                  </button>
                  <button
                    onClick={() => handleCategoryClick('maquinaria')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-800 hover:text-yellow-500 transition-colors"
                  >
                    Maquinaria Amarilla
                  </button>
                </div>
              )}
            </div>

            {/* Dropdown de Marcas */}
            <div
              className="relative"
              ref={brandsRef}
            >
              <button
                onClick={handleBrandsClick}
                className="hover:text-yellow-500 transition-colors font-medium flex items-center gap-1"
              >
                Marcas
                <svg className={`w-4 h-4 transition-transform ${showBrandsMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showBrandsMenu && (
                <div className="absolute top-full mt-2 left-0 bg-gray-900 text-gray-100 rounded-lg shadow-xl py-2 w-48 z-50 max-h-96 overflow-y-auto border border-yellow-600/30">
                  <button
                    onClick={handleAllVehicles}
                    className="w-full text-left px-4 py-2 hover:bg-gray-800 hover:text-yellow-500 transition-colors font-medium"
                  >
                    Todas las marcas
                  </button>
                  <div className="border-t border-yellow-600/30 my-2"></div>
                  <div className="px-4 py-2 text-xs font-semibold text-yellow-500 uppercase">
                    {selectedCategory === 'carro' ? 'Carros y Camionetas' : selectedCategory === 'moto' ? 'Motos' : selectedCategory === 'carga' ? 'Carga Pesada' : 'Maquinaria Amarilla'}
                  </div>
                  {brands.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => handleBrandClick(brand.name)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-800 hover:text-yellow-500 transition-colors"
                    >
                      {brand.name}
                    </button>
                  ))}
                  {brands.length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-400">
                      No hay marcas disponibles
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link to="/contacto" className="hover:text-yellow-500 transition-colors font-medium">
              Contáctenos
            </Link>

            <Link to="/simulador-credito" className="hover:text-yellow-500 transition-colors font-medium">
              Simulador de Crédito
            </Link>

            {isAuthenticated && (
              <Link to="/admin/dashboard" className="hover:text-yellow-500 transition-colors font-medium">
                Panel Admin
              </Link>
            )}
          </div>

        {/* Menú Móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-yellow-600/30">
            <div className="py-2 space-y-1">
              <a
                href="/"
                onClick={(e) => { handleHomeClick(e); setIsMobileMenuOpen(false); }}
                className="block px-4 py-3 hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Inicio
              </a>

              {/* Categorías Móvil */}
              <div className="border-t border-yellow-600/30">
                <button
                  onClick={() => { setShowMobileCategories(!showMobileCategories); setShowMobileBrands(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors flex items-center justify-between"
                >
                  <span>Categorías</span>
                  <svg className={`w-4 h-4 transition-transform ${showMobileCategories ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showMobileCategories && (
                  <div className="bg-gray-800 py-2">
                    <button
                      onClick={() => { handleAllVehicles(); setIsMobileMenuOpen(false); setShowMobileCategories(false); }}
                      className="w-full text-left px-8 py-2 hover:bg-gray-700 text-sm"
                    >
                      Todos los vehículos
                    </button>
                    <button
                      onClick={() => { handleCategoryClick('carro'); setIsMobileMenuOpen(false); setShowMobileCategories(false); }}
                      className="w-full text-left px-8 py-2 hover:bg-gray-700 text-sm"
                    >
                      Carros y Camionetas
                    </button>
                    <button
                      onClick={() => { handleCategoryClick('moto'); setIsMobileMenuOpen(false); setShowMobileCategories(false); }}
                      className="w-full text-left px-8 py-2 hover:bg-gray-700 text-sm"
                    >
                      Motos
                    </button>
                    <button
                      onClick={() => { handleCategoryClick('carga'); setIsMobileMenuOpen(false); setShowMobileCategories(false); }}
                      className="w-full text-left px-8 py-2 hover:bg-gray-700 text-sm"
                    >
                      Carga Pesada
                    </button>
                    <button
                      onClick={() => { handleCategoryClick('maquinaria'); setIsMobileMenuOpen(false); setShowMobileCategories(false); }}
                      className="w-full text-left px-8 py-2 hover:bg-gray-700 text-sm"
                    >
                      Maquinaria Amarilla
                    </button>
                  </div>
                )}
              </div>

              {/* Marcas Móvil */}
              <div className="border-t border-yellow-600/30">
                <button
                  onClick={() => { setShowMobileBrands(!showMobileBrands); setShowMobileCategories(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors flex items-center justify-between"
                >
                  <span>Marcas</span>
                  <svg className={`w-4 h-4 transition-transform ${showMobileBrands ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showMobileBrands && (
                  <div className="bg-gray-800 py-2 max-h-60 overflow-y-auto">
                    <button
                      onClick={() => { handleAllVehicles(); setIsMobileMenuOpen(false); setShowMobileBrands(false); }}
                      className="w-full text-left px-8 py-2 hover:bg-gray-700 text-sm font-medium"
                    >
                      Todas las marcas
                    </button>
                    <div className="px-8 py-2 text-xs font-semibold text-gray-400 uppercase">
                      {selectedCategory === 'carro' ? 'Carros y Camionetas' : selectedCategory === 'moto' ? 'Motos' : selectedCategory === 'carga' ? 'Carga Pesada' : 'Maquinaria Amarilla'}
                    </div>
                    {brands.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => { handleBrandClick(brand.name); setIsMobileMenuOpen(false); setShowMobileBrands(false); }}
                        className="w-full text-left px-8 py-2 hover:bg-gray-700 text-sm"
                      >
                        {brand.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/contacto"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 hover:bg-gray-800 transition-colors border-t border-yellow-600/30"
              >
                Contáctenos
              </Link>

              <Link
                to="/simulador-credito"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 hover:bg-gray-800 transition-colors border-t border-yellow-600/30"
              >
                Simulador de Crédito
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 hover:bg-gray-800 transition-colors border-t border-yellow-600/30"
                  >
                    Panel Admin
                  </Link>
                  <div className="border-t border-yellow-600/30 px-4 py-3">
                    <p className="text-sm text-gray-400 mb-2">Hola, {user?.username}</p>
                    <button
                      onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                      className="w-full bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
