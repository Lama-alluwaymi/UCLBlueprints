using Microsoft.VisualStudio.Imaging;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;

namespace TestPerformanceReportGenerator
{
    public class CodeQualityToolWindow : BaseToolWindow<CodeQualityToolWindow>
    {
        public override string GetTitle(int toolWindowId) => "CQRG";

        public override Type PaneType => typeof(Pane);

        public override Task<FrameworkElement> CreateAsync(int toolWindowId, CancellationToken cancellationToken)
        {
            return Task.FromResult<FrameworkElement>(new CodeQualityWindowControl());
        }

        [Guid("ce2a0f92-d094-48c5-be02-b8624558136a")]
        internal class Pane : ToolWindowPane
        {
            public Pane()
            {
                BitmapImageMoniker = KnownMonikers.ToolWindow;
            }
        }
    }
}