namespace GestionComercial.Aplicacion.DTOs.Envios;
public class EnvioEstadoDto
{
    public int VentaId { get; set; }
    public string Estado { get; set; } = string.Empty;
    public DateTime Actualizado { get; set; }
}
