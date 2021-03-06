const request = require('request-promise')
const debug = require('debug')('botkit:rasa')

module.exports = config => {
  if (!config) {
    config = {}
  }

  if (!config.rasa_uri) {
    config.rasa_uri = 'http://localhost:5000'
  }

  var middleware = {
    receive: (bot, message, next) => {
      console.log(message);
      if (!message.text || message.is_echo || message.bot_id) {
       
        return
      }
      if (message.type !='message') {
        
        return
      }
      /*
     
         let postData = {
        'q': message.text.toLowerCase(),
      };
  

      let requestOptions = {
        url: config.rasa_uri + '/parse',
        body: postData,
        json: true
        
            body: {
          'q': message.text
        },
};
*/
        console.log(message.text);
      
      /*function addQuotes(value){
    var quotedVar = "\'" + value + "\'";
    return quotedVar;
}
   var qvalue= addQuotes(message.text)
   console.log(qvalue);
   */
      let postData = {q:message.text};
  
    console.log(postData);
      
      debug('Sending message to Rasa', message.text)
      const options = {
        method: 'POST',
        url:`${config.rasa_uri}/parse`,
        body: postData,
        json:true
              };

      request(options)
        .then(response => {
          debug('Rasa response', response)
          message.intent = response.intent
          message.entities = response.entities
         console.log(message)
          // @TODO: add other info like confidence?
          next()
        })
    },

    hears: (patterns, message) => {
      return patterns.some(pattern => {
        if (message.intent.name === pattern) {
          debug('Rasa intent matched hear pattern', message.intent, pattern)
          return true
        }
      })
    }

  }
  return middleware
}
