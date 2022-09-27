/**library for storing and
 * editing data
 */

// dependencies

const fs = require('fs')
const path = require('path')
const helpers = require('./helpers')


// container for the module
let lib = {}

//base directory of the data foloder
lib.basedir = path.join(__dirname,'/../.data/')

// write data into a file
lib.create = function(dir,file,data,callback){
  //open the file for writing
  fs.open(lib.basedir+dir+'/'+file+'.json','wx',function(err,filedescriptor){
    if(!err && filedescriptor){
        let stringdata = JSON.stringify(data)
        fs.writeFile(filedescriptor,stringdata,function(err){
            if(!err){
               fs.close(filedescriptor,function(err){
                if(!err){
                    callback(false)
                }
                else{callback('err closing new file')}
               })
            }else{
                callback('err writing to new file')
            }
        })
    }else{
        callback('could not create new file, it may already exist')
    }
  })
}


// read data from a file
lib.read = function(dir,file,callback){
 fs.readFile(lib.basedir+dir+'/'+file+'.json','utf8',function(err,data){
    if(!err && data){
        let parsedata = helpers.parseJsonToObject(data)
        callback(false,parsedata)
    }else{
    callback(err,data)
    }
 })
}


// updating an existing file
lib.update = function(dir,file,data,callback){
    //open the file for writing
    fs.open(lib.basedir+dir+'/'+file+'.json','r+',function(err,filedescriptor){
        if(!err && filedescriptor){
          let stringdata = JSON.stringify(data)

          // truncate the file
          fs.ftruncate(filedescriptor,function(err){
            if(!err){
              //write to the file and close it
              fs.writeFile(filedescriptor,stringdata,function(err){
                if(!err){
                    fs.close(filedescriptor,function(err){
                        if(!err){
                            callback(false)
                        }else{
                            callback('err closing the file')
                        }
                    })
                }else{
                    callback('err writing to existing file')
                }
              })
            }else{
                callback('error truncating file')
            }
          })
        }else{
            callback('could not open the file for updating it may not exist yet')
        }
     })
}
// deleting a file
lib.delete = function(dir,file,callback){
    fs.unlink(lib.basedir+dir+'/'+file+'.json',function(err){
        if(!err){
            callback(false)
        }else{
            callback('err deleting')
        }
    })
}


module.exports = lib