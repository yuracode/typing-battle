# cleanup-portproxy.ps1
# WSL2 ポートフォワード削除スクリプト（管理者PowerShellで実行してください）

$PORTS = @(5173, 3001)
$RULE_PREFIX = "WSL2 Typing Battle"

# 管理者権限チェック
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "このスクリプトは管理者権限で実行してください。"
    exit 1
}

foreach ($port in $PORTS) {
    netsh interface portproxy delete v4tov4 listenport=$port listenaddress=0.0.0.0 2>$null | Out-Null
    netsh advfirewall firewall delete rule name="$RULE_PREFIX $port" 2>$null | Out-Null
    Write-Host "ポート $port の設定を削除しました"
}

Write-Host ""
Write-Host "=== 現在のポートフォワード設定 ==="
netsh interface portproxy show all
