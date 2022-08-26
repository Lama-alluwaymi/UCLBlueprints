namespace TestPerformanceReportGenerator
{
    [Command(PackageIds.MyCommand)]
    internal sealed class CodeQualityWindowCommand : BaseCommand<CodeQualityWindowCommand>
    {
        protected override Task ExecuteAsync(OleMenuCmdEventArgs e)
        {
            return CodeQualityToolWindow.ShowAsync();
        }
    }
}

