namespace CodeQualityReportGen
{
    [Command(PackageIds.MyCommand)]
    internal sealed class CodeQualityWindowCommand : BaseCommand<CodeQualityWindowCommand>
    {
        protected override async Task ExecuteAsync(OleMenuCmdEventArgs e)
        {
            await CodeQualityToolWindow.ShowAsync();
            await QualityOverviewToolWindow.ShowAsync();
        }
    }
}

