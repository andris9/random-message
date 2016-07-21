# random-message

Returns a random e-mail message as a stream from a folder of email messages. Useful for testing, for example if you want to test send queues etc. and you need a flow of real-looking random emails.

You can also use this module to split large mbox files from Google Takeout into separate eml files.

## Install

Install from npm

```
npm install random-message
```

Require in your script

```javascript
var randomMessage = require('random-message');
```

## Usage

**random-message** requires the following folder structure:

```
- messages-root
  - YYYY-MM
    - message1.eml
    - message2.eml
    - message3.eml
    - ...
    - messageN.eml
```

Exact format for the message file name does not matter as long as the extension is `.eml`. Messages need to reside in folders where folder name is formatted like this: `YYYY-MM`, eg. "2016-07-21". You also need to have at least one email message file in every folder.

### get

To get a random message from the message pool, use `get`:

```javascript
randomMessage.get(messagesRoot, [seed], callback)
```

Where

- **messagesRoot** is the path for messages-root folder. This folder should include subfolders named as YYYY-MM and these, in turn, should include the actual .eml files
- **seed** is an optional random seed string. For the same seed string you get the same random message
- **callback** is the callback function that returns either an error object or a stream object

**Example**

```javascript
randomMessage.get('/path/to/messages-root', function(err, eml){
    eml.pipe(process.stdout); // pipe the random file to stdout
});
```

### split

If you have a large mbox file then you can split it into separate eml files using `split`:

```javascript
randomMessage.split(mbox, messagesRoot, callback)
```

Where

- **mbox** is the path to a mbox file
- **messagesRoot** is the path for messages-root folder. `split()` will create YYYY-MM subfolders for the messages automatically
- **callback** is the callback function that returns the total amount of processed messages

**Example**

```javascript
randomMessage.split('/path/messages.mbox', '/path/messages-root', function(err, total){
    console.log('Processed %s messages', total);
});
```

## License

**MIT**
