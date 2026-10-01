using Microsoft.AspNetCore.Mvc;
using GestionComercial.Aplicacion.Interfaces.Servicios;
using GestionComercial.Aplicacion.DTOs.Ventas;

namespace GestionComercial.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VentaController : ControllerBase
{
    private readonly VentaServicio _ventaServicio;
    public VentaController(VentaServicio ventaServicio) => _ventaServicio = ventaServicio;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VentaResumenDto>>> ObtenerVentas(
        int idSucursal = 1, DateTime? fechaDesde = null, DateTime? fechaHasta = null, string? dniCliente = null, int? estado = null)
    {
        var ventas = await _ventaServicio.ObtenerVentasAsync(idSucursal, fechaDesde, fechaHasta, dniCliente, estado);
        return Ok(ventas);
    }
}
