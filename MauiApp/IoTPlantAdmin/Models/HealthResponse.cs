namespace IoTPlantAdmin.Models;

/// <summary>
/// Simple DTO returned by the NestJS backend health endpoint.
/// </summary>
public class HealthResponse
{
    public string Status { get; set; } = string.Empty;
}
