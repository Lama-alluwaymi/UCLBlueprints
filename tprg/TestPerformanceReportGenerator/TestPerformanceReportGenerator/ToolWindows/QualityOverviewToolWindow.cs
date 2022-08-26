using Microsoft.VisualStudio.Imaging;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;

namespace TestPerformanceReportGenerator
{
    public class QualityOverviewToolWindow : BaseToolWindow<QualityOverviewToolWindow>
    {
        public override string GetTitle(int toolWindowId) => "CQRG_overview";

        public override Type PaneType => typeof(Pane);

        public override Task<FrameworkElement> CreateAsync(int toolWindowId, CancellationToken cancellationToken)
        {
            return Task.FromResult<FrameworkElement>(new QualityOverviewToolWindowControl());
        }

        [Guid(PackageGuids.QualityOverviewWindowString)]
        internal class Pane : ToolWindowPane
        {
            public Pane()
            {
                BitmapImageMoniker = KnownMonikers.ToolWindow;
            }
        }
    }
}
