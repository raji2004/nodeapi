/**request handlers */

// dependencies
const file = require('./data')
const helpers = require('./helpers')

// Define all the handlers
var handlers = {};

//users
handlers.users = function(data, callback){
    let acceptableMethods = ['post','get','put','delete']
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._users[data.method](data,callback)
    }else{
        callback(405)
    }
}
//containter for the users submethod
handlers._users = {}

// users - post
// requires field firstname lastname phone password tosagreement
// optional data none
handlers._users.post = function(data,callback){
   // check that all required fields are filled out
   let firstname = typeof(data.payload.firstname) === 'string' && data.payload.firstname.trim().length > 0? data.payload.firstname.trim(): false
   let lastname = typeof(data.payload.lastname) === 'string' && data.payload.lastname.trim().length > 0? data.payload.lastname.trim(): false
   let phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 10? data.payload.phone.trim(): false
   let password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0? data.payload.password.trim(): false
   let tosagreement = typeof(data.payload.tosagreement) === 'boolean' && data.payload.tosagreement === true? true : false
   if(firstname && lastname && phone && password && tosagreement){
       // make sure that the user doesnt already exist
       file.read('users',phone,function(err,data){
        if(err){
           // hash the password
           let hashpassword = helpers.hash(password)
            if(hashpassword){
                //create the user object
                let userObject = {
                    firstname : firstname,
                    lastname : lastname,
                    phone:phone,
                    hashpassword:hashpassword,
                    tosagreement: true
                }

                // store the user
                file.create('users', phone, userObject,function(err){
                if(!err){
                    callback(200)
                }else{
                    console.log(err);
                    callback(500,{error:'could not create new users'})
                }
                })
            }else{
                callback(500,{error:"could not hash password"})
            }
          
        }else{
         callback(400,{error:'user with phone number already exist'})
        }
       })
   }else{
    callback(400,{error:"missig required fields"})
   }
}

//users - get
// require data : phone
// optional data : none
// @TODO only let an authenticated user access thier objects 
handlers._users.get = function(data,callback){
   //check that the phone number is valid
   let phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10? data.queryStringObject.phone.trim(): false
   if(phone){
      file.read('users',phone,function(err,data){
        if(!err && data){
           //remove the hashed password
           delete data.hashpassword
           callback(200,data)
        }else{
            callback(404,{error:'file not found'})
        }
      })
   }else{
    callback(400,{error:'missing rquired field'})
   }
}

//users - put
//Required data : phone
// optional field : firstname lastname password (atleast one must be specified)
// @TODO only let an authenticated user access thier objects 
handlers._users.put = function(data,callback){
 // check for the required field
 let phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 10? data.payload.phone.trim(): false

 // check for the optional field
 let firstname = typeof(data.payload.firstname) === 'string' && data.payload.firstname.trim().length > 0? data.payload.firstname.trim(): false
 let lastname = typeof(data.payload.lastname) === 'string' && data.payload.lastname.trim().length > 0? data.payload.lastname.trim(): false
 let password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0? data.payload.password.trim(): false
  if(phone){
       if(firstname || lastname || password){
         // look up user
         file.read('users',phone, function(err,userdata){
            if(!err && userdata){
                // update fields
                if(firstname){
                    userdata.firstname = firstname
                }
                if(lastname){
                    userdata.lastname = lastname
                }
                if(password){
                    userdata.hashpassword = helpers.hash(password)
                }
                //store new update
                file.update('users',phone,userdata,function(err){
                    if(!err){
                        callback(200)
                    }else{
                        console.log(err)
                        callback(500,{error:'could not update the user'})
                    }
                })
            }else{
                callback(404,{error:'file not found'})
            }
         })
       }else{
        callback(400,{error:'missing required update field'})
       }
  }else{
    callback(400,{error:'missing required field'})
  }
}

// users - delete
// required fields phone
// @TODO only let an authenticated user access thier objects 
//@TODO delete anyother associated files
handlers._users.delete = function(data,callback){
   // check the phone
   let phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10? data.queryStringObject.phone.trim(): false
   if(phone){
      file.read('users',phone,function(err,data){
        if(!err && data){
          file.delete('users',phone,function(err){
            if(!err){
                callback(200)
            }else{
                callback(500,{error: 'could not delete user'})
            }
          })
        }else{
            callback(40,{error:'could not find user'})
        }
      })
   }else{
    callback(400,{error:'missing rquired field'})
   }

}

// Sample handler
handlers.ping = function(data,callback){
    callback(200);
};

// Not found handler
handlers.notFound = function(data,callback){
  callback(404);
};



module.exports=handlers