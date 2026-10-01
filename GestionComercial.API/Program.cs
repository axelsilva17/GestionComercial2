using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using GestionComercial.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// --- Configuración de cadena de conexión ---
builder.Services.AddDbContext<GestionComercialDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default"));
});

// --- Configuración de JWT Authentication ---
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));
var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>();

var key = Encoding.UTF8.GetBytes(jwtSettings!.Key);
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        // Permitir que el tenant/branch vengan en los claims
        NameClaimType = "name",
        RoleClaimType = "role"
    };
});

// --- Services ---
builder.Services.AddScoped<TenantMiddleware>();
// --- Services por capa (Clean Architecture, no addEverything) ---
builder.Services.AddDomainServices();
builder.Services.AddApplicationServices(); // B: clave + Envío
builder.Services.AddInfrastructureServices();  // adaptadores reservados
builder.Services.AddApiServices();            // Web/API
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- CORS (permitir que el frontend acceda) ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        builder => builder
            .WithOrigins("http://localhost:5174", "http://localhost:5173")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
});

var app = builder.Build();

// --- Pipeline de middleware ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();      // ¡Muy importante!
app.UseAuthorization();
app.UseTenantMiddleware();    // Middleware que inyecta el tenantId/branchId del JWT

app.MapControllers();
app.Run();

// Clase para configuración fuertemente tipada de JWT
public class JwtSettings
{
    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpiresInMinutes { get; set; } = 120;
}