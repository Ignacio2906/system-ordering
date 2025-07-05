export function exportarPedidoAExcel(pedidoId) {
  const pedido = window.pedidosGlobal?.find(p => p.id === pedidoId);
  if (!pedido) return alert("❌ Pedido no encontrado.");

  const hoja = [
    ["Mozo", pedido.mozos],
    ["Mesa", pedido.mesa],
    ["Fecha", pedido.fecha?.toDate?.()?.toLocaleString() || "Sin fecha"],
    ["Estado", pedido.estado],
    ["Total", pedido.total?.toFixed(2)],
    [],
    ["Producto", "Cantidad", "Precio Unitario", "Total"]
  ];

  (pedido.items || []).forEach(item => {
    hoja.push([
      item.producto,
      item.cantidad,
      item.precio.toFixed(2),
      item.total?.toFixed(2) || (item.precio * item.cantidad).toFixed(2)
    ]);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(hoja);
  XLSX.utils.book_append_sheet(wb, ws, "Pedido");
  XLSX.writeFile(wb, `Pedido_${pedidoId}.xlsx`);
}
