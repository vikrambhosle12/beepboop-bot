var Botkit = require('botkit')
var pg =require('pg')
var rasa = require('./middleware-rasa.js')({rasa_uri: 'http://localhost:5000'});
const connectionString = 'postgres://postgres:postgres@localhost:5432/postgres';
const client = new pg.Client(connectionString);
client.connect();


var token = process.env.SLACK_TOKEN

var controller = Botkit.slackbot({
  // reconnect to Slack RTM when connection goes bad
  retry: Infinity,
  debug: false
})

controller.middleware.receive.use(rasa.receive);
// Assume single team mode if we have a SLACK_TOKEN
if (token) {
  console.log('Starting in single-team mode')
  controller.spawn({
    token: token
  }).startRTM(function (err, bot, payload) {
    if (err) {
      throw new Error(err)
    }

    console.log('Connected to Slack RTM')
  })
// Otherwise assume multi-team mode - setup beep boop resourcer connection
} else {
  console.log('Starting in Beep Boop multi-team mode')
  require('beepboop-botkit').start(controller, { debug: true })
}

/*controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, "I'm here!")
})

controller.hears(['hi'], ['ambient', 'direct_message','direct_mention','mention'], function (bot, message) {
  bot.reply(message, 'Hello.')
})*/
controller.hears(['device_failure'],'direct_message,direct_mention,mention', rasa.hears, function(bot, message) {
    bot.reply(message, 'same old story boring character')
    console.log('Intent:', message.intent);
    console.log('Entities:', message.entities);  
 
  bot.startConversation(message,function(err,convo) {

    convo.ask('What is the work package name ?',function(response,convo) {

      convo.say('Cool: ' + response.text);
      convo.next();

    });


  convo.ask('Please give a short description ?',function(response,convo) {

      convo.say('ok': ' + response.text);
      convo.next();

    });

  })
  
});
controller.hears(['greet'],'direct_message,direct_mention,mention', rasa.hears, function(bot, message) {
    bot.reply(message, 'hmm')
   console.log('Intent:', message.intent);
    console.log('Entities:', message.entities);  
    client.query('INSERT INTO items(text) values($1)',[message.intent.name]);
  
});
