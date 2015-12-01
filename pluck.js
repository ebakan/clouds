var fs = require('fs');

if (process.argv.length >= 4) {
  var hangouts = JSON.parse(fs.readFileSync(process.argv[2]));
  var conversationId = process.argv[3];
  var conversation = hangouts.conversation_state.filter(function(conversation) {
    return conversation.conversation_state.conversation.id.id === conversationId;
  })[0];
  if (conversation === undefined) {
    console.error("Conversation " + conversationId + " not found");
    process.exit(1);
  }
  if (process.argv[4]) {
    fs.writeFile(process.argv[4], JSON.stringify(conversation));
  } else {
    console.log(JSON.stringify(conversation));
  }
} else {
  console.log('USAGE: node pluck.js filename conversationId [outputFileName]');
}
