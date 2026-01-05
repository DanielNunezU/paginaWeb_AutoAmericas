import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
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
