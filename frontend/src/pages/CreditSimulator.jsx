import { useState } from 'react'

const CreditSimulator = () => {
  const [formData, setFormData] = useState({
    vehiclePrice: '',
    downPayment: '',
    term: 36,
    salary: '',
    monthlyRate: 1.5
  })
  const [useCustomRate, setUseCustomRate] = useState(false)

  const [result, setResult] = useState(null)
  const [warnings, setWarnings] = useState([])

  // Constantes de Colombia (2024-2025)
  const SALARIO_MINIMO = 1300000 // Salario mínimo legal mensual vigente
  const MAX_DEBT_RATIO = 0.4 // Máximo 40% del salario para deudas

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const calculateCredit = (e) => {
    e.preventDefault()

    const warnings = []
    const price = parseFloat(formData.vehiclePrice)
    const downPayment = parseFloat(formData.downPayment)
    const term = parseInt(formData.term)
    const salary = parseFloat(formData.salary)
    const monthlyRatePercent = parseFloat(formData.monthlyRate)

    // Validaciones
    if (downPayment < price * 0.1) {
      warnings.push('Se recomienda una cuota inicial de al menos el 10% del valor del vehículo')
    }

    if (salary < SALARIO_MINIMO) {
      warnings.push(`El salario ingresado es menor al salario mínimo legal (${formatCurrency(SALARIO_MINIMO)})`)
    }

    // Cálculo del crédito
    const loanAmount = price - downPayment
    const monthlyRate = monthlyRatePercent / 100
    const annualRate = monthlyRatePercent * 12

    // Fórmula de cuota fija (Método Francés)
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, term)) /
                          (Math.pow(1 + monthlyRate, term) - 1)

    const totalPayment = monthlyPayment * term
    const totalInterest = totalPayment - loanAmount

    // Análisis de capacidad de pago
    const debtRatio = monthlyPayment / salary
    const availableIncome = salary - monthlyPayment

    if (debtRatio > MAX_DEBT_RATIO) {
      warnings.push(`La cuota representa el ${(debtRatio * 100).toFixed(1)}% de tu salario. Se recomienda no superar el 40%`)
    }

    if (availableIncome < SALARIO_MINIMO * 0.7) {
      warnings.push('Después de pagar la cuota, tu ingreso disponible podría ser insuficiente para gastos básicos')
    }

    // Generar tabla de amortización (primeros 12 meses)
    const amortizationSchedule = []
    let balance = loanAmount

    for (let i = 1; i <= Math.min(12, term); i++) {
      const interestPayment = balance * monthlyRate
      const principalPayment = monthlyPayment - interestPayment
      balance -= principalPayment

      amortizationSchedule.push({
        month: i,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      })
    }

    setResult({
      loanAmount,
      monthlyPayment,
      totalPayment,
      totalInterest,
      debtRatio,
      availableIncome,
      amortizationSchedule,
      downPaymentPercentage: (downPayment / price) * 100,
      annualRate: annualRate,
      monthlyRate: monthlyRatePercent
    })

    setWarnings(warnings)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value)
  }

  const resetForm = () => {
    setFormData({
      vehiclePrice: '',
      downPayment: '',
      term: 36,
      salary: '',
      monthlyRate: 1.5
    })
    setResult(null)
    setWarnings([])
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-yellow-500 mb-4">
              Simulador de Crédito Vehicular
            </h1>
            <p className="text-lg text-gray-300">
              Calcula tu cuota mensual y evalúa tu capacidad de endeudamiento
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulario */}
            <div className="bg-gray-800 border border-yellow-600/30 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-yellow-500 mb-6">Datos del Crédito</h2>

              <form onSubmit={calculateCredit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Valor del Vehículo *
                  </label>
                  <input
                    type="number"
                    name="vehiclePrice"
                    value={formData.vehiclePrice}
                    onChange={handleInputChange}
                    required
                    min="1000000"
                    step="100000"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                    placeholder="Ej: 50000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cuota Inicial *
                  </label>
                  <input
                    type="number"
                    name="downPayment"
                    value={formData.downPayment}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="100000"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                    placeholder="Ej: 10000000"
                  />
                  {formData.vehiclePrice && formData.downPayment && (
                    <p className="text-sm text-gray-400 mt-1">
                      {((formData.downPayment / formData.vehiclePrice) * 100).toFixed(1)}% del valor del vehículo
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Plazo (meses) *
                  </label>
                  <select
                    name="term"
                    value={formData.term}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="12">12 meses (1 año)</option>
                    <option value="24">24 meses (2 años)</option>
                    <option value="36">36 meses (3 años)</option>
                    <option value="48">48 meses (4 años)</option>
                    <option value="60">60 meses (5 años)</option>
                    <option value="72">72 meses (6 años)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Tasa de Interés Mensual (%) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setUseCustomRate(!useCustomRate)}
                      className="text-xs text-yellow-500 hover:text-yellow-400 font-medium"
                    >
                      {useCustomRate ? 'Usar opciones predefinidas' : 'Ingresar tasa manual'}
                    </button>
                  </div>

                  {useCustomRate ? (
                    <input
                      type="number"
                      name="monthlyRate"
                      value={formData.monthlyRate}
                      onChange={handleInputChange}
                      required
                      min="0.1"
                      max="5"
                      step="0.01"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                      placeholder="Ej: 1.5"
                    />
                  ) : (
                    <select
                      name="monthlyRate"
                      value={formData.monthlyRate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="1.25">1.25% mensual - Excelente crédito</option>
                      <option value="1.5">1.5% mensual - Buen crédito</option>
                      <option value="1.75">1.75% mensual - Crédito promedio</option>
                      <option value="2">2% mensual - Crédito alto</option>
                      <option value="2.25">2.25% mensual - Crédito muy alto</option>
                    </select>
                  )}

                  <div className="mt-2 p-2 bg-yellow-600/10 border border-yellow-600/30 rounded-lg">
                    <p className="text-sm text-yellow-500">
                      <span className="font-medium">Tasa anual:</span> {(parseFloat(formData.monthlyRate) * 12).toFixed(2)}% EA
                      <span className="text-yellow-600 ml-1">({formData.monthlyRate}% × 12 meses)</span>
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Tasa mensual. Varía según tu historial crediticio.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tu Salario Mensual *
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="100000"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                    placeholder="Ej: 3000000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Salario mínimo legal: {formatCurrency(SALARIO_MINIMO)}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">
                    Calcular Crédito
                  </button>
                  {result && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Resultados */}
            <div className="space-y-6">
              {result ? (
                <>
                  {/* Botón Nueva Simulación */}
                  <div className="flex justify-end">
                    <button
                      onClick={resetForm}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Nueva Simulación
                    </button>
                  </div>

                  {/* Alertas */}
                  {warnings.length > 0 && (
                    <div className="bg-yellow-600/10 border-l-4 border-yellow-500 p-4 rounded">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-500">Advertencias</h3>
                          <ul className="mt-2 text-sm text-yellow-400 list-disc list-inside">
                            {warnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resumen del Crédito */}
                  <div className="bg-gray-800 border border-yellow-600/30 rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold text-yellow-500 mb-4">Resumen del Crédito</h3>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                        <span className="text-gray-400">Monto a Financiar</span>
                        <span className="text-lg font-bold text-gray-100">
                          {formatCurrency(result.loanAmount)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                        <span className="text-gray-400">Cuota Mensual</span>
                        <span className="text-2xl font-bold text-yellow-500">
                          {formatCurrency(result.monthlyPayment)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                        <span className="text-gray-400">Total a Pagar</span>
                        <span className="text-lg font-bold text-gray-100">
                          {formatCurrency(result.totalPayment)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                        <span className="text-gray-400">Total Intereses</span>
                        <span className="text-lg font-bold text-red-400">
                          {formatCurrency(result.totalInterest)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                        <span className="text-gray-400">Cuota Inicial</span>
                        <span className="text-lg font-semibold text-green-400">
                          {result.downPaymentPercentage.toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center pb-3 border-b border-gray-700 bg-yellow-600/10 -mx-6 px-6 py-3">
                        <div>
                          <span className="text-gray-300 font-medium">Tasa de Interés</span>
                          <p className="text-xs text-gray-500">Mensual</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-yellow-500">
                            {result.monthlyRate}% mensual
                          </span>
                          <p className="text-sm text-yellow-600">
                            ({result.annualRate.toFixed(2)}% EA)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Capacidad de Pago */}
                  <div className="bg-gray-800 border border-yellow-600/30 rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold text-yellow-500 mb-4">Capacidad de Pago</h3>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-400">Compromiso de Ingreso</span>
                          <span className={`text-sm font-bold ${result.debtRatio > MAX_DEBT_RATIO ? 'text-red-400' : 'text-green-400'}`}>
                            {(result.debtRatio * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${result.debtRatio > MAX_DEBT_RATIO ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(result.debtRatio * 100, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Recomendado: Máximo 40% de tu salario
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                        <span className="text-gray-400">Ingreso Disponible</span>
                        <span className="text-lg font-bold text-gray-100">
                          {formatCurrency(result.availableIncome)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tabla de Amortización */}
                  <div className="bg-gray-800 border border-yellow-600/30 rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold text-yellow-500 mb-4">
                      Tabla de Amortización (Primeros 12 meses)
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-700">
                          <tr>
                            <th className="px-3 py-2 text-left text-gray-300">Mes</th>
                            <th className="px-3 py-2 text-right text-gray-300">Cuota</th>
                            <th className="px-3 py-2 text-right text-gray-300">Capital</th>
                            <th className="px-3 py-2 text-right text-gray-300">Interés</th>
                            <th className="px-3 py-2 text-right text-gray-300">Saldo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {result.amortizationSchedule.map((row) => (
                            <tr key={row.month} className="hover:bg-gray-700/50">
                              <td className="px-3 py-2 text-gray-100">{row.month}</td>
                              <td className="px-3 py-2 text-right text-gray-100">
                                {formatCurrency(row.payment)}
                              </td>
                              <td className="px-3 py-2 text-right text-green-400">
                                {formatCurrency(row.principal)}
                              </td>
                              <td className="px-3 py-2 text-right text-red-400">
                                {formatCurrency(row.interest)}
                              </td>
                              <td className="px-3 py-2 text-right text-gray-100">
                                {formatCurrency(row.balance)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-gray-800 border border-yellow-600/30 rounded-lg shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">🧮</div>
                  <h3 className="text-xl font-bold text-gray-100 mb-2">
                    Completa el formulario
                  </h3>
                  <p className="text-gray-400">
                    Ingresa los datos del crédito para ver tu simulación
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Información Adicional */}
          <div className="mt-12 bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-6">
            <h3 className="text-lg font-bold text-yellow-500 mb-3">Información Importante</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Esta es una simulación referencial. Las tasas y condiciones pueden variar según la entidad financiera.</li>
              <li>• Se recomienda una cuota inicial mínima del 20% para obtener mejores condiciones.</li>
              <li>• Tu capacidad de endeudamiento no debe superar el 40% de tus ingresos mensuales.</li>
              <li>• Considera gastos adicionales como seguro, matrícula, impuestos y mantenimiento del vehículo.</li>
              <li>• Un buen historial crediticio te permite acceder a tasas de interés más bajas.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreditSimulator
