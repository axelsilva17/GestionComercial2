using System.ComponentModel.DataAnnotations;

namespace GestionComercial.Domain.Entidades
{
    public class Empresa
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "La razón social es obligatoria")]
        [MaxLength(150, ErrorMessage = "Máximo 150 caracteres")]
        public string RazonSocial { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? NombreComercial { get; set; }

        [MaxLength(150)]
        public string? CuitCuil { get; set; }

        public bool Activo { get; set; } = true;

        // Navegación
        public virtual ICollection<Sucursal> Sucursales { get; set; } = new List<Sucursal>();
        public virtual ICollection<Producto> Productos { get; set; } = new List<Producto>();
    }
}