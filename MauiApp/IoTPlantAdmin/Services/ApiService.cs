using System.Net.Http.Json;
using IoTPlantAdmin.Models;

namespace IoTPlantAdmin.Services;

/// <summary>
/// Concrete implementation of <see cref="IApiService"/> that communicates
/// with the NestJS backend over HTTP.
/// </summary>
public class ApiService : IApiService
{
    private readonly HttpClient _httpClient;

    public ApiService(HttpClient httpClient)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
    }

    /// <inheritdoc />
    public async Task<HealthResponse> GetHealthAsync()
    {
        // The backend exposes GET /api/health → { status: "ok" }.
        var response = await _httpClient.GetAsync("health");
        response.EnsureSuccessStatusCode();
        var health = await response.Content.ReadFromJsonAsync<HealthResponse>();
        return health ?? new HealthResponse { Status = "unknown" };
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<PlantComponent>> GetPlantComponentsAsync()
    {
        // TODO: The NestJS backend does not yet expose a dedicated
        // /components endpoint. The React frontend currently uses
        // hard-coded mock data (frontend/src/types/mockData.ts).
        // Once the backend provides a REST endpoint for plant components,
        // replace this placeholder with a real HTTP call.
        //
        // Example future implementation:
        //   var components = await _httpClient.GetFromJsonAsync<List<PlantComponent>>("components");
        //   return components ?? [];

        await Task.CompletedTask;
        return [];
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<SensorData>> GetSensorDataAsync()
    {
        // Maps to GET /api/sensor-data on the NestJS backend.
        var data = await _httpClient.GetFromJsonAsync<List<SensorData>>("sensor-data");
        return data ?? [];
    }
}
