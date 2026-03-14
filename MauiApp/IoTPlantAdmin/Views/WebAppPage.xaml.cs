namespace IoTPlantAdmin.Views;

public partial class WebAppPage : ContentPage
{
    private const string DefaultLocalFrontendUrl = "http://localhost:4173";
    private const string DefaultServerFrontendUrl = "https://localhost";

    private bool _isImmersiveMode;
    private bool _isInitialized;
    private string _localFrontendUrl = DefaultLocalFrontendUrl;
    private string _serverFrontendUrl = DefaultServerFrontendUrl;
    private string _currentUrl = DefaultLocalFrontendUrl;

    public WebAppPage()
    {
        InitializeComponent();

        // The embedded browser should feel like the app itself.
        Shell.SetNavBarIsVisible(this, false);

        SourcePicker.SelectedIndex = 0;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();

        if (_isInitialized)
        {
            return;
        }

        _isInitialized = true;
        await LoadConfigAsync();
        NavigateTo(_localFrontendUrl);
    }

    private async Task LoadConfigAsync()
    {
        try
        {
            await using var fileStream = await FileSystem.OpenAppPackageFileAsync("webappsettings.json");
            using var reader = new StreamReader(fileStream);
            var json = await reader.ReadToEndAsync();
            var config = System.Text.Json.JsonSerializer.Deserialize<WebAppSettings>(json);

            if (!string.IsNullOrWhiteSpace(config?.LocalUrl))
            {
                _localFrontendUrl = config.LocalUrl;
            }

            if (!string.IsNullOrWhiteSpace(config?.ServerUrl))
            {
                _serverFrontendUrl = config.ServerUrl;
            }
        }
        catch
        {
            // Keep defaults if config file is missing or invalid.
            _localFrontendUrl = DefaultLocalFrontendUrl;
            _serverFrontendUrl = DefaultServerFrontendUrl;
        }
    }

    private void NavigateTo(string url)
    {
        _currentUrl = url;
        UrlLabel.Text = url;
        CustomUrlEntry.Text = url;
        AppWebView.Source = url;
        SetStatus("Lade Seite ...", Colors.OrangeRed);
    }

    private void SetStatus(string message, Color color)
    {
        StatusLabel.Text = message;
        StatusDot.TextColor = color;
    }

    private void OnSourcePickerChanged(object? sender, EventArgs e)
    {
        var selectedUrl = SourcePicker.SelectedIndex switch
        {
            1 => _serverFrontendUrl,
            _ => _localFrontendUrl,
        };

        NavigateTo(selectedUrl);
    }

    private void OnOpenCustomClicked(object? sender, EventArgs e)
    {
        OpenCustomUrl();
    }

    private void OnCustomUrlCompleted(object? sender, EventArgs e)
    {
        OpenCustomUrl();
    }

    private void OpenCustomUrl()
    {
        var rawInput = CustomUrlEntry.Text?.Trim();

        if (string.IsNullOrWhiteSpace(rawInput))
        {
            SetStatus("Bitte URL eingeben", Colors.OrangeRed);
            return;
        }

        var normalized = NormalizeUrl(rawInput);
        if (normalized is null)
        {
            SetStatus("Ungueltige URL", Colors.Crimson);
            return;
        }

        NavigateTo(normalized);
    }

    private static string? NormalizeUrl(string rawInput)
    {
        var withScheme = rawInput.Contains("://", StringComparison.Ordinal)
            ? rawInput
            : $"http://{rawInput}";

        return Uri.TryCreate(withScheme, UriKind.Absolute, out var uri)
            ? uri.ToString()
            : null;
    }

    private void OnWebViewNavigating(object? sender, WebNavigatingEventArgs e)
    {
        SetStatus("Verbinde ...", Colors.OrangeRed);
    }

    private void OnWebViewNavigated(object? sender, WebNavigatedEventArgs e)
    {
        if (e.Result == WebNavigationResult.Success)
        {
            SetStatus("Verbunden", Colors.ForestGreen);
            return;
        }

        SetStatus($"Nicht erreichbar ({e.Result})", Colors.Crimson);
    }

    private void OnToggleImmersiveClicked(object? sender, EventArgs e)
    {
        _isImmersiveMode = true;
        TopBar.IsVisible = false;
        ShowToolbarButton.IsVisible = true;
    }

    private void OnShowToolbarClicked(object? sender, EventArgs e)
    {
        _isImmersiveMode = false;
        TopBar.IsVisible = true;
        ShowToolbarButton.IsVisible = false;
    }

    private void OnReloadClicked(object? sender, EventArgs e)
    {
        if (_isImmersiveMode)
        {
            ShowToolbarButton.IsVisible = true;
        }

        SetStatus("Lade neu ...", Colors.OrangeRed);
        AppWebView.Reload();
    }

    private sealed class WebAppSettings
    {
        public string? LocalUrl { get; init; }

        public string? ServerUrl { get; init; }
    }
}
