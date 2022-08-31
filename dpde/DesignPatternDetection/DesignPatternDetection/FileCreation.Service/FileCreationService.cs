using Aspose.Cells;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace FileCreation.Service
{
    public class FileCreationService
    {
        public bool WriteJsonData(List<PatternData> patterns, string directory)
        {
            try
            {
                if (!patterns.Any())
                {
                    return false;
                }
                if (!Directory.Exists(directory))
                {
                    return false;
                }
                string jsonData = JsonSerializer.Serialize(patterns, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText($"{directory}\\patterns.json", jsonData);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public bool WritePdfData(List<PatternData> patterns, string directory)
        {
            try
            {
                if (!patterns.Any())
                {
                    return false;
                }
                if (!Directory.Exists(directory))
                {
                    return false;
                }

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
                return true;
            }
            catch (Exception)
            {
                return false;
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
