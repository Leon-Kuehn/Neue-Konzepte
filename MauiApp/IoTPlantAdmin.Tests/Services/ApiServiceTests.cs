using System.Net;
using System.Text.Json;
using IoTPlantAdmin.Models;
using IoTPlantAdmin.Services;
using Moq;
using Moq.Protected;
using Xunit;

namespace IoTPlantAdmin.Tests.Services;

public class ApiServiceTests
{
    /// <summary>
    /// Creates an ApiService backed by a mocked HttpMessageHandler.
    /// </summary>
    private static (ApiService service, Mock<HttpMessageHandler> handler) CreateService()
    {
        var handler = new Mock<HttpMessageHandler>(MockBehavior.Strict);
        var client = new HttpClient(handler.Object)
        {
            BaseAddress = new Uri("https://localhost/api/")
        };
        return (new ApiService(client), handler);
    }

    private static void SetupResponse(
        Mock<HttpMessageHandler> handler,
        HttpStatusCode statusCode,
        string content,
        string? expectedPath = null)
    {
        handler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.Is<HttpRequestMessage>(req =>
                    expectedPath == null ||
                    req.RequestUri!.PathAndQuery.Contains(expectedPath)),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = statusCode,
                Content = new StringContent(content,
                    System.Text.Encoding.UTF8, "application/json")
            });
    }

    // ── GetHealthAsync ──────────────────────────────────────────

    [Fact]
    public async Task GetHealthAsync_ReturnsOk_WhenBackendIsHealthy()
    {
        var (service, handler) = CreateService();
        SetupResponse(handler, HttpStatusCode.OK,
            """{"status":"ok"}""", "health");

        var result = await service.GetHealthAsync();

        Assert.Equal("ok", result.Status);
    }

    [Fact]
    public async Task GetHealthAsync_ReturnsUnknown_WhenBodyIsNull()
    {
        var (service, handler) = CreateService();
        SetupResponse(handler, HttpStatusCode.OK, "null", "health");

        var result = await service.GetHealthAsync();

        Assert.Equal("unknown", result.Status);
    }

    [Fact]
    public async Task GetHealthAsync_ThrowsHttpRequestException_OnServerError()
    {
        var (service, handler) = CreateService();
        SetupResponse(handler, HttpStatusCode.InternalServerError,
            """{"error":"fail"}""", "health");

        await Assert.ThrowsAsync<HttpRequestException>(
            () => service.GetHealthAsync());
    }

    [Fact]
    public async Task GetHealthAsync_ThrowsHttpRequestException_OnNotFound()
    {
        var (service, handler) = CreateService();
        SetupResponse(handler, HttpStatusCode.NotFound, "", "health");

        await Assert.ThrowsAsync<HttpRequestException>(
            () => service.GetHealthAsync());
    }

    // ── GetSensorDataAsync ──────────────────────────────────────

    [Fact]
    public async Task GetSensorDataAsync_ReturnsEmptyList_WhenNoData()
    {
        var (service, handler) = CreateService();
        SetupResponse(handler, HttpStatusCode.OK, "[]", "sensor-data");

        var result = await service.GetSensorDataAsync();

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetSensorDataAsync_ReturnsParsedData()
    {
        var data = new[]
        {
            new
            {
                id = 1,
                componentId = "conv-1",
                topic = "plant/conv-1/status",
                payload = "{}",
                receivedAt = "2026-01-01T00:00:00Z"
            }
        };
        var json = JsonSerializer.Serialize(data,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        var (service, handler) = CreateService();
        SetupResponse(handler, HttpStatusCode.OK, json, "sensor-data");

        var result = await service.GetSensorDataAsync();

        Assert.Single(result);
        Assert.Equal("conv-1", result[0].ComponentId);
    }

    // ── GetPlantComponentsAsync ─────────────────────────────────

    [Fact]
    public async Task GetPlantComponentsAsync_ReturnsEmptyList_Placeholder()
    {
        // Currently returns empty because the backend doesn't have
        // a /components endpoint yet. This test documents that behaviour.
        var (service, _) = CreateService();

        var result = await service.GetPlantComponentsAsync();

        Assert.Empty(result);
    }

    // ── Constructor ─────────────────────────────────────────────

    [Fact]
    public void Constructor_ThrowsArgumentNullException_WhenHttpClientIsNull()
    {
        Assert.Throws<ArgumentNullException>(() => new ApiService(null!));
    }
}
