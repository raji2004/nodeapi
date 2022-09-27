// helpers for various task

// dependencies
let crypto = require('crypto')
let config = require('./config')

// contsiner for all the helpers
let helpers = {}



// create a sha256 hash
helpers.hash = function(str){
    if(typeof(str) === 'string' && str.length > 0){
        let hash = crypto.createHmac('sha256',config.hashingsecret).update(str).digest('hex')
        return hash;
    }else{
        return false
    }
}

// parse a Json string to an object in all cases without throwing
helpers.parseJsonToObject = function(str){
    try{
        let obj = JSON.parse(str);
        return obj
    }catch(e){
        return {}
    }
}







//export helpers
module.exports = helpers