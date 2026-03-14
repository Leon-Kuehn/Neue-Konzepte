namespace IoTPlantAdmin.Models;

/// <summary>
/// Represents a sensor data record as stored in the backend database.
/// Mirrors the Prisma SensorData model (backend/prisma/schema.prisma).
/// </summary>
public class SensorData
{
    public int Id { get; set; }

    public string ComponentId { get; set; } = string.Empty;

    public string Topic { get; set; } = string.Empty;

    /// <summary>
    /// JSON payload received from the MQTT broker.
    /// Stored as a string; deserialise as needed.
    /// </summary>
    public string Payload { get; set; } = string.Empty;

    public DateTime ReceivedAt { get; set; }
}
