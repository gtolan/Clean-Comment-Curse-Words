const functions = require('firebase-functions');
const capitalizeSentence = require('capitalize-sentence');
const Filter = require('bad-words');
const badWordsFilter = new Filter();

// Moderates messages by lowering all uppercase messages and removing swearwords.
exports.moderator = functions.database.ref('/messages/{messageId}').onWrite((change) => {
    const message = change.after.val();

    if (message && !message.sanitized) {
        // Retrieved the message values.
        console.log('Retrieved message content: ', message);

        // Run moderation checks on on the message and moderate if needed.
        const moderatedMessage = moderateMessage(message.text);
        console.log(moderatedMessage, "MESS")

        // Update the Firebase DB with checked message.
        console.log('Message has been moderated. Saving to DB: ', moderatedMessage);
        return change.after.ref.update({
            text: moderatedMessage,
            sanitized: true,
            moderated: message.text !== moderatedMessage,
        });
    }
    return null;
});

// Moderates the given message if appropriate.
function moderateMessage(message) {
    // Re-capitalize if the user is Shouting.
    if (isShouting(message)) {
        console.log('User is shouting. Fixing sentence case...');
        message = stopShouting(message);
    }

    // Moderate if the user uses SwearWords.
    if (containsSwearwords(message)) {
        console.log('User is swearing. moderating...');
        message = moderateSwearwords(message);
    }

    return message;
}

// Returns true if the string contains swearwords.
function containsSwearwords(message) {
    return message !== badWordsFilter.clean(message);
}

// Hide all swearwords. e.g: Crap => ****.
function moderateSwearwords(message) {
    return badWordsFilter.clean(message);
}

// Detect if the current message is shouting. i.e. there are too many Uppercase
// characters or exclamation points.
function isShouting(message) {
    return message.replace(/[^A-Z]/g, '').length > message.length / 2 || message.replace(/[^!]/g, '').length >= 3;
}

// Correctly capitalize the string as a sentence (e.g. uppercase after dots)
// and remove exclamation points.
function stopShouting(message) {
    return capitalizeSentence(message.toLowerCase()).replace(/!+/g, '.');
}