# Runs over SSH on the device: copies stdin to the receiver's named pipe.
param([Parameter(Mandatory)][string]$PipeName)
$ErrorActionPreference = 'Stop'
$client = New-Object System.IO.Pipes.NamedPipeClientStream('.', $PipeName, [System.IO.Pipes.PipeDirection]::Out)
$client.Connect(30000)
$in = [Console]::OpenStandardInput()
$in.CopyTo($client); $client.Flush(); $client.Dispose()
'sent'
