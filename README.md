# stealth_donkey
Stealth Donkey is a work-in-progress Proof-of-Concept(POC) project, a framework which can be applied to gather runtime system configuration and status for a targeted system at the stealth mode.

The framework should be able to be customizable for various OS and/or type of information to be collected. 

With the framework in place, a system administrator can apply it to monitor and gather vital system information for malware and/or intrusion detection at the EndPoint level. 

References:
1.	Unisys Stealth Solution Release v4.0: https://www.commoncriteriaportal.org/files/epfiles/st_vid10989-st.pdf
2.	A Comprehensive Open Source Security Platform: https://wazuh.com/

## Definitions
Agent:
Admin Server:
Client/Client Machine:

## Prerequisites
1. Install Agent dependencies <br />
The requirements file is in the Agent Branch, remember to cd to the Agent directory!<br />
No need to install dependencies in the Admin server, they are in the node_modules folder (i think).
```
pip install -r requirements.txt
```

## Things to learn
1. Using Flask (Python version of Express node.js) <br />
Our current Agent Server is created using Flask. <br />
2. Executing OS commands in using code <br />
Since most of the commands will be 'customizable', string interpolation will be used quite often. <br />
Python:
```
os.system("<Command>")
```
Javascript:
```
exec("<Command>")
```
3. Using the Agent to monitor system information to detect malware and intrusion detection
Currently have zero knowledge on this. This component is the most important, as it serves the main purpose of this project.

## Agent Server Endpoints summary
1 and 2 are experimental endpoints used to send a file/zipfile to Admin server. <br />
3 and 4 are endpoints used to download a file/zipfile from Admin server. <br />
5 is and endpoint for command execution on the Client, with the choice to save the result in a specific location on the Client. <br />
  
## Agent Server Endpoints 
1. Hard coded endpoint that sends back file
Upon receiving get request, it sends back a downloadable file by referring to a hard coded variable.
2. Hard coded endpoint that sends back zip file
  
# To be Fixed/Tested
1. Operating system compatibility (For endpoints 5,6,7,8)
