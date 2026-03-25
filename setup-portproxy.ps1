# setup-portproxy.ps1
# WSL2 ポートフォワード設定スクリプト（管理者PowerShellで実行してください）

$PORTS = @(5173, 3001)
$RULE_PREFIX = "WSL2 Typing Battle"

# 管理者権限チェック
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "このスクリプトは管理者権限で実行してください。"
    exit 1
}

# WSL2 の IP アドレスを取得
$wsl_ip = (wsl hostname -I 2>$null).Trim().Split(" ")[0]
if (-not $wsl_ip) {
    Write-Error "WSL2 が起動していません。先に WSL2 を起動してください。"
    exit 1
}

Write-Host "WSL2 IP: $wsl_ip"

# 既存の設定を削除してから再登録
foreach ($port in $PORTS) {
    # 既存ルール削除（エラーは無視）
    netsh interface portproxy delete v4tov4 listenport=$port listenaddress=0.0.0.0 2>$null | Out-Null
    netsh advfirewall firewall delete rule name="$RULE_PREFIX $port" 2>$null | Out-Null

    # ポートフォワード追加
    netsh interface portproxy add v4tov4 `
        listenport=$port listenaddress=0.0.0.0 `
        connectport=$port connectaddress=$wsl_ip

    # ファイアウォール許可
    netsh advfirewall firewall add rule `
        name="$RULE_PREFIX $port" `
        dir=in action=allow protocol=TCP localport=$port

    Write-Host "ポート $port を転送設定しました ($wsl_ip:$port)"
}

Write-Host ""
Write-Host "=== 現在のポートフォワード設定 ==="
netsh interface portproxy show all

Write-Host ""
$host_ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch "Loopback|WSL|vEthernet" } | Select-Object -First 1).IPAddress
Write-Host "=== アクセス URL ==="
Write-Host "  フロントエンド: http://${host_ip}:5173"
Write-Host "  バックエンド:   http://${host_ip}:3001"
