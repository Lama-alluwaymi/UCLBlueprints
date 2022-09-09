using System.Globalization;
using System.Management;
using System.Reflection;
using System.Diagnostics;



namespace TestPerformanceReportGenerator.Utilities
{
    /// <summary>
    /// Helper class to retrieve required system information.
    /// </summary>
    public class SystemInfoRetriver
    {
        /// <summary>
        /// Gets the current time of format HH:MM:SS.
        /// </summary>
        /// <returns>Current time in string with format HH:MM:SS</returns>
        public static string GetCurrentDate()
        {
            return DateTime.Now.ToString("T", new CultureInfo("en-GB"));
        }

        /// <summary>
        /// Gets the current project version
        /// </summary>
        /// <returns>Project's current version as string</returns>
        public static string GetProductVersion()
        {
            Assembly assembly = Assembly.GetExecutingAssembly();
            FileVersionInfo filever = FileVersionInfo.GetVersionInfo(assembly.Location);
            return filever.ProductVersion;
        }
        /// <summary>
        /// Gets the CPU name and RAM size in GigaByte (GB) of the machine.
        /// </summary>
        /// <returns>string in format: "CPU: CPUName; RAM Size: ramsize GB"</returns>
        public static string GetHardwareInfo()
        {
            ManagementObjectSearcher cpuInfo = new ManagementObjectSearcher("root\\CIMV2", "SELECT * FROM Win32_Processor");
            ManagementObjectSearcher ramInfo = new ManagementObjectSearcher("SELECT * FROM Win32_ComputerSystem");
            string cpuName = null;
            string ramSize = null;
            string hardwareInfo = "";
            foreach(ManagementObject obj in cpuInfo.Get())
            {
                if (obj["name"] != null)
                {
                    cpuName = obj["name"].ToString(); 
                }
            }

            foreach (ManagementObject obj in ramInfo.Get())
            {
                if (obj["TotalPhysicalMemory"] != null)
                {
                    double ramByte = (Convert.ToDouble(obj["TotalPhysicalMemory"]));
                    double ramGB = ramByte / Math.Pow(1024, 3);
                    ramSize = ramGB.ToString("0.##");
                }
            }

            hardwareInfo = "CPU: " + cpuName + "; " + "RAM Size: " + ramSize + "GB"; 
            return hardwareInfo;
        }


    }
}
