#!/bin/bash
cd /apps
rm -r jobn
git clone git@github.com:gthoma17/jobn.git
sh /apps/jobn/devops/server/runBackend.sh
sh /apps/jobn/devops/server/runWebui.sh
chmod -R 777 /apps/jobn