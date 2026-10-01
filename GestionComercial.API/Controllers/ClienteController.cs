using Microsoft.AspNetCore.Mvc;
using GestionComercial.Aplicacion.Interfaces.Servicios;
using GestionComercial.Aplicacion.DTOs.Clientes;

namespace GestionComercial.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClienteController : ControllerBase
{
    private readonly ClienteServicio _clienteServicio;
    public ClienteController(ClienteServicio clienteServicio) => _clienteServicio = clienteServicio;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClienteDto>>> ObtenerTodos(int idEmpresa = 1)
    {
        var clientes = await _clienteServicio.ObtenerTodosAsync(idEmpresa);
        return Ok(clientes);
    }
}
