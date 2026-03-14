using IoTPlantAdmin.Models;
using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Protocol;

namespace IoTPlantAdmin.Services;

/// <summary>
/// MQTT client service backed by MQTTnet.
/// Mirrors the behaviour of the React frontend's mqttClient.ts.
/// </summary>
public class MqttService : IMqttService, IDisposable
{
    private IMqttClient? _client;

    public event Action<ConnectionState>? ConnectionStateChanged;
    public event Action<string, string>? MessageReceived;

    public ConnectionState State { get; private set; } = ConnectionState.Disconnected;
    public string? LastError { get; private set; }

    /// <inheritdoc />
    public async Task ConnectAsync(MqttSettings settings)
    {
        try
        {
            await DisconnectAsync();

            SetState(ConnectionState.Connecting);

            var factory = new MqttFactory();
            _client = factory.CreateMqttClient();

            // Build the broker URI: ws[s]://host:port/mqtt
            var uri = $"{settings.Protocol}://{settings.Host}:{settings.Port}/mqtt";

            var optionsBuilder = new MqttClientOptionsBuilder()
                .WithWebSocketServer(o => o.WithUri(uri))
                .WithClientId(settings.ClientId)
                .WithCleanSession();

            if (!string.IsNullOrEmpty(settings.Username))
            {
                optionsBuilder.WithCredentials(settings.Username, settings.Password);
            }

            if (settings.UseTls)
            {
                optionsBuilder.WithTlsOptions(o => o.UseTls());
            }

            _client.ApplicationMessageReceivedAsync += OnMessageReceivedAsync;
            _client.DisconnectedAsync += OnDisconnectedAsync;

            await _client.ConnectAsync(optionsBuilder.Build());
            SetState(ConnectionState.Connected);
            LastError = null;
        }
        catch (Exception ex)
        {
            LastError = ex.Message;
            SetState(ConnectionState.Error);
        }
    }

    /// <inheritdoc />
    public async Task DisconnectAsync()
    {
        if (_client?.IsConnected == true)
        {
            await _client.DisconnectAsync();
        }

        SetState(ConnectionState.Disconnected);
    }

    /// <inheritdoc />
    public async Task SubscribeAsync(string topic)
    {
        if (_client?.IsConnected != true)
            return;

        var options = new MqttClientSubscribeOptionsBuilder()
            .WithTopicFilter(topic, MqttQualityOfServiceLevel.AtLeastOnce)
            .Build();

        await _client.SubscribeAsync(options);
    }

    /// <inheritdoc />
    public async Task PublishAsync(string topic, string payload)
    {
        if (_client?.IsConnected != true)
            return;

        var message = new MqttApplicationMessageBuilder()
            .WithTopic(topic)
            .WithPayload(payload)
            .WithQualityOfServiceLevel(MqttQualityOfServiceLevel.AtLeastOnce)
            .Build();

        await _client.PublishAsync(message);
    }

    public void Dispose()
    {
        _client?.Dispose();
        GC.SuppressFinalize(this);
    }

    // ── Private helpers ──────────────────────────────────────────

    private void SetState(ConnectionState state)
    {
        State = state;
        ConnectionStateChanged?.Invoke(state);
    }

    private Task OnMessageReceivedAsync(MqttApplicationMessageReceivedEventArgs e)
    {
        var topic = e.ApplicationMessage.Topic;
        var payload = System.Text.Encoding.UTF8.GetString(
            e.ApplicationMessage.PayloadSegment);

        MessageReceived?.Invoke(topic, payload);
        return Task.CompletedTask;
    }

    private Task OnDisconnectedAsync(MqttClientDisconnectedEventArgs e)
    {
        if (e.Exception != null)
        {
            LastError = e.Exception.Message;
            SetState(ConnectionState.Error);
        }
        else
        {
            SetState(ConnectionState.Disconnected);
        }

        return Task.CompletedTask;
    }
}
