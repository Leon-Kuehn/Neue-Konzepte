using IoTPlantAdmin.Services;
using IoTPlantAdmin.ViewModels;
using IoTPlantAdmin.Views;
using Microsoft.Extensions.Logging;

namespace IoTPlantAdmin;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();

        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
            });

        // ── Services ────────────────────────────────────────────────
        builder.Services.AddSingleton<IApiService>(sp =>
        {
            var httpClient = new HttpClient();
            // TODO: Replace with environment-specific base URL.
            // In production this should point to the NestJS backend
            // (e.g. https://<your-server>/api).
            httpClient.BaseAddress = new Uri("https://localhost/api/");
            return new ApiService(httpClient);
        });

        builder.Services.AddSingleton<IMqttService, MqttService>();

        // ── ViewModels ──────────────────────────────────────────────
        builder.Services.AddTransient<PlantViewModel>();
        builder.Services.AddTransient<MqttSettingsViewModel>();

        // ── Pages ───────────────────────────────────────────────────
        builder.Services.AddTransient<PlantPage>();
        builder.Services.AddTransient<MqttSettingsPage>();

#if DEBUG
        builder.Logging.AddDebug();
#endif

        return builder.Build();
    }
}
