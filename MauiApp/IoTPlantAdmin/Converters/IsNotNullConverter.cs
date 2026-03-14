using System.Globalization;

namespace IoTPlantAdmin.Converters;

/// <summary>
/// Returns true if the value is not null (and not empty for strings).
/// Used to control visibility of error banners and messages.
/// </summary>
public class IsNotNullConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        return value switch
        {
            null => false,
            string s => !string.IsNullOrEmpty(s),
            _ => true
        };
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        throw new NotSupportedException();
    }
}
