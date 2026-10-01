using Microsoft.AspNetCore.Mvc;

namespace GestionComercial.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EnvioController : ControllerBase
{
    [HttpGet("estado/{idVenta}")]
    public IActionResult EstadoEnvio(int idVenta)
    {
        // Contrato REST para integración envío/logística (nueva integración)
        return Ok(new { ventaId = idVenta, estado = "En tránsito", actualizado = DateTime.UtcNow });
    }
}
