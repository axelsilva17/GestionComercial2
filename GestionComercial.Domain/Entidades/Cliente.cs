using System.ComponentModel.DataAnnotations;

namespace GestionComercial.Domain.Entidades
{
    public class Cliente
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre es obligatorio")]
        [MaxLength(100, ErrorMessage = "Máximo 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Documento { get; set; }

        [MaxLength(150)]
        public string? Telefono { get; set; }

        [MaxLength(200)]
        public string? Email { get; set; }

        public int IdEmpresa { get; set; }

        public bool Activo { get; set; } = true;

        // Navegación
        public virtual Empresa Empresa { get; set; } = null!;
    }
}