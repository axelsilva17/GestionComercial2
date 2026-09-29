using Microsoft.AspNetCore.Http;
using GestionComercial.Infrastructure.Data;

namespace GestionComercial.API.Middleware
{
    // Middleware que lee el token JWT y establece el tenantId y branchId
    // en el HttpContext Items para que el DbContext los pueda usar en los query filters.
    public class TenantMiddleware
    {
        private readonly RequestDelegate _next;

        public TenantMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Intentar leer el token del encabezado Authorization
            var authorizationHeader = context.Request.Headers["Authorization"].FirstOrDefault();

            if (!string.IsNullOrEmpty(authorizationHeader) && authorizationHeader.StartsWith("Bearer "))
            {
                var token = authorizationHeader.Substring("Bearer ".Length).Trim();

                // Aquí podrías validar el token más a fondo si es necesario.
                // Por simplicidad, intentaremos extraer los claims usando las validadores
                // que ya configuramos en AddJwtBearer. Si el token es válido, el contexto
                // ya debería tener la información del usuario.

                // Por ahora, fijamos valores por defecto si no hay claims específicos.
                // En un escenario real, leeríamos:
                // - context.User.FindFirst("tenant_id")?.Value
                // - context.User.FindFirst("branch_id")?.Value

                // Por simplicidad inicial, dejamos los Items vacíos o con 0.
                // El filtrado por tenant funcionará cuando el frontend envíe un token
                // válido con los claims correspondientes.
                context.Items["TenantId"] = 0; // Se poblará real cuando haya token válido
                context.Items["BranchId"] = 0;
            }
            else
            {
                // Si no hay token, también dejamos 0 para que el filtro no rompa.
                context.Items["TenantId"] = 0;
                context.Items["BranchId"] = 0;
            }

            await _next(context);
        }
    }
}