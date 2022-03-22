# stealth_donkey
Stealth Donkey is a work-in-progress Proof-of-Concept (POC) project, a framework that can be applied to gather runtime system configuration and status for a targeted system at the stealth mode.

The framework is customisable for various operating systems and/or types of information to be collected.

With the framework in place, a system administrator can monitor and gather vital system information for malware and/or intrusion detection at the EndPoint level.

References:
1.	Unisys Stealth Solution Release v4.0: https://www.commoncriteriaportal.org/files/epfiles/st_vid10989-st.pdf
2.	A Comprehensive Open Source Security Platform: https://wazuh.com/

## Definitions
`Agent`: Script running on Client Machine <br />
`Client`/`Client Machine`: Machine which the Agent is monitoring <br />
`Admin Server`: Administrative server that communicates with Agent, has a web interface


## Technical Prerequisites

### 1. Install Agent dependencies <br />
The requirements file is in the Agent Branch, remember to `cd` to the `Agent` directory!
```
pip install -r requirements.txt
```
No need to install dependencies in the `Admin Server`, they are in the node_modules folder (i think).

### 2. Setting up Client Machine

#### i. Installing sshpass 
`sshpass` is used to include password in `scp` request, to prevent prompt for password.
```
# For safe measure, update + upgrade
yum update
yum upgrade

# Need epel-release to install sshpass
yum install epel-release
yum install sshpass 
```

#### ii. Adding Agent as systemd service
This ensures that `Agent` is able to run in background, upon startup. Change the `<names>` and `<filepaths>` to what is appropriate for you. <br /> <br />
Create `.service` file:
```
cd /etc/systemd/system
touch <service_name>.service
```
Open the `.service` file in a file editor and enter this:
```
[Unit]
Description=Stealth agent that monitor ur fat ass
After=network.target

[Install]
WantedBy=multi-user.target

[Service]
Type=simple
ExecStart=python3 <Full_file_path_Directory_Only>/server.py
WorkingDirectory= <Full_file_path_Directory_Only>
Restart=always
RestartSec=5
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=%n
```
Reload the system daemon + start the service:
```
sudo systemctl daemon-reload
sudo systemctl enable <service_name>.service
sudo systemctl start <service_name>.service
```
`After=network.target` in service file ensures that service starts only when there is internet connection, may need to change this when configuring 'static Agents' later on. <br />
`systemctl enable` ensures that service always starts upon bootup.

### 3. Setting up SSH server
SSH server for storage of files that Admin wants to save, for endpoint 7. The SSH server will be set-up on a Kali Linux machine.
<br />
<br />
Install SSH server + Start ssh service:
```
sudo apt-get install openssh-server
sudo systemctl enable ssh
sudo systemctl start ssh
```
Ensure SSH server is running, `netstat -tupln`:
```
(Not all processes could be identified, non-owned process info
 will not be shown, you would have to be root to see it all.)
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
tcp        0      0 0.0.0.0:8834            0.0.0.0:*               LISTEN      -                   
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      -                   
tcp6       0      0 :::8834                 :::*                    LISTEN      -                   
tcp6       0      0 :::22                   :::*                    LISTEN      -      
```
SSH runs on port `22`, so just check ah brother.

## Good-to-Know 
### 1. The Folders required in Agent Branch are not there
Folders to create in `/Agent` Directory before testing: `/databack`, `/retrieval`, `/send_ssh`
### 2. Both the Agent and Admin are 'servers' and 'clients'
As they exchange information with each other, they both require endpoints. Difference is that `Admin Server` has Web interface.
### 3. Ur mum is gae
Yup.

## Things to learn before starting
 
### 1. Using Flask (Python version of Express node.js)
Our current Agent Server is created using Flask.
  
### 2. Executing OS commands using code
Most of the functionalities are made possible by using OS commands <br /> <br />
Python:
```
os.system("<Command>")
```
Javascript:
```
exec("<Command>")
```
  
### 3. Using the Agent to monitor system information to detect malware and intrusion detection
Currently have zero knowledge on this. This component is the most important, as it serves the main purpose of this project.

## Agent Server Endpoints summary
1 and 2 are experimental endpoints used to send a file/zipfile to `Admin server`. <br />
3 and 4 are endpoints used to download a file/zipfile from `Admin server`. <br />
5 is and endpoint for command execution on the `Client`, with the choice to save the result in a specific location on the `Client`. <br />

  
## Agent Server Endpoints 
 
### 1. Hard coded endpoint that sends back file
Upon receiving get request, it sends back a downloadable file by referring to a hard coded variable.
 
### 2. Hard coded endpoint that sends back zip file
Upon receiving get request, it zips a folder and sends back a downloadable zip file by referring to hard coded variables.
  
## To be Fixed/Tested/Solved

### 1. Operating system compatibility (Applicable for Agent endpoints 5,6,7,8)
There is a problem regarding how to traverse directories in Windows. For example, entering location to output a file in linux may look something like this: "./animal/money.txt". In windows, some commands require the input to look like this "animal\money.txt". From my experience, this is very inconsistent across different commands. <br />
In summary, just fix this problem by testing and tweaking the code.

### 2. How to automate answering of OS command replies (Applicable to Agent Endpoints)
Right now, I can only execute OS commands, but I am unable to answer anything AFTER the command is executed. For Example, I am unable to execute commands like SSH logins, where I need to enter a password after I enter the SSH commands.<br />
I have managed to use workarounds for these problems like SSHPASS and adding --insecure to curl commands. But some workarounds may require the Client machine to install certain services, which is not practical from the client perspective as our agent is supposed to be 'Stealthy'

### 3. How to download files directly to folder (Applicable to Admin Endpoints in home.html)
Right now, files that are received by the Admin from the Agent is downloadable files, but this requires user action to choose where the folder is downloaded. Automating this is more practical from Admin perspective.



