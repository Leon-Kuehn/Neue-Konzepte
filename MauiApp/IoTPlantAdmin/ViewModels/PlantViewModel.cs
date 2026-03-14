using System.Collections.ObjectModel;
using System.Text.Json;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using IoTPlantAdmin.Models;
using IoTPlantAdmin.Services;

namespace IoTPlantAdmin.ViewModels;

/// <summary>
/// ViewModel for the Plant overview page.
/// Combines REST API data with live MQTT updates,
/// mirroring the behaviour of PlantOverviewPage.tsx in the React frontend.
/// </summary>
public partial class PlantViewModel : ObservableObject
{
    private readonly IApiService _apiService;
    private readonly IMqttService _mqttService;

    public PlantViewModel(IApiService apiService, IMqttService mqttService)
    {
        _apiService = apiService;
        _mqttService = mqttService;

        _mqttService.MessageReceived += OnMqttMessageReceived;
        _mqttService.ConnectionStateChanged += state =>
            MqttConnectionState = state.ToString();
    }

    // ── Observable properties ───────────────────────────────────

    [ObservableProperty]
    private ObservableCollection<PlantComponent> _components = [];

    [ObservableProperty]
    private PlantComponent? _selectedComponent;

    [ObservableProperty]
    private bool _isBusy;

    [ObservableProperty]
    private string? _errorMessage;

    [ObservableProperty]
    private string _mqttConnectionState = ConnectionState.Disconnected.ToString();

    // ── Commands ────────────────────────────────────────────────

    [RelayCommand]
    private async Task LoadDataAsync()
    {
        try
        {
            IsBusy = true;
            ErrorMessage = null;

            var items = await _apiService.GetPlantComponentsAsync();

            Components = new ObservableCollection<PlantComponent>(items);

            // Subscribe to MQTT status topics for every component.
            foreach (var c in Components)
            {
                if (!string.IsNullOrEmpty(c.MqttTopics.Status))
                {
                    await _mqttService.SubscribeAsync(c.MqttTopics.Status);
                }
            }
        }
        catch (HttpRequestException ex)
        {
            ErrorMessage = $"Unable to reach the backend API: {ex.Message}";
        }
        catch (Exception ex)
        {
            ErrorMessage = $"An error occurred: {ex.Message}";
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    private void SelectComponent(PlantComponent? component)
    {
        SelectedComponent = component;
    }

    // ── MQTT message handler ────────────────────────────────────

    /// <summary>
    /// Handles incoming MQTT messages and updates the matching component.
    /// Expected topic pattern: plant/{componentId}/status
    /// Expected payload JSON: { "status": "on"|"off", "online": true|false,
    ///                           "cycles": number, "uptimeHours": number }
    /// </summary>
    private void OnMqttMessageReceived(string topic, string payload)
    {
        // TODO: Adjust topic parsing once real MQTT topic structure
        // from the Mosquitto broker is confirmed (see backend/src/mqtt/mqtt.service.ts).
        var parts = topic.Split('/');
        if (parts.Length < 3)
            return;

        var componentId = parts[1];
        var component = Components.FirstOrDefault(c => c.Id == componentId);
        if (component is null)
            return;

        try
        {
            using var doc = JsonDocument.Parse(payload);
            var root = doc.RootElement;

            if (root.TryGetProperty("status", out var statusEl))
                component.Status = statusEl.GetString() ?? component.Status;

            if (root.TryGetProperty("online", out var onlineEl))
                component.Online = onlineEl.GetBoolean();

            if (root.TryGetProperty("cycles", out var cyclesEl))
                component.Stats.Cycles = cyclesEl.GetInt32();

            if (root.TryGetProperty("uptimeHours", out var uptimeEl))
                component.Stats.UptimeHours = uptimeEl.GetDouble();

            component.LastChanged = DateTime.UtcNow.ToString("o");
        }
        catch (JsonException)
        {
            // Silently ignore malformed payloads.
        }
    }
}
