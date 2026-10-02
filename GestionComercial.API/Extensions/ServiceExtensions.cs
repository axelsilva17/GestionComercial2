using GestionComercial.Aplicacion.Servicios;
using Microsoft.Extensions.DependencyInjection;

namespace GestionComercial.API.Extensions;

// Cada capa expone su método — no un addEverything (regla de diseño).
public static class ServiceExtensions
{
    // --- Domain (modelo / entidades / contratos) ---
    public static IServiceCollection AddDomainServices(this IServiceCollection services)
    {
        // Reservado para servicios del dominio (reglas de negocio puras).
        return services;
    }

    // --- Application (casos de uso / servicios de aplicación) ---
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Opción B: clave (Cliente/Producto/Venta simplificado + Auth)
        services.AddScoped<ClienteServicio>();
        services.AddScoped<ProductoServicio>();
        services.AddScoped<VentaServicio>();
        services.AddScoped<AutenticacionServicio>();

        // Módulo nuevo: Envío (envío/logística)
        services.AddScoped<EnvioServicio>();

        return services;
    }

    // --- Infrastructure (adaptadores / persistencia / servicios externos) ---
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services)
    {
        // Adaptadores: gateway de pago, email/SMS, inventario externo, reportes.
        // Estructura reservada para integración por capa (sin mezclar Application).
        return services;
    }

    // --- API (controladores / middleware / JWT / CORS) ---
    public static IServiceCollection AddApiServices(this IServiceCollection services)
    {
        // Registrado directamente en Program.cs (Controllers, Swagger, CORS, JWT).
        return services;
    }
}
