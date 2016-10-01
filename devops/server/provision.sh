#!/bin/bash
#install dependancies
apt-get install nginx mysql-server-5.6 monit python-pip python-dev build-essential libmysqlclient-dev libffi-dev libssl-dev git python-dateutil
pip install Jinja2==2.7.3 MarkupSafe==0.23 Werkzeug==0.9.6 argparse==1.2.1 cffi==0.8.6 cryptography==0.7.1 enum34==1.0.4 httplib2==0.9 identity-toolkit-python-client>=0.1.6 itsdangerous==0.24 oauth2client==1.4.5 pyOpenSSL==0.14 pyasn1==0.1.7 pyasn1-modules==0.0.5 pycparser==2.10 rsa==3.1.4 simplejson==3.6.5 six==1.9.0 wsgiref==0.1.2 web.py==0.37 MySQL-python==1.2.5 boto==2.38
#setup github ssh
ssh-keygen -t rsa -b 4096 -C "gthoma17@emich.edu"
eval $(ssh-agent -s)
ssh-add ~/.ssh/id_rsa
echo "**********************Add the below to your keys in github**********************"
cat ~/.ssh/id_rsa.pub
echo "**********************Add the above to your keys in github**********************"
echo -n "Press Enter when done"
read
ssh -T git@github.com
#create the application
mkdir /apps
chmod -R 777 /apps
cd /apps
git clone git@github.com:gthoma17/jobn.git
chmod -R 777 /apps/jobn
#move configurations into place
cp /apps/jobn/devops/server/rc.local /etc/rc.local
cp /apps/jobn/devops/server/jobn-monit /etc/monit/conf.d
cp /apps/jobn/devops/server/nginx_config /etc/nginx/sites-enabled/default
#create the database
cd /apps/backend
python setup_database.py
#reboot the server
reboot now