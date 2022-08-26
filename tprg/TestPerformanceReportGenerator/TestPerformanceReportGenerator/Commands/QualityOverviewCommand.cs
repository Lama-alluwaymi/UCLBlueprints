namespace TestPerformanceReportGenerator
{
    [Command(PackageIds.QualityOverviewCommand)]
    internal sealed class QualityOverviewCommand : BaseCommand<QualityOverviewCommand>
    {
        protected override Task ExecuteAsync(OleMenuCmdEventArgs e)
        {
            return QualityOverviewToolWindow.ShowAsync();
        }
    }
}
