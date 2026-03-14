using IoTPlantAdmin.ViewModels;

namespace IoTPlantAdmin.Views;

public partial class MqttSettingsPage : ContentPage
{
    public MqttSettingsPage(MqttSettingsViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}
