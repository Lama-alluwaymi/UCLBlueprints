using Microsoft.VisualStudio.Imaging;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;

namespace TestPerformanceReportGenerator
{
    public class MyToolWindow : BaseToolWindow<MyToolWindow>
    {
        public override string GetTitle(int toolWindowId) => "My Tool Window";

        public override Type PaneType => typeof(Pane);

        public override Task<FrameworkElement> CreateAsync(int toolWindowId, CancellationToken cancellationToken)
        {
            return Task.FromResult<FrameworkElement>(new MyToolWindowControl());
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