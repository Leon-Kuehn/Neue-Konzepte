using IoTPlantAdmin.Models;

namespace IoTPlantAdmin.Services;

/// <summary>
/// HTTP client abstraction for the NestJS backend API.
/// </summary>
public interface IApiService
{
    /// <summary>
    /// Calls GET /health and returns the parsed response.
    /// </summary>
    Task<HealthResponse> GetHealthAsync();

    /// <summary>
    /// Returns all plant components known to the backend.
    /// TODO: Wire to the actual backend endpoint once defined
    /// (currently the React frontend uses in-memory mock data).
    /// </summary>
    Task<IReadOnlyList<PlantComponent>> GetPlantComponentsAsync();

    /// <summary>
    /// Returns recent sensor data records.
    /// Maps to GET /sensor-data on the NestJS backend.
    /// </summary>
    Task<IReadOnlyList<SensorData>> GetSensorDataAsync();
}
