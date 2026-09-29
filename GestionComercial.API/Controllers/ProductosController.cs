using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GestionComercial.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GestionComercial.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Todo endpoint requiere JWT válido
    public class ProductosController : ControllerBase
    {
        private readonly GestionComercialDbContext _context;

        public ProductosController(GestionComercialDbContext context)
        {
            _context = context;
        }

        // GET: api/productos
        [HttpGet]
        public async System.Threading.Tasks.Task<ActionResult<List<Producto>>> GetProductos()
        {
            // Los query filters de multitenancy se aplicarán automáticamente
            var productos = await _context.Productos.ToListAsync();
            return Ok(productos);
        }

        // GET: api/productos/5
        [HttpGet("{id}")]
        public async System.Threading.Tasks.Task<ActionResult<Producto>> GetProducto(int id)
        {
            var producto = await _context.Productos.FindAsync(id);

            if (producto == null)
            {
                return NotFound();
            }

            return Ok(producto);
        }

        // POST: api/productos
        [HttpPost]
        public async System.Threading.Tasks.Task<ActionResult<Producto>> PostProducto(Producto producto)
        {
            _context.Productos.Add(producto);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProducto), new { id = producto.Id }, producto);
        }

        // PUT: api/productos/5
        [HttpPut("{id}")]
        public async System.Threading.Tasks.Task<IActionResult> PutProducto(int id, Producto producto)
        {
            if (id != producto.Id)
            {
                return BadRequest();
            }

            _context.Entry(producto).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/productos/5
        [HttpDelete("{id}")]
        public async System.Threading.Tasks.Task<IActionResult> DeleteProducto(int id)
        {
            var producto = await _context.Productos.FindAsync(id);

            if (producto == null)
            {
                return NotFound();
            }

            _context.Productos.Remove(producto);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}