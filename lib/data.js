/*
*
* Library for storing and editing data
*
*/

const fs = require('fs')
const path = require('path')
const helpers = require('./helpers')

const lib = {}


lib.baseDir = path.join(__dirname, '/../.data/')

const returnPath = (dir, file) => {
    return lib.baseDir + dir + '/' + file + '.json'
}

// write data to a file
lib.create = (dir, file, data, callback) => {
    fs.open(returnPath(dir, file), 'wx', (err, fileDescription) => {
        if(!err && fileDescription) {
            const stringData = JSON.stringify(data)
            fs.writeFile(fileDescription, stringData, err => {
                if(!err) {
                    fs.close(fileDescription, err => {
                        if(!err) {
                            callback(false)
                        }else {
                            callback('error closing new file')
                        }
                    })
                }else {
                    callback('Error writing the file')
                }
            })
        }else {
            callback('Could not create new file, it may already exist')
        }
    })

}

lib.read = (dir, file, callback) => {
    fs.readFile(returnPath(dir, file), 'utf8', (error, data) => {
        if(!error && data) {
            var parsedData = helpers.parseJsonToObject(data)
            callback(false, parsedData);
        }else {
            callback(error, data);
        } 
    })
}

lib.update = (dir, file, data, callback) => {
    fs.open(returnPath(dir, file),'r+', (error, fileDescriptor) => {
        if(!error && fileDescriptor) {
            var stringData = JSON.stringify(data)
            fs.ftruncate(fileDescriptor, (error) => {
                if(!error) {
                    fs.write(fileDescriptor, stringData, (error) => {
                        if(!error) {
                            fs.close(fileDescriptor, (error) => {
                                if(!error) {
                                    callback(false)
                                }else callback('error closing the file')
                            })
                        }else callback('error writing the file')
                    })
                }else callback('error truncating the file'); 
            })
        }else callback('could not open the file for update, it may not exist')
    })
}

lib.delete = (dir, file, callback) => {
    fs.unlink(returnPath(dir, file), (error) => {
        if(!error) {
            callback(false)
        }else {
            callback('error deleting file')
        }
    })
}




module.exports = lib