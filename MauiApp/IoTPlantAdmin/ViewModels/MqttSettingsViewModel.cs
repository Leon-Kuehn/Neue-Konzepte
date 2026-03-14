using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using IoTPlantAdmin.Models;
using IoTPlantAdmin.Services;

namespace IoTPlantAdmin.ViewModels;

/// <summary>
/// ViewModel for the MQTT settings page.
/// Mirrors the MqttSettingsPage.tsx from the React frontend.
/// </summary>
public partial class MqttSettingsViewModel : ObservableObject
{
    private readonly IMqttService _mqttService;

    public MqttSettingsViewModel(IMqttService mqttService)
    {
        _mqttService = mqttService;

        _mqttService.ConnectionStateChanged += state =>
        {
            ConnectionStatus = state.ToString();
            IsConnected = state == ConnectionState.Connected;
        };

        // Load persisted settings if available.
        LoadPersistedSettings();
    }

    // ── Observable properties ───────────────────────────────────

    [ObservableProperty]
    private string _protocol = "ws";

    [ObservableProperty]
    private string _host = "raspberrypi.local";

    [ObservableProperty]
    private int _port = 1883;

    [ObservableProperty]
    private string _clientId = $"plant-admin-{Guid.NewGuid():N}";

    [ObservableProperty]
    private string _username = string.Empty;

    [ObservableProperty]
    private string _password = string.Empty;

    [ObservableProperty]
    private bool _useTls;

    [ObservableProperty]
    private string _connectionStatus = ConnectionState.Disconnected.ToString();

    [ObservableProperty]
    private bool _isConnected;

    [ObservableProperty]
    private string? _lastError;

    [ObservableProperty]
    private bool _isBusy;

    // ── Commands ────────────────────────────────────────────────

    [RelayCommand]
    private async Task ConnectAsync()
    {
        IsBusy = true;
        LastError = null;

        var settings = BuildSettings();
        PersistSettings(settings);

        await _mqttService.ConnectAsync(settings);

        LastError = _mqttService.LastError;
        IsBusy = false;
    }

    [RelayCommand]
    private async Task DisconnectAsync()
    {
        IsBusy = true;
        await _mqttService.DisconnectAsync();
        LastError = null;
        IsBusy = false;
    }

    [RelayCommand]
    private async Task TestConnectionAsync()
    {
        IsBusy = true;
        LastError = null;

        var settings = BuildSettings();
        await _mqttService.ConnectAsync(settings);

        if (_mqttService.State == ConnectionState.Connected)
        {
            await _mqttService.DisconnectAsync();
            LastError = "Test successful – connection established and closed.";
        }
        else
        {
            LastError = _mqttService.LastError ?? "Connection test failed.";
        }

        IsBusy = false;
    }

    // ── Helpers ─────────────────────────────────────────────────

    private MqttSettings BuildSettings() => new()
    {
        Protocol = Protocol,
        Host = Host,
        Port = Port,
        ClientId = ClientId,
        Username = Username,
        Password = Password,
        UseTls = UseTls
    };

    /// <summary>
    /// Persists MQTT settings to device-local secure storage.
    /// Uses MAUI Preferences for non-sensitive and SecureStorage for credentials.
    /// </summary>
    private static void PersistSettings(MqttSettings settings)
    {
        // TODO: Replace with MAUI Preferences/SecureStorage calls
        // when running on a real device. These APIs are not available
        // in unit-test contexts without MAUI essentials.
        //
        // Example:
        //   Preferences.Set("mqtt_host", settings.Host);
        //   Preferences.Set("mqtt_port", settings.Port);
        //   await SecureStorage.SetAsync("mqtt_password", settings.Password);
    }

    /// <summary>
    /// Loads previously persisted MQTT settings.
    /// </summary>
    private void LoadPersistedSettings()
    {
        // TODO: Load from MAUI Preferences/SecureStorage on a real device.
        //
        // Example:
        //   Host = Preferences.Get("mqtt_host", "raspberrypi.local");
        //   Port = Preferences.Get("mqtt_port", 1883);
        //   Password = await SecureStorage.GetAsync("mqtt_password") ?? "";
    }
}
