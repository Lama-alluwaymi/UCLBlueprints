using System.Windows;
using System.Windows.Controls;
using TestPerformanceReportGenerator.Utilities;
using Microsoft.VisualStudio.Imaging;

namespace TestPerformanceReportGenerator
{
    public partial class QualityOverviewToolWindowControl : UserControl
    {
        public QualityOverviewToolWindowControl()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, RoutedEventArgs e)
        {
            // set info bar model
            var model = new InfoBarModel(
                new[]
                {
                    new InfoBarTextSpan("Project's Code Quality Overview Report Successfully Generated.")
                },
                KnownMonikers.CheckAdd,
                true
                );
            // Generate report async
            ThreadHelper.JoinableTaskFactory.RunAsync(async () =>
            {
                InfoBar infobar = await VS.InfoBar.CreateAsync(PackageGuids.QualityOverviewWindowString, model);
                await Task.Run(() =>
                {
                    ReportGenerator.GenerateOverview();
                });

                await infobar.TryShowInfoBarUIAsync();
            }).FireAndForget(); 
            
            //VS.MessageBox.Show("QualityOverviewToolWindowControl", "Button clicked");
        }
    }
}
