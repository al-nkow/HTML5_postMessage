function app(host, frame, recipient) {
    this.host = host;
    this.frame = frame;
    this.button = frame.document.querySelector('.chatButton');
    this.field = frame.document.querySelector('.chatTextField');
    this.recipient = recipient; // another frame
    this.content = frame.document.querySelector('.js-content');
    this.name = '';
    this.recipientName = '';
    this.storageAvailable = false;
};

// get message from other frame
app.prototype.getMessageEvent = function (evt) {
    var data = JSON.parse(evt.data);
    var self = this;

    if (evt.origin !== this.host) {
        alert('You are not authorized!');
        return false
    }

    if (data.text) {
        var message = this.renderMsg(data.text, data.name, data.date, false);
        this.content.innerHTML += message;
        this.content.scrollTop = this.content.scrollHeight;
    } else if (data.recipientName) {
        this.recipientName = data.recipientName; // get a user name from another frame
    }
};

// get current date function
app.prototype.getCurrentDate = function () {
    var formatUnit = function (val) {
        return val = val > 9 ? val : '0' + val;
    }

    var date = new Date();
    var year = date.getFullYear();
    var month = formatUnit(date.getMonth() + 1);
    var day = formatUnit(date.getDate());
    var hours = formatUnit(date.getHours());
    var minutes = formatUnit(date.getMinutes());
    return day + '.' + month + '.' + year + ' ' + hours + ':' + minutes;
};

// return message element
app.prototype.renderMsg = function (msgtext, name, date, author) {
    var initName = name || 'Anonymous';
    var msgClass = author ? '' : 'message_received';

    if (this.name) msgtext = this.highLighter(this.name, msgtext);
    if (this.recipientName) msgtext = this.highLighter(this.recipientName, msgtext);

    msgtext = this.drawSmiles(msgtext);

    var message = '<div class="message ' + msgClass + '"><div class="message__time">' +
        '<svg class="message__time__icon" version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" ' +
        'viewBox="0 0 97.16 97.16" xml:space="preserve"><g><g><path d="M48.58,0C21.793,0,0,21.793,0,48.58s21.793,48.58,48.58,' +
        '48.58s48.58-21.793,48.58-48.58S75.367,0,48.58,0z M48.58,86.823c-21.087,' +
        '0-38.244-17.155-38.244-38.243S27.493,10.337,48.58,10.337S86.824,27.492,86.824,48.58S69.667,86.823,48.58,86.823z"/>' +
        '<path d="M73.898,47.08H52.066V20.83c0-2.209-1.791-4-4-4c-2.209,0-4,1.791-4,4v30.25c0,2.209,1.791,4,4,4h25.832' +
        'c2.209,0,4-1.791,4-4S76.107,47.08,73.898,47.08z"/></g></g></svg><span>' + date +
        '</span></div><div class="message__content"><div class="message__content__name">' + initName + '</div>' +
        '<div class="message__content__text">' + msgtext + '</div></div></div>'
    return message;
};

// insert smile img
app.prototype.drawSmiles = function(message) {
    message = message.replace(/&#128513;/g, '<span class="smile smile_one"></span>');
    message = message.replace(/&#128515;/g, '<span class="smile smile_two"></span>');
    message = message.replace(/&#128512;/g, '<span class="smile smile_free"></span>');
    message = message.replace(/&#128517;/g, '<span class="smile smile_four"></span>');
    return message;
}

// highlights substring
app.prototype.highLighter = function (substr, message) {
    if (!substr) return message;

    var tmp = new RegExp(substr, 'gi');
    var newSubstr = '<span class="highlight">' + substr + '</span>';
    return message.replace(tmp, newSubstr);
}

app.prototype.sendMessage = function(data) {
    var dataToSend = JSON.stringify(data);
    this.recipient.postMessage(dataToSend, this.host);

    if (this.storageAvailable) {
        var key = new Date();
        sessionStorage.setItem(key, dataToSend); //saves to the database, key/value
    }

    var message = this.renderMsg(data.text, data.name, data.date, true);

    this.content.innerHTML += message;
    this.content.scrollTop = this.content.scrollHeight;

    this.field.value = '';
    this.field.select();
};

app.prototype.initEvents = function () {
    var self = this;

    // send message
    this.button.onclick = function () {
        var data = {
            text: self.field.value,
            name: self.name,
            date: self.getCurrentDate()
        };
        if (data.text) {
            self.sendMessage(data);
        }
    };

    // watch name
    var input = this.frame.document.querySelector('.js-name');
    input.oninput = function () {
        self.name = input.value;

        // send name to another frame
        var dataToSend = JSON.stringify({recipientName: self.name});
        self.recipient.postMessage(dataToSend, self.host);

    };

    // get message
    if (self.frame.addEventListener) {
        self.frame.addEventListener("message", self.getMessageEvent.bind(self), false);
    }
    else {
        self.frame.attachEvent("onmessage", self.getMessageEvent.bind(self));
    }
};

app.prototype.init = function () {
    this.field.select();
    this.initEvents();

    var supports_html5_storage = function() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    }

    this.storageAvailable = supports_html5_storage();

    if (this.storageAvailable) sessionStorage.clear();
};

window.onload = function () {

    var host = window.location.origin;
    var chatOne = document.getElementById('chatOne').contentWindow;
    var chatTwo = document.getElementById('chatTwo').contentWindow;
    var chatOneApp = new app(host, chatOne, chatTwo);
    var chatTwoApp = new app(host, chatTwo, chatOne);

    chatOneApp.init();
    chatTwoApp.init();
};
