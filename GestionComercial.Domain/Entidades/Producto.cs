using System.ComponentModel.DataAnnotations;

namespace GestionComercial.Domain.Entidades
{
    public class Producto
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre es obligatorio")]
        [MaxLength(100, ErrorMessage = "Máximo 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(50, ErrorMessage = "Máximo 50 caracteres")]
        public string? CodigoBarras { get; set; }

        public decimal Precio { get; set; }

        public int StockActual { get; set; }

        public int StockMinimo { get; set; }

        public int IdEmpresa { get; set; }

        public int? IdSucursal { get; set; }

        public bool Activo { get; set; } = true;
    }
}