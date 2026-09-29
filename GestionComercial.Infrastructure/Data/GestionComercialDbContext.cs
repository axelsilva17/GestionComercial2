using Microsoft.EntityFrameworkCore;
using GestionComercial.Domain.Entidades;

namespace GestionComercial.Infrastructure.Data
{
    public class GestionComercialDbContext : DbContext
    {
        private readonly int? _tenantId;
        private readonly int? _branchId;

        public GestionComercialDbContext(DbContextOptions<GestionComercialDbContext> options,
                                        int? tenantId, int? branchId)
            : base(options)
        {
            _tenantId = tenantId;
            _branchId = branchId;
        }

        public DbSet<Empresa> Empresas { get; set; }
        public DbSet<Sucursal> Sucursales { get; set; }
        public DbSet<Producto> Productos { get; set; }
        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Venta> Ventas { get; set; }

        protected override void OnModelCreating(ModelBuilder mb)
        {
            base.OnModelCreating(mb);

            // Configuración de claves y relaciones fluentes

            mb.Entity<Empresa>().HasKey(e => e.Id);
            mb.Entity<Empresa>().Property(e => e.RazonSocial).IsRequired();
            mb.Entity<Empresa>().Property(e => e.CuitCuil).HasMaxLength(150);

            mb.Entity<Sucursal>().HasKey(s => s.Id);
            mb.Entity<Sucursal>().Property(s => s.Nombre).IsRequired();
            mb.Entity<Sucursal>().Property(s => s.Direccion).HasMaxLength(200);
            mb.Entity<Sucursal>().Property(s => s.HorarioAtencion).HasMaxLength(100);

            mb.Entity<Producto>().HasKey(p => p.Id);
            mb.Entity<Producto>().Property(p => p.Nombre).IsRequired();
            mb.Entity<Producto>().Property(p => p.CodigoBarras).HasMaxLength(50);
            mb.Entity<Producto>().Property(p => p.Precio).HasColumnType("decimal(18,2)");
            mb.Entity<Producto>().Property(p => p.StockActual).HasDefaultValue(0);
            mb.Entity<Producto>().Property(p => p.StockMinimo).HasDefaultValue(0);

            mb.Entity<Cliente>().HasKey(c => c.Id);
            mb.Entity<Cliente>().Property(c => c.Nombre).IsRequired();
            mb.Entity<Cliente>().Property(c => c.Documento).HasMaxLength(20);
            mb.Entity<Cliente>().Property(c => c.Telefono).HasMaxLength(150);
            mb.Entity<Cliente>().Property(c => c.Email).HasMaxLength(200);

            mb.Entity<Venta>().HasKey(v => v.Id);
            mb.Entity<Venta>().Property(v => v.Total).HasColumnType("decimal(18,2)");
            mb.Entity<Venta>().Property(v => v.Descuento).HasDefaultValue(0m);
            mb.Entity<Venta>().Property(v => v.Fecha).HasColumnType("datetime2");

            // --- FILTROS DE MULTITENANCY (Query Filters) ---
            // Estos filtros se aplican automáticamente en cada consulta si hay tenant/branch seteados

            if (_tenantId.HasValue)
            {
                // Cada producto pertenece a una empresa
                mb.Entity<Producto>().HasQueryFilter(p => p.IdEmpresa == _tenantId.Value || p.IdEmpresa == 0);

                // Cada cliente pertenece a una empresa
                mb.Entity<Cliente>().HasQueryFilter(c => c.IdEmpresa == _tenantId.Value || c.IdEmpresa == 0);

                // Cada venta pertenece a una empresa
                mb.Entity<Venta>().HasQueryFilter(v => v.IdEmpresa == _tenantId.Value || v.IdEmpresa == 0);
            }

            // Las sucursales se filtran por empresa también
            if (_tenantId.HasValue)
            {
                mb.Entity<Sucursal>().HasQueryFilter(s => s.IdEmpresa == _tenantId.Value || s.IdEmpresa == 0);
            }
        }
    }
}