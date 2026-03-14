using IoTPlantAdmin.Models;

namespace IoTPlantAdmin.Services;

/// <summary>
/// Abstraction for MQTT broker connectivity.
/// Mirrors the semantics of the React frontend's mqttClient.ts.
/// </summary>
public interface IMqttService
{
    /// <summary>Fires when the connection state changes.</summary>
    event Action<ConnectionState>? ConnectionStateChanged;

    /// <summary>Fires when a message arrives on a subscribed topic.</summary>
    event Action<string, string>? MessageReceived;

    /// <summary>Current connection state.</summary>
    ConnectionState State { get; }

    /// <summary>Last error message, if any.</summary>
    string? LastError { get; }

    /// <summary>Connect to the broker using the given settings.</summary>
    Task ConnectAsync(MqttSettings settings);

    /// <summary>Disconnect from the broker.</summary>
    Task DisconnectAsync();

    /// <summary>Subscribe to an MQTT topic.</summary>
    Task SubscribeAsync(string topic);

    /// <summary>Publish a message to an MQTT topic.</summary>
    Task PublishAsync(string topic, string payload);
}

public enum ConnectionState
{
    Disconnected,
    Connecting,
    Connected,
    Error
}
