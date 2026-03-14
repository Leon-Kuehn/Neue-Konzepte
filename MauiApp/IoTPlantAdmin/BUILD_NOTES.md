# IoTPlantAdmin Build Notes (Windows)

## Chosen SDK and target
- SDK pin: `11.0.100-preview.2.26159.112` via `global.json`
- MAUI target framework: `net11.0-windows10.0.19041.0`
- Project SDK: `Microsoft.NET.Sdk` with `<UseMaui>true</UseMaui>`

Reason: in this environment, the legacy project SDK identifier `Microsoft.NET.Sdk.Maui` did not resolve (`MSB4236`) even with workloads installed. Using `Microsoft.NET.Sdk` + `UseMaui` is the supported MAUI project shape and resolves correctly.

## Expected SDK checks
From `MauiApp/IoTPlantAdmin`:

```powershell
& "C:/Program Files/dotnet/dotnet.exe" --version
& "C:/Program Files/dotnet/dotnet.exe" --info
```

Expected:
- `--version` resolves to `11.0.100-preview.2.26159.112` (because of local `global.json`).
- `--info` shows `.NET SDK: 11.0.100-preview.2.26159.112` as the active SDK.

## MAUI workload checks
Check installed workloads for the chosen SDK:

```powershell
& "C:/Program Files/dotnet/dotnet.exe" workload list
& "C:/Program Files/dotnet/dotnet.exe" workload search maui
```

Expected:
- `workload list` includes MAUI workload entries required for your target.
- For Windows-only targeting, install at least `maui-windows` (or `maui`).

If `Microsoft.NET.Sdk.Maui` cannot be resolved, install the MAUI workload for this SDK:

```powershell
& "C:/Program Files/dotnet/dotnet.exe" workload install maui-windows
```

Or install the full MAUI workload bundle:

```powershell
& "C:/Program Files/dotnet/dotnet.exe" workload install maui
```

## Build and run commands
From `frontend` (first terminal):

```powershell
Set-Location "<repo>/frontend"
npm.cmd install
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 4173
```

From `MauiApp/IoTPlantAdmin` (second terminal):

```powershell
& "C:/Program Files/dotnet/dotnet.exe" build -f net11.0-windows10.0.19041.0
& "C:/Program Files/dotnet/dotnet.exe" run -f net11.0-windows10.0.19041.0
```

The MAUI start page uses a WebView and loads `http://localhost:4173`.

UI hints:
- `Quelle` picker switches between local preview and server URL.
- Status line shows `Verbunden` or `Nicht erreichbar`.
- `Vollbild` hides the top bar; `Leiste` shows it again.

WebView URL config:
- File: `Resources/Raw/webappsettings.json`
- Keys: `localUrl`, `serverUrl`
- Change these values to switch endpoints without code edits.

If `dotnet` is already on PATH in your shell, the same commands work without full path to `dotnet.exe`.
