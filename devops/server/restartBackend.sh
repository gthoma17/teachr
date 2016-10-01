#!/bin/sh
fuser -n tcp -k 9002
sh /apps/jobn/devops/server/runBackend.sh
