using System.Globalization;

namespace IoTPlantAdmin.Converters;

/// <summary>
/// Converts a boolean value to a Color.
/// Used for online/offline indicator dots.
/// </summary>
public class BoolToColorConverter : IValueConverter
{
    public Color TrueColor { get; set; } = Colors.Green;
    public Color FalseColor { get; set; } = Colors.Red;

    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        return value is true ? TrueColor : FalseColor;
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        throw new NotSupportedException();
    }
}
