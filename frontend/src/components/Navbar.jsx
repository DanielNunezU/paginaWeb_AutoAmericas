import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { VEHICLE_BRANDS } from '../constants/vehicles'

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showBrandsMenu, setShowBrandsMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Cerrar menú al cambiar de página
  useEffect(() => {
    setShowBrandsMenu(false)
  }, [location])

  const handleBrandClick = (brand) => {
    navigate(`/?marca=${brand}`)
    setShowBrandsMenu(false)
  }

  const handleAllVehicles = () => {
    navigate('/')
    setShowBrandsMenu(false)
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold hover:text-blue-100 transition-colors">
            🚗 AutoAmericas
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-blue-100 transition-colors font-medium">
              Inicio
            </Link>

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
                <div className="absolute top-full mt-2 right-0 bg-white text-gray-800 rounded-lg shadow-xl py-2 w-48 z-50">
                  <button
                    onClick={handleAllVehicles}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors font-medium"
                  >
                    Todos los vehículos
                  </button>
                  <div className="border-t border-gray-200 my-2"></div>
                  {VEHICLE_BRANDS.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => handleBrandClick(brand)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors"
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link to="/contacto" className="hover:text-blue-100 transition-colors font-medium">
              Contáctenos
            </Link>

            {isAuthenticated && (
              <>
                <Link to="/admin/dashboard" className="hover:text-blue-100 transition-colors font-medium">
                  Panel Admin
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-sm">Hola, {user?.username}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
