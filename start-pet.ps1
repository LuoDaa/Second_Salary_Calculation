$Project = Split-Path -Parent $MyInvocation.MyCommand.Path
$Port = 8996
$Chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (!(Test-Path $Chrome)) {
  $Chrome = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
}

$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if (!$listener) {
  Start-Process -FilePath node -ArgumentList "server.js" -WorkingDirectory $Project -WindowStyle Hidden
  Start-Sleep -Milliseconds 900
}

$Profile = Join-Path $Project ".pet-chrome-profile"
New-Item -ItemType Directory -Force $Profile | Out-Null
$Url = "http://127.0.0.1:$Port/pet.html"
Start-Process -FilePath $Chrome -ArgumentList @(
  "--app=$Url",
  "--user-data-dir=$Profile",
  "--window-size=360,520",
  "--window-position=30,80",
  "--disable-features=Translate"
)

Add-Type @"
using System;
using System.Text;
using System.Runtime.InteropServices;
public class WinTop {
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
  [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, UInt32 uFlags);
  public static readonly IntPtr HWND_TOPMOST = new IntPtr(-1);
  public const UInt32 SWP_NOMOVE = 0x0002;
  public const UInt32 SWP_NOSIZE = 0x0001;
  public const UInt32 SWP_SHOWWINDOW = 0x0040;
}
"@

for ($i = 0; $i -lt 40; $i++) {
  $found = $false
  [WinTop]::EnumWindows({
    param($hWnd, $lParam)
    if (![WinTop]::IsWindowVisible($hWnd)) { return $true }
    $sb = New-Object System.Text.StringBuilder 256
    [void][WinTop]::GetWindowText($hWnd, $sb, $sb.Capacity)
    $title = $sb.ToString()
    if ($title -like "*打工牛桌宠*") {
      [void][WinTop]::SetWindowPos($hWnd, [WinTop]::HWND_TOPMOST, 0, 0, 0, 0, [WinTop]::SWP_NOMOVE -bor [WinTop]::SWP_NOSIZE -bor [WinTop]::SWP_SHOWWINDOW)
      $script:found = $true
    }
    return $true
  }, [IntPtr]::Zero) | Out-Null
  if ($found) { break }
  Start-Sleep -Milliseconds 250
}
