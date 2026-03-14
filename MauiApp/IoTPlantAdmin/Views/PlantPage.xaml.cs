using IoTPlantAdmin.ViewModels;

namespace IoTPlantAdmin.Views;

public partial class PlantPage : ContentPage
{
    public PlantPage(PlantViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();

        if (BindingContext is PlantViewModel vm)
        {
            vm.LoadDataCommand.Execute(null);
        }
    }
}
