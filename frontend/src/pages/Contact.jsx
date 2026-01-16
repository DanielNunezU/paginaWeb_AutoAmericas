const Contact = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Contáctenos</h1>
          <p className="text-xl text-gray-600">
            ¿Tienes alguna pregunta? Estamos aquí para ayudarte
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Información de Contacto */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Información de Contacto</h2>

            <div className="space-y-6">
              {/* Teléfonos de Asesores */}
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Teléfonos</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm w-20">Asesor 1:</span>
                      <a href="tel:+573133490087" className="text-blue-600 hover:underline">313 349 0087</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm w-20">Asesor 2:</span>
                      <a href="tel:+573209669384" className="text-blue-600 hover:underline">320 966 9384</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm w-20">Asesor 3:</span>
                      <a href="tel:+573106440913" className="text-blue-600 hover:underline">310 644 0913</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm w-20">Asesor 4:</span>
                      <a href="tel:+573144018594" className="text-blue-600 hover:underline">314 401 8594</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm w-20">Asesor 5:</span>
                      <a href="tel:+573133473617" className="text-blue-600 hover:underline">313 347 3617</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm w-20">Asesor 6:</span>
                      <a href="tel:+573203866321" className="text-blue-600 hover:underline">320 386 6321</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">WhatsApp</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm w-20">Asesor 1:</span>
                      <a
                        href="https://api.whatsapp.com/send?phone=573133490087&text=Hola%2C%20estoy%20interesado%20en%20un%20veh%C3%ADculo..."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        313 349 0087
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm w-20">Asesor 2:</span>
                      <a
                        href="https://api.whatsapp.com/send?phone=573209669384&text=Hola%2C%20estoy%20interesado%20en%20un%20veh%C3%ADculo..."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        320 966 9384
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm w-20">Asesor 3:</span>
                      <a
                        href="https://api.whatsapp.com/send?phone=573106440913&text=Hola%2C%20estoy%20interesado%20en%20un%20veh%C3%ADculo..."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        310 644 0913
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm w-20">Asesor 4:</span>
                      <a
                        href="https://api.whatsapp.com/send?phone=573144018594&text=Hola%2C%20estoy%20interesado%20en%20un%20veh%C3%ADculo..."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        314 401 8594
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm w-20">Asesor 5:</span>
                      <a
                        href="https://api.whatsapp.com/send?phone=573133473617&text=Hola%2C%20estoy%20interesado%20en%20un%20veh%C3%ADculo..."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        313 347 3617
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm w-20">Asesor 6:</span>
                      <a
                        href="https://api.whatsapp.com/send?phone=573203866321&text=Hola%2C%20estoy%20interesado%20en%20un%20veh%C3%ADculo..."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        320 386 6321
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
                  <a href="mailto:info@autosduitama.com" className="text-purple-600 hover:underline">
                    info@autosduitama.com
                  </a>
                </div>
              </div>

              {/* Dirección */}
              <div className="flex items-start gap-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Dirección</h3>
                  <p className="text-gray-600">
                    Cra 42 #9 50<br />
                    Duitama, Colombia
                  </p>
                </div>
              </div>

              {/* Horario */}
              <div className="flex items-start gap-4">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Horario de Atención</h3>
                  <p className="text-gray-600">
                    Lunes a Viernes: 8:00 AM - 6:00 PM<br />
                    Sábados: 9:00 AM - 2:00 PM<br />
                    Domingos: Cerrado
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de Contacto */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Envíanos un Mensaje</h2>

            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="name"
                  className="input-field"
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="input-field"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="input-field"
                  placeholder="+57 300 123 4567"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Asunto
                </label>
                <input
                  type="text"
                  id="subject"
                  className="input-field"
                  placeholder="¿En qué podemos ayudarte?"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  rows="5"
                  className="input-field"
                  placeholder="Escribe tu mensaje aquí..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary"
              >
                Enviar Mensaje
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Responderemos tu mensaje lo antes posible. También puedes contactarnos directamente por WhatsApp para una respuesta más rápida.
              </p>
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div className="mt-12 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nuestra Ubicación</h2>
            <div className="rounded-lg overflow-hidden h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3969.1234567890123!2d-73.0333!3d5.8333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e6a45b0e6e0f0f1%3A0x1234567890abcdef!2sCra.%2042%20%239-50%2C%20Duitama%2C%20Boyac%C3%A1%2C%20Colombia!5e0!3m2!1ses!2sco!4v1234567890123"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Autos Duitama"
              ></iframe>
            </div>
            <div className="mt-4 text-center">
              <a
                href="https://www.google.com/maps/search/Cra+42+%239+50,+Duitama,+Colombia"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Abrir en Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
