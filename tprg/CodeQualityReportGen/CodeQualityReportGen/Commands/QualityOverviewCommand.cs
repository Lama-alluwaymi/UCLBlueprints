namespace CodeQualityReportGen
{
    [Command(PackageIds.QualityOverviewCommand)]
    internal sealed class QualityOverviewCommand : BaseCommand<QualityOverviewCommand>
    {
        protected override async Task ExecuteAsync(OleMenuCmdEventArgs e)
        {
            await QualityOverviewToolWindow.ShowAsync();
            // this command is not in use for now
            // for some reason when running the program
            // the new visual studio instance does not show the the command button
            // the new toolwindow therefore will be opened using a single command CodeQualityWindowCommand.cs
        }
    }
}
