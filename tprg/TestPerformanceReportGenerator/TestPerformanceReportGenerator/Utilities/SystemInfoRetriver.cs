using System.Globalization;
using System.Management;
using System.Reflection;
using System.Diagnostics;



namespace TestPerformanceReportGenerator.Utilities
{
    public class SystemInfoRetriver
    {
        public static string GetCurrentDate()
        {
            return DateTime.Now.ToString("d", new CultureInfo("en-GB"));
        }

        public static string GetProductVersion()
        {
            Assembly assembly = Assembly.GetExecutingAssembly();
            FileVersionInfo filever = FileVersionInfo.GetVersionInfo(assembly.Location);
            return filever.ProductVersion;
        }

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
                    double ramMB = ramByte / 1048576;
                    ramSize = ramMB.ToString();
                }
            }

            hardwareInfo = "CPU: " + cpuName + "; " + "RAM Size: " + ramSize + "MB"; 
            return hardwareInfo;
        }


    }
}
