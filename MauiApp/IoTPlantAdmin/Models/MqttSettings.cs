namespace IoTPlantAdmin.Models;

/// <summary>
/// Settings required to connect to an external MQTT broker.
/// Mirrors the MqttSettings interface from the React frontend
/// (frontend/src/types/MqttSettings.ts).
/// </summary>
public class MqttSettings
{
    /// <summary>"ws" or "wss".</summary>
    public string Protocol { get; set; } = "ws";

    /// <summary>Broker hostname, e.g. "raspberrypi.local".</summary>
    public string Host { get; set; } = "raspberrypi.local";

    /// <summary>Broker port, e.g. 1883 or 8883.</summary>
    public int Port { get; set; } = 1883;

    /// <summary>Unique client identifier.</summary>
    public string ClientId { get; set; } = $"plant-admin-{Guid.NewGuid():N}";

    public string Username { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public bool UseTls { get; set; }
}
