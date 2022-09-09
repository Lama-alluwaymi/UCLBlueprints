using Microsoft.VisualStudio.Imaging;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;

namespace TestPerformanceReportGenerator
{
    public class DataOverviewToolWindow : BaseToolWindow<DataOverviewToolWindow>
    {
        public override string GetTitle(int toolWindowId) => "CodeQualityReportGen_Overview";

        public override Type PaneType => typeof(Pane);

        public override Task<FrameworkElement> CreateAsync(int toolWindowId, CancellationToken cancellationToken)
        {
            return Task.FromResult<FrameworkElement>(new DataOverviewToolWindowControl());
        }

        [Guid(PackageGuids.DataOverviewToolWindowString)]
        internal class Pane : ToolkitToolWindowPane
        {
            public Pane()
            {
                BitmapImageMoniker = KnownMonikers.ToolWindow;
            }
        }
    }
}
