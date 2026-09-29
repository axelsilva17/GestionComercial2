using System.ComponentModel.DataAnnotations;

namespace GestionComercial.Domain.Entidades
{
    public class Sucursal
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre es obligatorio")]
        [MaxLength(100, ErrorMessage = "Máximo 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Direccion { get; set; }

        public string? HorarioAtencion { get; set; }

        public int IdEmpresa { get; set; }

        public bool Activo { get; set; } = true;

        // Navegación
        public virtual Empresa Empresa { get; set; } = null!;
        public virtual ICollection<Producto> Productos { get; set; } = new List<Producto>();
        public virtual ICollection<Venta> Ventas { get; set; } = new List<Venta>();
    }
}