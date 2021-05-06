#/bin/bash

# re-install the RVL server once we fire this thing up - it appears to need the
# matching MAC address when the installer is run
WORKING_DIR="/root"
RVL_INSTALLER_BIN="RVLFloatLicenseSoftware-2.3-linux-x64-installer.run"
RVL_SERVER_BIN="/sbin/rvlserver"
RVL_STATUS_BIN="/sbin/rvlstatus"
STATUS_INTERVAL=10
INSTALLER_BIN_GLOB="*.run"

cd ${WORKING_DIR}

./${RVL_INSTALLER_BIN} --mode unattended --unattendedmodeui none --acceptEULA 1

sleep 2

${RVL_STATUS_BIN}
#${RVL_SERVER_BIN}

# output rvlstatus every ${STATUS_INTERVAL} secs
while [ true ]
do
	sleep ${STATUS_INTERVAL}
	${RVL_STATUS_BIN}
done
