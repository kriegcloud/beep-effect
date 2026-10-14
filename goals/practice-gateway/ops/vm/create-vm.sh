#!/usr/bin/env bash
# Build the practice-gateway clean-VM proving ground (D8): a Windows 11
# Enterprise evaluation VM in the user's libvirt session (no sudo), installed
# unattended with a throwaway local account, then snapshotted as "clean".
#
#   create-vm.sh <path-to-win11.iso>
#
# State lives outside the repo in $VM_STATE (default ~/VMs/practice-gateway):
# the disk, the rendered autounattend ISO and the random account password.
# Re-run from the snapshot with:  virsh -c qemu:///session snapshot-revert practice-gateway-win11 clean
set -euo pipefail

ISO="${1:?usage: create-vm.sh <path-to-win11.iso>}"
NAME="${VM_NAME:-practice-gateway-win11}"
STATE="${VM_STATE:-$HOME/VMs/practice-gateway}"
CONN="qemu:///session"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

[[ -f "$ISO" ]] || { echo "ISO not found: $ISO" >&2; exit 1; }
if virsh -c "$CONN" dominfo "$NAME" >/dev/null 2>&1; then
  echo "VM $NAME already exists; revert or undefine it first" >&2
  exit 1
fi

mkdir -p "$STATE/state" "$STATE/unattend"
chmod 700 "$STATE/state"

# Per-VM random password for the throwaway local account; never printed.
PASSWORD_FILE="$STATE/state/lawyer-password"
if [[ ! -s "$PASSWORD_FILE" ]]; then
  (umask 077 && LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 20 >"$PASSWORD_FILE")
fi
PASSWORD="$(cat "$PASSWORD_FILE")"

sed "s/@@PASSWORD@@/$PASSWORD/g" "$HERE/autounattend.template.xml" >"$STATE/unattend/autounattend.xml"
chmod 600 "$STATE/unattend/autounattend.xml"
xorriso -as mkisofs -quiet -V UNATTEND -J -r -o "$STATE/unattend.iso" "$STATE/unattend"
rm -f "$STATE/unattend/autounattend.xml"

# /usr/bin/python3: the mise python on PATH lacks the gi bindings virt-install needs.
/usr/bin/python3 /usr/bin/virt-install \
  --connect "$CONN" \
  --name "$NAME" \
  --osinfo win11 \
  --memory 8192 \
  --vcpus 4 \
  --cpu host-passthrough \
  --boot uefi,firmware.feature0.name=secure-boot,firmware.feature0.enabled=yes \
  --tpm backend.type=emulator,backend.version=2.0,model=tpm-crb \
  --disk "path=$STATE/disk.qcow2,size=64,bus=sata,format=qcow2" \
  --disk "path=$ISO,device=cdrom,bus=sata" \
  --disk "path=$STATE/unattend.iso,device=cdrom,bus=sata" \
  --network user,model=e1000e \
  --graphics spice \
  --video qxl \
  --noautoconsole

# UEFI shows "Press any key to boot from CD or DVD" for a few seconds.
for _ in $(seq 1 20); do
  virsh -c "$CONN" send-key "$NAME" KEY_ENTER >/dev/null 2>&1 || true
  sleep 1
done

echo "Installing unattended. Watch with: remote-viewer \$(virsh -c $CONN domdisplay $NAME)"
echo "When the desktop appears (autologon as 'lawyer'), shut down and snapshot:"
echo "  virsh -c $CONN shutdown $NAME && virsh -c $CONN snapshot-create-as $NAME clean"
