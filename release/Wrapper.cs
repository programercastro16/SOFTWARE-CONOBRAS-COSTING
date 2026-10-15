using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;

class Wrapper {
    static int Main(string[] args) {
        string realExe = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "rcedit-x64-real.exe");
        if (!File.Exists(realExe)) {
            realExe = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "rcedit-x64.exe.bak");
        }

        var newArgs = new List<string>();
        for (int i = 0; i < args.Length; i++) {
            if (args[i] == "OriginalFilename" && (i + 1 >= args.Length || string.IsNullOrEmpty(args[i + 1]) || args[i + 1].StartsWith("--"))) {
                newArgs.Add("OriginalFilename");
                newArgs.Add("Conobras Quote.exe");
                if (i + 1 < args.Length && string.IsNullOrEmpty(args[i + 1])) {
                    i++; // skip the empty argument
                }
            } else if (string.IsNullOrEmpty(args[i])) {
                newArgs.Add("\"\"");
            } else {
                newArgs.Add(args[i]);
            }
        }

        var psi = new ProcessStartInfo(realExe);
        psi.UseShellExecute = false;
        
        // Build quoted argument string for Windows CommandLine
        var escapedArgs = new List<string>();
        foreach (var a in newArgs) {
            if (a.Contains(" ") || a.Length == 0) {
                escapedArgs.Add("\"" + a.Replace("\"", "\\\"") + "\"");
            } else {
                escapedArgs.Add(a);
            }
        }
        psi.Arguments = string.Join(" ", escapedArgs.ToArray());

        try {
            using (var proc = Process.Start(psi)) {
                proc.WaitForExit();
                return proc.ExitCode;
            }
        } catch (Exception ex) {
            Console.Error.WriteLine("Wrapper error: " + ex.Message);
            return 1;
        }
    }
}
