namespace GestionComercial.Aplicacion.DTOs.Clientes;
public class ClienteDto
{
    public int IdCliente { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public int Documento { get; set; }
    public uint Telefono { get; set; }
    public string Email { get; set; } = string.Empty;
    public bool Activo { get; set; }
    public int IdEmpresa { get; set; }
    public int TotalVentas { get; set; }
    public string Inicial => string.IsNullOrEmpty(Nombre) ? "?" : Nombre[0].ToString().ToUpper();
}
EOF; echo "ProductoDto..."; cat > /c/Users/Usuario/Desktop/GestionComercial2/GestionComercial.Application/DTOs/Productos/ProductoDto.cs << 'EOF'
namespace GestionComercial.Aplicacion.DTOs.Productos;
public class ProductoDto
{
    public int IdProducto { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string CodigoBarra { get; set; } = string.Empty;
    public decimal PrecioVentaActual { get; set; }
    public decimal PrecioCostoActual { get; set; }
    public int StockActual { get; set; }
    public int StockMinimo { get; set; }
    public bool Activo { get; set; }
    public int IdEmpresa { get; set; }
    public int IdCategoria { get; set; }
    public string CategoriaNombre { get; set; } = string.Empty;
    public int IdUnidadMedida { get; set; }
    public string UnidadMedida { get; set; } = string.Empty;
    public int? IdUnidadMedidaCompra { get; set; }
    public decimal FactorConversion { get; set; }
    public string Inicial => string.IsNullOrEmpty(Nombre) ? "?" : Nombre[0].ToString().ToUpper();
}
EOF; echo "VentaResumenDto (simplificado por B)..."; cat > /c/Users/Usuario/Desktop/GestionComercial2/GestionComercial.Application/DTOs/Ventas/VentaResumenDto.cs << 'EOF'
using System;
namespace GestionComercial.Aplicacion.DTOs.Ventas;
public class VentaResumenDto
{
    public int IdVenta { get; set; }
    public DateTime Fecha { get; set; }
    public int IdSucursal { get; set; }
    public int IdCliente { get; set; }
    public decimal Total { get; set; }
    public int Estado { get; set; }
    public string ClienteNombre { get; set; } = string.Empty;
}
