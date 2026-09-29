using System.ComponentModel.DataAnnotations;

namespace GestionComercial.Domain.Entidades
{
    public class Venta
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public decimal Total { get; set; }

        public decimal Descuento { get; set; }

        public DateTime Fecha { get; set; } = DateTime.Now;

        public int IdEmpresa { get; set; }

        public int? IdSucursal { get; set; }

        public int IdUsuario { get; set; }

        public bool Anulada { get; set; } = false;

        // Navegación
        public virtual Empresa Empresa { get; set; } = null!;
        public virtual Sucursal? Sucursal { get; set; }
    }
}