namespace IoTPlantAdmin.Models;

/// <summary>
/// Represents a plant component (sensor, actuator, conveyor, etc.).
/// Mirrors the PlantComponent interface from the React frontend
/// (frontend/src/types/PlantComponent.ts).
/// </summary>
public class PlantComponent
{
    public string Id { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    /// <summary>"sensor" or "actuator".</summary>
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// Category such as "conveyor", "rotating-conveyor", "press",
    /// "inductive-sensor", "rfid-sensor", "optical-sensor",
    /// "pneumatic-unit", "crane", "storage", "input".
    /// </summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>"on" or "off".</summary>
    public string Status { get; set; } = "off";

    public bool Online { get; set; }

    /// <summary>ISO 8601 timestamp of last state change.</summary>
    public string LastChanged { get; set; } = string.Empty;

    public ComponentStats Stats { get; set; } = new();

    public ComponentMqttTopics MqttTopics { get; set; } = new();
}

public class ComponentStats
{
    public int? Cycles { get; set; }

    public double? UptimeHours { get; set; }

    public object? LastValue { get; set; }
}

public class ComponentMqttTopics
{
    public string Status { get; set; } = string.Empty;

    public string? Command { get; set; }

    public string? Telemetry { get; set; }
}
