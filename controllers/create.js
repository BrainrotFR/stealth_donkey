const express = require('express');
const router = express.Router();
const fs = require('fs');
const { exec } = require('child_process');


//This will be used for sending files
router.post('/agent', function(req, res){
    console.log(req.body)
    var agent = `
import fileinput
import os, shutil, io
from flask import Flask, send_file, request
from flask import Response
from zipfile import ZipFile
from flask_cors import CORS
import platform
import json

# Detect Operating system that Agent is running on
operating_system = platform.system()

# Admin URL
admin_url = "https://192.168.1.81:8080"

# Initialize + Enable Cross origin resource sharing
app = Flask(__name__)
CORS(app)
    `
    if (req.body.type == "online"){
        if (req.body.getfile == "getfile"){
            agent+=`
#1. get file/zip file from server (URL example: http://127.0.0.1:5000/getfile?type=file)
@app.route("/getfile")
def getFile():
    
    # Retrieve URL params
    type = request.args.get('type')

    # Get file/zip file using curl
    if type == "file":
        os.system(f'curl --insecure {admin_url}/api/file/get_File > databack.txt')
        return Response(status=201)
    elif type == "zip":
        os.system(f'curl --insecure {admin_url}/api/file/get_Zip > compressed2.zip')
        return Response(status=201)

    # file type in params invalid
    return Response(status=400)
        
        `
            }
            
            if (req.body.cmd == "cmd"){
            agent += `
#2. Command Execution + output to file
@app.route("/command", methods = ['POST'])
def command():

    # Retreive JSON data + Assign variables
    request_data = request.get_json()
    command = request_data['cmd']
    exec_only = request_data['exec_only']
    output_destination = request_data['command_output']

    # Execute only
    if exec_only == 'Yes':
        os.system(f'{command}')
    
    # Execute + save result
    else:
        os.system(f'{command} > {output_destination}')

    return Response(status=201)
        
        `
            }
        
            if (req.body.copy == "copy"){
                agent+=`
#3. Collection of specific files + copy to specific folder
@app.route("/file_collection", methods = ['POST'])
def file_collection():

    # Retreive JSON data + Assign variables
    request_data = request.get_json()
    output_destination = request_data['output']
    collect = request_data['collect']
    files = request_data['files']

    # Splitting the file input to check length + strip blank space
    files = list(map(str.strip, files.split(',')))

    # copy files to outout destination
    if operating_system == 'Windows':
        for file in files:
            file2 = file.split('\\\\')[-1]
            os.system(f'copy {file} {output_destination}\{file2}')
    else:
        for file in files:
            file2 = file.split('/')[-1]
            os.system(f'cp {file} ./{output_destination}/{file2}')
    
    # zip files in output destination
    shutil.make_archive('collection', 'zip', f'{output_destination}')
    if collect == "Yes":
        if operating_system == "Windows":
            return send_file(f'collection.zip')
        else:
            return send_file(f'./collection.zip')
    
    return Response(status=201)
        
        `
            }
        
            if (req.body.ssh == "ssh"){
                agent += `
#4. Send files to another server via SSH
@app.route("/ssh_send", methods = ['POST'])
def ssh_send():


    # Retreive JSON data + Assign variables
    request_data = request.get_json()
    ssh_ip = request_data['ssh_ip']
    ssh_user = request_data['ssh_user']
    ssh_pass = request_data['ssh_pass']
    ssh_files = request_data['ssh_files']
    ssh_output = request_data['ssh_output']

    # Setting commands based on operating system
    if operating_system == 'Windows':
        copy = 'copy'
        delete = 'del /f'
    else:
        copy = 'cp'
        delete = 'rm'

    # Copy each specified file into the 'send_ssh' folder
    for file in ssh_files.split(','):
        file = file.strip()
        file2 = file.split('/')[-1]
        os.system(f'{copy} {file} ./send_ssh/{file2}')

    # zipping the 'send_ssh' folder to 'send_ssh.zip'
    shutil.make_archive(f'send_ssh', 'zip', 'send_ssh')

    # using SCP to send the zip file to the server
    os.system(f'sshpass -p "{ssh_pass}" scp send_ssh.zip {ssh_user}@{ssh_ip}:{ssh_output}')

    # delete the zip file after sending to the ssh_server
    os.system(f'{delete} send_ssh.zip')

    # Emptying the 'send_ssh' folder after sending to avoid cluttering
    if operating_system == 'Windows':
        os.system(f'del /S /q send_ssh')
    else:
        os.system(f'rm -r send_ssh/*')
        
    return Response(status=201)
            
        `
            }
        
            if (req.body.retrieval == "retrieval"){
                agent += `
#5. Retrieve specific file(s) from client
@app.route("/file_retrieval", methods = ['POST'])
def file_retrieval():
                                                    
    # Retreive JSON data + Assign variables
    request_data = request.get_json()
    file_location = request_data['file_location']

    # Splitting the file input to check length + strip blank space
    file_location = list(map(str.strip, file_location.split(',')))

    # copy files to 'retrieval folder'
    if len(file_location) != 1:
        if operating_system == 'Windows':
            for file in file_location:
                file2 = file.split('\\\\')[-1]
                os.system(f'copy {file} retrieval\{file2}')
        else:
            for file in file_location:
                file2 = file.split('/')[-1]
                os.system(f'cp {file} ./retrieval/{file2}')

    return Response(status=201)

#6. Retrieve file from endpoint 7
@app.route("/file_retrieval_file", methods = ['GET'])
def file_retrieval_file():
    file = request.args.get("file")
    return send_file(file)

#7. Retrieve zip from endpoint 7
@app.route("/file_retrieval_zip", methods = ['GET'])
def file_retrieval_zip():

    # zip 'retrieval' directory
    shutil.make_archive('retrieval', 'zip','./retrieval')

    # Emptying the 'retrieval' folder after sending to avoid cluttering
    if operating_system == 'Windows':
        os.system(f'del /S /q retrieval')
    else:
        os.system(f'rm -r retrieval/*') 

    return send_file("retrieval.zip")
            
        `
        }
    }

    if (req.body.type =="local"){
        if (req.body.getfile == "getfile"){
            agent+=`
#1. get file/zip file from server (URL example: http://127.0.0.1:5000/getfile?type=file)
@app.route("/getfile")
def getFile():
    
    # Retrieve URL params
    type = request.args.get('type')

    # Get file/zip file using curl
    if type == "file":
        os.system(f'curl --insecure {admin_url}/api/file/get_File > databack.txt')
        return Response(status=201)
    elif type == "zip":
        os.system(f'curl --insecure {admin_url}/api/file/get_Zip > compressed2.zip')
        return Response(status=201)

    # file type in params invalid
    return Response(status=400)
        
        `
            }
            
        if (req.body.cmd == "cmd"){
            agent += `
#2. Command Execution + output to file
@app.route("/command", methods = ['POST'])
def command():

    # Retreive JSON data + Assign variables
    f = open('./config/config.json')
    data = json.load(f)
    endpoint2 = data['endpoints']['cmd'] 
    command = endpoint2['cmd']
    output_destination = endpoint2['command_output']
    exec_only = endpoint2['exec_only']

    # Execute only
    if exec_only == 'Yes':
        os.system(f'{command}')

    # Execute + save result
    else:
        os.system(f'{command} > {output_destination}')

    return Response(status=201)

        `
            }
        
        if (req.body.copy == "copy"){
            agent+=`
#3. Collection of specific files + copy to specific folder
@app.route("/file_collection", methods = ['POST'])
def file_collection():

    # Retreive JSON data + Assign variables
    f = open('./config/config.json')
    data = json.load(f)
    endpoint3 = data['endpoints']['5']
    output_destination = endpoint3['output']
    collect = endpoint3['collect']
    files = endpoint3['files']
    f.close()

    # Splitting the file input to check length + strip blank space
    files = list(map(str.strip, files.split(',')))

    # copy files to outout destination
    if operating_system == 'Windows':
        for file in files:
            file2 = file.split('\\\\')[-1]
            os.system(f'copy {file} {output_destination}\{file2}')
    else:
        for file in files:
            file2 = file.split('/')[-1]
            os.system(f'cp {file} ./{output_destination}/{file2}')

    # zip files in output destination
    shutil.make_archive('collection', 'zip', f'{output_destination}')
    if collect == "Yes":
        if operating_system == "Windows":
            return send_file(f'collection.zip')
        else:
            return send_file(f'./collection.zip')

    return Response(status=201)
        
        `
            }
        
        if (req.body.ssh == "ssh"){
            agent += `
#4. Send files to another server via SSH
@app.route("/ssh_send", methods = ['POST'])
def ssh_send():

    # Retreive JSON data + Assign variables
    f = open('./config/config.json')
    data = json.load(f)
    endpoint4 = data['endpoints']['ssh']
    ssh_ip = endpoint4['ssh_ip'] 
    ssh_user = endpoint4['ssh_user'] 
    ssh_pass = endpoint4['ssh_pass'] 
    ssh_files = endpoint4['ssh_files'] 
    ssh_output = endpoint4['ssh_output'] 
    f.close()

    # Setting commands based on operating system
    if operating_system == 'Windows':
        copy = 'copy'
        delete = 'del /f'
    else:
        copy = 'cp'
        delete = 'rm'

    # Copy each specified file into the 'send_ssh' folder
    for file in ssh_files.split(','):
        file = file.strip()
        file2 = file.split('/')[-1]
        os.system(f'{copy} {file} ./send_ssh/{file2}')

    # zipping the 'send_ssh' folder to 'send_ssh.zip'
    shutil.make_archive(f'send_ssh', 'zip', 'send_ssh')

    # using SCP to send the zip file to the server
    os.system(f'sshpass -p "{ssh_pass}" scp send_ssh.zip {ssh_user}@{ssh_ip}:{ssh_output}')

    # delete the zip file after sending to the ssh_server
    os.system(f'{delete} send_ssh.zip')

    # Emptying the 'send_ssh' folder after sending to avoid cluttering
    if operating_system == 'Windows':
        os.system(f'del /S /q send_ssh')
    else:
        os.system(f'rm -r send_ssh/*')
        
    return Response(status=201)
        
        `
            }
        
        if (req.body.retrieval == "retrieval"){
            agent += `
#5. Retrieve specific file(s) from client
@app.route("/file_retrieval", methods = ['POST'])
def file_retrieval():
                                                    
    # Retreive JSON data + Assign variables
    request_data = request.get_json()
    file_location = request_data['file_location']

    # Splitting the file input to check length + strip blank space
    file_location = list(map(str.strip, file_location.split(',')))

    # copy files to 'retrieval folder'
    if len(file_location) != 1:
        if operating_system == 'Windows':
            for file in file_location:
                file2 = file.split('\\\\')[-1]
                os.system(f'copy {file} retrieval\{file2}')
        else:
            for file in file_location:
                file2 = file.split('/')[-1]
                os.system(f'cp {file} ./retrieval/{file2}')

    return Response(status=201)

#6. Retrieve file from endpoint 5
@app.route("/file_retrieval_file", methods = ['GET'])
def file_retrieval_file():
    file = request.args.get("file")
    return send_file(file)

#7. Retrieve zip from endpoint 5
@app.route("/file_retrieval_zip", methods = ['GET'])
def file_retrieval_zip():

    # zip 'retrieval' directory
    shutil.make_archive('retrieval', 'zip','./retrieval')

    # Emptying the 'retrieval' folder after sending to avoid cluttering
    if operating_system == 'Windows':
        os.system(f'del /S /q retrieval')
    else:
        os.system(f'rm -r retrieval/*') 

    return send_file("retrieval.zip")

        `
            }
    }
    

    agent += `
if __name__ == "__main__":
    app.run(host='0.0.0.0')
`
    console.log(agent)
    if (req.body.type == "online"){
        fs.writeFile(`./agents/online/${req.body.agent_name}`, agent, (err) => {
            if (err) {
                throw err
            }
        })
    }
    if (req.body.type == "local"){
        fs.writeFile(`./agents/local/${req.body.agent_name}`, agent, (err) => {
            if (err) {
                throw err
            }
        })
    }

    // testing only wip 
    // ipaddr = req.body.ip
    // // Storing the JSON format data in myObject
    // var data = fs.readFileSync("./configs/ip.json");
    // var myObject = JSON.parse(data);
    // console.log(myObject)
    
    // for (var i = 0; i <= myObject.length; i++) {
    //     ipnum = i;
    // }

    // // Defining new data to be added
    // let newData = {
    //     ['ip'+ipnum]:ipaddr,
    // };

    // // Adding the new data to our object
    // myObject.push(newData);
    // console.log(myObject)
    // // Writing to JSON file
    // var newData2 = JSON.stringify(myObject);
    // console.log(newData2)
    // fs.writeFile("./configs/ip.json", newData2, (err) => {
    //     // Error checking
    //     if (err) throw err;
    //     console.log("New data added");
    // });
    
})

router.post('/json', function(req, res){
    const filename = req.body.filename
    fs.writeFile(`./configs/${filename}`, JSON.stringify(req.body, null, '\t'), (err) => {
        if (err) {
            throw err
        }
    })
})


module.exports = router