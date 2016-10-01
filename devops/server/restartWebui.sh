#!/bin/sh
fuser -n tcp -k 8080
/apps/jobn/devops/server/runWebui.sh
