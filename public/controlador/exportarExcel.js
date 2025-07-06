// controlador/exportarExcel.js
export function exportarTodosLosPedidosAExcel(pedidos = [], mozosMap = {}) {
  if (!Array.isArray(pedidos) || pedidos.length === 0) {
    alert("⚠️ No hay pedidos para exportar.");
    return;
  }

  const hoja = [
    ["Mozo", "Mesa", "Fecha", "Hora", "Estado", "Productos", "Cantidades", "Precios Unitarios", "Subtotales", "Total del Pedido"]
  ];

  pedidos.forEach(p => {
    const mozo = mozosMap[p.mozos] || "(Sin nombre)";
    const mesa = p.mesa;
    const estado = p.estado;
    const totalPedido = p.total?.toFixed(2) || "0.00";

    const fechaCompleta = p.fecha?.toDate?.();
    const fecha = fechaCompleta
      ? fechaCompleta.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" })
      : "Sin fecha";
    const hora = fechaCompleta
      ? fechaCompleta.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
      : "Sin hora";

    const productos = (p.items || []).map(i => i.producto).join(", ");
    const cantidades = (p.items || []).map(i => i.cantidad).join(", ");
    const precios = (p.items || []).map(i => i.precio.toFixed(2)).join(", ");
    const subtotales = (p.items || []).map(i => (i.total?.toFixed(2) || (i.precio * i.cantidad).toFixed(2))).join(", ");

    hoja.push([
      mozo,
      mesa,
      fecha,
      hora,
      estado,
      productos,
      cantidades,
      precios,
      subtotales,
      totalPedido
    ]);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(hoja);
  XLSX.utils.book_append_sheet(wb, ws, "Pedidos");
  XLSX.writeFile(wb, "Pedidos_CHIFA.xlsx");
}
