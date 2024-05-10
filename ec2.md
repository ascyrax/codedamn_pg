
<!-- sudo systemctl daemon-reload && sudo systemctl enable  backend.service && sudo systemctl start backend.service -->
<!-- sudo systemctl daemon-reload && sudo systemctl enable  frontend.service && sudo systemctl start frontend.service -->

[ec2-user@ip-172-31-12-220 frontend]$ sudo vim /etc/systemd/system/frontend.service

[Unit]
Description=My react.js Application
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/codedamn_pg/frontend
ExecStart=sudo yarn dev
Restart=always
RestartSec=5s

[Install]
WantedBy=multi-user.target

<!-- ssh -i "ascyKeyPair.pem" ec2-user@ec2-35-154-133-62.ap-south-1.compute.amazonaws.com -->

