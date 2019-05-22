Set Shell = CreateObject("Shell.Application")
Shell.ShellExecute "openvpn", Wscript.Arguments(0), "", "runas", 1
