using EnvDTE;
using EnvDTE80;
using Microsoft;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Collections.Generic;
using Aspose.Cells;
using System.Data;
using Style = Aspose.Cells.Style;

namespace DesignPatternDetection
{
    /// <summary>
    /// Interaction logic for MyToolWindowControl.
    /// </summary>
    public partial class MyToolWindowControl : UserControl
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="MyToolWindowControl"/> class.
        /// </summary>
        public MyToolWindowControl()
        {
            this.InitializeComponent();
        }

        private List<string> AvailablePatterns = new List<string>() { "SINGLETON","FACTORY","ABSTRACTFACTORY", "BUILDER", "PROTOTYPE", "ADAPTER",
        "COMPOSITE", "PROXY", "FLYWEIGHT", "FACADE", "BRIDGE", "DECORATOR", "TEMPLATEMETHOD", "MEDIATOR", "OBSERVER", "STRATEGY", "COMMAND", "STATE", "VISITOR", "ITERATOR",
        "INTERPRETER", "MEMENTO", "CHAINOFRESPONSIBILITY"};

        /// <summary>
        /// Handles click on the button by displaying a message box.
        /// </summary>
        /// <param name="sender">The event sender.</param>
        /// <param name="e">The event args.</param>
        [SuppressMessage("Microsoft.Globalization", "CA1300:SpecifyMessageBoxOptions", Justification = "Sample code")]
        [SuppressMessage("StyleCop.CSharp.NamingRules", "SA1300:ElementMustBeginWithUpperCaseLetter", Justification = "Default event handler naming pattern")]
        private void Generate_Click(object sender, RoutedEventArgs e)
        {
            ThreadHelper.ThrowIfNotOnUIThread();
            var dte = ServiceProvider.GlobalProvider.GetService(typeof(DTE)) as DTE2;
            Assumes.Present(dte);
            var proj = dte.Solution.Projects.OfType<EnvDTE.Project>().FirstOrDefault();
            if (proj == null)
            {
                VS.MessageBox.Show("Please open any project");
                return;
            }
            var filename = proj.FullName;
            if (filename == null)
                return;
            string directory = Directory.GetParent(filename).FullName;
            if (string.IsNullOrEmpty(pattern.Text))
            {
                VS.MessageBox.Show("Please enter the pattern to search");
                return;
            }
            if (!AvailablePatterns.Contains(pattern.Text.Trim().ToUpper()))
            {
                VS.MessageBox.Show("Please enter a valid pattern to search");
                return;
            }
            VS.MessageBox.Show($"Searching for pattern {pattern.Text} in {directory}");
            List<PatternData> patterns = new List<PatternData>();
            // check if patterns.json exist
            if (appendJson.IsChecked.HasValue && appendJson.IsChecked.Value && File.Exists($"{directory}\\patterns.json"))
            {
                var existingData = System.IO.File.ReadAllText($"{directory}\\patterns.json");
                // De-serialize to object or create new list
                var patternDataList = JsonSerializer.Deserialize<List<PatternData>>(existingData);
                if (patternDataList.Any())
                {
                    patterns.AddRange(patternDataList);
                }
            }

            var allFiles = Directory.GetFiles(directory, "*.*", SearchOption.AllDirectories).Where(filename => !(filename.ToLower().Contains("\\bin\\") ||
            filename.ToLower().Contains("\\debug\\") || filename.ToLower().Contains("\\release\\") || filename.ToLower().Contains("\\obj\\") || filename.ToLower().Contains("patterns.json")));
            // avoid all the bin and debug folder files 
            foreach (string file in allFiles)
            {
                int count = 0;
                foreach (string line in File.ReadLines(file))
                {
                    count++;
                    if (line.ToUpper().Contains($"@{pattern.Text.ToUpper().Trim()}"))
                    {
                        var currentPattern = patterns.FirstOrDefault(t => t.Pattern.Equals(pattern.Text.ToLower().Trim()));
                        if (currentPattern != null)
                        {
                            currentPattern.Entries.Add(new Entry() { FileName = file, Line = count });
                            currentPattern.totalCount++;
                        }
                        else
                        {
                            patterns.Add(new PatternData() { Pattern = pattern.Text.ToLower().Trim(), totalCount = 1, Entries = new List<Entry> { new Entry() { FileName = file, Line = count } } });
                        }
                    }
                }
            }

            if (!patterns.Any(t => t.Pattern.Equals(pattern.Text.Trim().ToLower(), StringComparison.InvariantCultureIgnoreCase)))
            {
                VS.MessageBox.Show($"No {pattern.Text.Trim().ToLower()} found in {directory}");
            }
            else
            {
                string jsonData = JsonSerializer.Serialize(patterns, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText($"{directory}\\patterns.json", jsonData);

                VS.MessageBox.Show($"Generated patterns.json in {directory}");

                var result = VS.MessageBox.Show($"Do you want to generate patterns.pdf?");
                if (result == Microsoft.VisualStudio.VSConstants.MessageBoxResult.IDOK)
                {
                    var workbook = new Workbook();
                    var worksheet = workbook.Worksheets[0];

                    var dt = new DataTable();

                    dt.Columns.Add("Pattern", typeof(string));
                    dt.Columns.Add("Total", typeof(string));
                    dt.Columns.Add("File Name", typeof(string));
                    dt.Columns.Add("Line", typeof(string));

                    dt.Rows.Add(dt.NewRow());
                    foreach (var pattern in patterns)
                    {
                        var dr = dt.NewRow();
                        dr["Pattern"] = pattern.Pattern;
                        dr["Total"] = pattern.totalCount.ToString();
                        dr["File Name"] = string.Empty;
                        dr["Line"] = string.Empty;
                        dt.Rows.Add(dr);
                        foreach (var entry in pattern.Entries)
                        {
                            dr = dt.NewRow();
                            dr["Pattern"] = string.Empty;
                            dr["Total"] = string.Empty;
                            dr["File Name"] = entry.FileName;
                            dr["Line"] = entry.Line;
                            dt.Rows.Add(dr);
                        }
                        dr = dt.NewRow(); //empty row to differentiate
                        dt.Rows.Add(dr);
                    }

                    Cells cells = worksheet.Cells;
                    cells.UnMerge(0, 1, 2, 2);
                    cells.Merge(0, 1, 2, 2);
                    worksheet.Cells[0, 1].PutValue("DESIGN PATTERN REPORT");
                    Style style = worksheet.Cells[0, 1].GetStyle();
                    Aspose.Cells.Font font = style.Font;
                    font.Size = 18;
                    font.IsBold = true;
                    style.Pattern = BackgroundType.Solid;
                    style.HorizontalAlignment = TextAlignmentType.Center;
                    cells[0, 1].SetStyle(style);

                    worksheet.Cells.ImportDataTable(dt, true, "A8");
                    worksheet.AutoFitColumn(0);
                    worksheet.AutoFitColumn(1);
                    worksheet.AutoFitColumn(2);
                    worksheet.AutoFitColumn(3);
                    worksheet.PageSetup.Orientation = PageOrientationType.Landscape;

                    Style patternStyle = worksheet.Cells[7, 0].GetStyle();
                    Aspose.Cells.Font patternFont = patternStyle.Font;
                    patternFont.IsBold = true;
                    patternStyle.Pattern = BackgroundType.Solid;
                    patternStyle.HorizontalAlignment = TextAlignmentType.Center;
                    cells[7, 0].SetStyle(patternStyle);
                    cells[7, 1].SetStyle(patternStyle);
                    cells[7, 2].SetStyle(patternStyle);
                    cells[7, 3].SetStyle(patternStyle);

                    workbook.Save($"{directory}\\patterns.pdf", Aspose.Cells.SaveFormat.Pdf);
                    VS.MessageBox.Show($"Generated patterns.pdf in {directory}");
                }
            }
        }
    }

    public class PatternData
    {
        public string Pattern { get; set; }
        public int totalCount { get; set; }
        public List<Entry> Entries { get; set; }
    }

    public class Entry
    {
        public string FileName { get; set; }
        public int Line { get; set; }
    }
}