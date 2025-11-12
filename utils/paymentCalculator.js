// Calcular días restantes del mes y monto proporcional
exports.calcularMontoPrimerPeriodo = (fechaInicio, tarifaMensual = parseFloat(process.env.MONTHLY_RATE || 1200)) => {
  const fecha = new Date(fechaInicio);
  const year = fecha.getFullYear();
  const month = fecha.getMonth();
  
  // Obtener el último día del mes
  const ultimoDiaMes = new Date(year, month + 1, 0).getDate();
  const diaInicio = fecha.getDate();
  
  // Calcular días restantes (incluyendo el día de inicio)
  const diasRestantes = ultimoDiaMes - diaInicio + 1;
  
  // Si entra el día 1, cobrar mes completo
  if (diaInicio === 1) {
    return {
      monto: tarifaMensual,
      diasRestantes,
      ultimoDiaMes,
      periodo: `${year}-${String(month + 1).padStart(2, '0')}`
    };
  }
  
  // Calcular proporcional
  const montoProporcional = (tarifaMensual / ultimoDiaMes) * diasRestantes;
  
  return {
    monto: Math.round(montoProporcional * 100) / 100, // Redondear a 2 decimales
    diasRestantes,
    ultimoDiaMes,
    periodo: `${year}-${String(month + 1).padStart(2, '0')}`
  };
};

// Obtener periodo para un pago (formato YYYY-MM)
exports.obtenerPeriodo = (fecha) => {
  const date = new Date(fecha);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Calcular días entre dos fechas
exports.calcularDias = (fechaInicio, fechaFin) => {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diferencia = fin - inicio;
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24)) + 1;
};
