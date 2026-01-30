# PowerShell Script to generate project_summary.txt
# Run with: .\scripts\generate_summary.ps1

$ErrorActionPreference = "Stop"
$rootPath = Resolve-Path "$PSScriptRoot\.."
$outFile = Join-Path $rootPath "project_summary.txt"

# Configuration
$excludeDirs = @("node_modules", ".git", "dist", "build", ".next", "out", "coverage", ".turbo", ".cache", ".idea", ".vscode", ".vercel")
$includeExts = @(".js", ".jsx", ".ts", ".tsx", ".json", ".md", ".css", ".scss", ".html", ".env.example", ".yml", ".yaml", ".prisma", ".sql")
$maxSizeBytes = 300 * 1024
$maxLines = 200

# Initialize file
"" | Out-File -FilePath $outFile -Encoding utf8

function Should-Include ($item) {
    if ($item.PSIsContainer) {
        return ($excludeDirs -notcontains $item.Name)
    } else {
        return ($includeExts -contains $item.Extension)
    }
}

function Get-Tree ($path, $indent, $isLast) {
    $items = Get-ChildItem -Path $path | Where-Object { Should-Include $_ } | Sort-Object Name
    $count = $items.Count
    $i = 0
    
    foreach ($item in $items) {
        $i++
        $lastItem = ($i -eq $count)
        $marker = if ($lastItem) { "└── " } else { "├── " }
        
        Add-Content -Path $outFile -Value "$indent$marker$($item.Name)"
        
        if ($item.PSIsContainer) {
            $nextIndent = if ($lastItem) { "$indent    " } else { "$indent│   " }
            Get-Tree $item.FullName $nextIndent $false
        }
    }
}

Write-Host "Generating Project Tree..."
Add-Content -Path $outFile -Value "PROJECT STRUCTURE:"
Add-Content -Path $outFile -Value "=================="
Add-Content -Path $outFile -Value "."
Get-Tree $rootPath "" $true

Write-Host "Reading File Contents..."
Add-Content -Path $outFile -Value "`n`nFILE CONTENTS:"
Add-Content -Path $outFile -Value "=============="

function Process-Files ($path) {
    $items = Get-ChildItem -Path $path | Sort-Object Name
    
    foreach ($item in $items) {
        if ($item.PSIsContainer) {
            if ($excludeDirs -notcontains $item.Name) {
                Process-Files $item.FullName
            }
        } elseif ($includeExts -contains $item.Extension) {
            $relPath = $item.FullName.Substring($rootPath.Path.Length + 1)
            Add-Content -Path $outFile -Value "`n`n--------------------------------------------------------------------------------"
            Add-Content -Path $outFile -Value "FILE: $relPath"
            Add-Content -Path $outFile -Value "--------------------------------------------------------------------------------"
            
            if ($item.Length -gt $maxSizeBytes) {
                $content = Get-Content -Path $item.FullName -TotalCount $maxLines
                Add-Content -Path $outFile -Value $content
                Add-Content -Path $outFile -Value "`n... [File truncated: Size > 300KB, showing first $maxLines lines] ..."
            } else {
                $content = Get-Content -Path $item.FullName
                Add-Content -Path $outFile -Value $content
            }
        }
    }
}

Process-Files $rootPath

Write-Host "Done! Summary saved to: $outFile"
