var easymde;


// method for feedback to page viewer user
// function that takes the provides string and writes it into the 
// span with id="result"
// if no span with id="result" exists, then this function writes to the console instead
function d(result) {
    // get the span with id="result"
    let resultSpan = document.getElementById('result');
    if (resultSpan == null) {
        // if no span with id="result" exists, then write to the console
        console.log('No span with id="result" found on this page!')
        console.log(result);
        return;
    } else {
        console.log('resultSpan: ' + result);
        resultSpan.innerHTML = result;
        return;
    }

}

// create an enum
const RC = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
    ERROR: 999,
    DEFAULT: 0
};

function c(RC) {

    let resultSpan = document.getElementById('result');
    if (resultSpan == null) {
        // if no span with id="result" exists, then write to the console
        console.log('No span with id="result" found on this page!')
        console.log(result);
        return;
    } else {
        // change the color of the result span based on the RC
        switch (RC) {
            case 200:
                resultSpan.style.color = 'green';
                break;
            case 201:
                resultSpan.style.color = 'green';
                break;
            case 204:
                resultSpan.style.color = 'green';
                break;
            case 400:
                resultSpan.style.color = 'red';
                break;
            case 404:
                resultSpan.style.color = 'red';
                break;
            case 409:
                resultSpan.style.color = 'red';
                break;
            case 500:
                resultSpan.style.color = 'red';
                break;
            case 999:
                resultSpan.style.color = 'red';
                break;

            default:
                resultSpan.style.color = 'black';
                break;
        }
    }


}


function handleResponse(response) {
    console.debug('handleResponse');
    if (response.status === 204) {
        return null;
    }
    else if (!response.ok) {
        let contentType = response.headers.get("Content-Type");

        if (contentType != null && contentType.includes("application/json")) {
            // The response is JSON
            return response.json().then(errorDetails => {
                // Check if errorDetails is an object
                if (typeof errorDetails === 'object' && errorDetails !== null) {
                    let errorDetailsString = '';
                    for (let key in errorDetails) {
                        if (typeof errorDetails[key] === 'object' && errorDetails[key] !== null) {
                            for (let subKey in errorDetails[key]) {
                                errorDetailsString += ` ${errorDetails[key][subKey]}<br>\n`;
                            }
                        } else {
                            errorDetailsString += `${key}: ${errorDetails[key]}<br>\n`;
                        }
                    }
                    return Promise.reject(new Error(errorDetailsString));
                } else {
                    // errorDetails is not an object, return it as the error message
                    return Promise.reject(new Error(errorDetails));
                }
            });
        }
        else if (contentType != null && contentType.includes("text/plain")) {
            // The response is text
            return response.text().then(errorDetails => {
                throw new Error(`${response.status} - ${response.statusText} - ${response.url} - ${errorDetails}`);
            });
        }
        else {
            // The response is some other type
            throw new Error(`${response.status} - ${response.statusText} - ${response.url}`);
        }
    } else {
        return response;
    }
}


async function amloggedin(serverUrl, apiToken) {
    let fn = 'amloggedin';
    console.log(fn);

    try {
        apiUrl = serverUrl + '/amloggedin/'
        console.debug(fn + ' | API URL: ' + apiUrl);

        // Perform a GET request
        return await fetch(apiUrl, {
            headers: {
                "GeFeSLE-XMLHttpRequest": "true"
            },
            credentials: 'include'
        })
            .then(handleResponse)
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
            })
            .then(json => {
                let username = json.username;
                let role = json.role;
                console.debug(fn + ' | API Response: ' + JSON.stringify(json));
                if ((username == null) || (role == null)) {
                    console.debug(fn + ' | returning null value!');
                    return [null, null];
                }
                else {
                    console.debug(fn + ' | returning [ ' + username + ',' + role);
                    return [username, role];
                }

            });
    } catch (error) {
        console.error('Error:', error);
        d('Error: ' + error);
        c(RC.ERROR);
    }
}




// function that writes the results of the API call /heartbeat to the popup page
async function writeHeartbeatResult(serverUrl) {
    console.log('writeHeartbeatResult');


    if (serverUrl == undefined || serverUrl == null || serverUrl == '') {
        d('No server URL configured - please configure.');
        c(RC.DEFAULT);
        console.log('No server URL configured - please configure.');
        return;
    }
    try {
        apiUrl = serverUrl + '/me/';
        console.debug(' | API URL: ' + apiUrl);
        const storconfig = await loadStorconfig();
        // Perform a GET request
        await fetch(apiUrl,
            {
                headers: {
                    "GeFeSLE-XMLHttpRequest": "true",
                    'Authorization': `Bearer ${storconfig.apiToken}`
                },
                credentials: 'include'
            }
        )
            .then(handleResponse)
            .then(response => response.json())
            .then(json => {
                let username = json.userName;
                let role = json.role;
                let now = new Date();
                let msg = null;
                now = now.toISOString();
                if (username == null || role == null) {
                    msg = `${now} connected to ${serverUrl} - BUT NOT LOGGED IN`;
                }
                else {
                    msg = `${now} logged into ${serverUrl} as ${username} with role ${role}`;
                }
                console.log(msg);
                // get the heartbeat div
                let heartBeatElement = document.getElementById('heartbeat');
                heartBeatElement.textContent = msg;


            });
    } catch (error) {
        console.error('Error:', error);
        d('Error: ' + error);
        c(RC.ERROR);
    }
}




async function loadSettings(storConfig) {
    console.log('loadSettings');


    await loadLists();
    // now that the lists have been loaded, set the selected value to match the stored value
    // iterate through the option values and make the one that matches the stored value the selected one
    let listSelect = document.getElementById('listid');
    for (let i = 0; i < listSelect.options.length; i++) {
        if (listSelect.options[i].value == storConfig.listid) {
            listSelect.options[i].selected = true;
        }
    }

    console.debug(' | Settings loaded: url=' + storConfig.url + ', listid=' + storConfig.listid);

}


// function to retreive a list of listids and listnames from the REST API
async function loadLists() {
    console.log('loadLists');
    // we don't want to use the stored value of list id becuase we could be getting refrehsed from
    // the onchange event. Use the value of the url field instead
    let apiUrl = document.getElementById('url').value;
    if (apiUrl == undefined || apiUrl == null || apiUrl == '') {
        d('No server URL configured - please configure.');
        c(RC.DEFAULT);
        return;
    }
    else {
        apiUrl = apiUrl + '/lists';

    }
    // get the apiToken from local storage
    const storconfig = await loadStorconfig();


    console.debug(' | API URL: ' + apiUrl);

    await fetch(apiUrl, {
        headers: {
            "GeFeSLE-XMLHttpRequest": "true"
        },
        credentials: 'include'
    }
    )
        .then(handleResponse)
        .then(response => response.json())
        .then(data => {
            console.debug(' | API Response: ' + JSON.stringify(data));
            let listSelect = document.getElementById('listid');
            listSelect.innerHTML = '';
            for (let list of data) {
                let option = document.createElement('option');
                option.value = list.id;
                option.text = list.name;
                listSelect.appendChild(option);
            }
            d('Lists loaded');
            c(RC.OK);
        })
        .catch(error => {
            d(error);
            c(RC.ERROR);
        });

}

async function loadStorconfig() {
    const storconfig = await browser.storage.local.get(['url', 'listid', 'listname']);
    return storconfig;
}


function saveSettings(e) {
    e.preventDefault();
    console.log('saveSettings');
    let url = document.getElementById('url').value;
    let listid = document.getElementById('listid').options[document.getElementById('listid').selectedIndex].value;
    let listname = document.getElementById('listid').options[document.getElementById('listid').selectedIndex].text;
    browser.storage.local.set({ url, listid, listname });
    console.debug(' | Settings saved: url=' + url + ', listid=' + listid);
}

async function popupLoad() {
    console.log('popupLoad');
    const storConfig = await loadStorconfig();

    writeHeartbeatResult(storConfig.url);

    // When the form is submitted, send it to the REST API
    document.getElementById('addnew-form').addEventListener('submit', addThing);



    // When the popup is loaded, retrieve the saved settings and set the value of the form fields
    // the listname will also be a link TO the list on the server
    let listlink = storConfig.url + '/' + storConfig.listname + '.html';
    let displayKontent = `<a href="${listlink}" target="_blank">${storConfig.listname}</a>`
    document.getElementById('listname').innerHTML = displayKontent;


    // Get the current active tab
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        // tabs[0] is the active tab
        let activeTabUrl = tabs[0].url;
        // Populate the list.url field with the active tab URL
        document.getElementById('list.url').value = activeTabUrl;
    });

    //program onClick handler for button receiptbutton
    document.getElementById('receiptbutton').addEventListener('click', receiptSend);

    let selectedText = await getTabSelection();
    if (selectedText != null) {
        // if there are multiple lines, prepend each with markdown > quote character
        //selectedText = selectedText.replace(/^/gm, '> ');

        // selected text is HTML; convert to markdown
        let converter = new showdown.Converter();
        selectedText = converter.makeMarkdown(selectedText);

        easymde.value(selectedText);
    }

}

async function getTabSelection() {
    // Get the current active tab
    let tabs = await browser.tabs.query({ active: true, currentWindow: true });
    // tabs[0] is the active tab
    let activeTab = tabs[0];
    console.log('activeTab: ' + activeTab.id);
    console.log('activeTab: ' + activeTab.url);
    // Inject a content script into the active tab
    let results = await browser.tabs.executeScript(activeTab.id, {
        //this just gets selection as a string
        //code: 'window.getSelection().toString();'

        code: `
    
        (() => {
            let selection = window.getSelection();
            let range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
            let fragment = range ? range.cloneContents() : null;
            let selectedHtml = '';
    
            if (fragment) {
                for (let node of fragment.childNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        selectedHtml += node.outerHTML;
                    } else if (node.nodeType === Node.TEXT_NODE) {
                        selectedHtml += node.textContent;
                    }
                }
            }
    
            return selectedHtml;
        })();
    `

    });
    // results[0] is the result of the last expression evaluated in the content script
    console.log('results: ' + results);
    let selectedText = results[0];

    if (selectedText == '') {
        return null;
    }
    else {
        // Do something with the selected text...
        console.log('stuff selected on current page: ' + selectedText);
        return selectedText;
    }

}



async function configLoad() {
    console.log('configLoad');
    const storConfig = await loadStorconfig();

    writeHeartbeatResult(storConfig.url);
    if (storConfig.url != null && storConfig.url != '') {
        document.getElementById('url').value = storConfig.url;

    }


    // When the popup is loaded, retrieve the saved settings and set the value of the form fields
    loadSettings(storConfig);
    // When the form is submitted, save the settings
    document.getElementById('settings-form').addEventListener('submit', saveSettings);
    // when the url field changes re-qwury  the list of lists
    document.getElementById('url').addEventListener('input', loadLists);

}

async function loginLoad() {
    console.log('loginLoad');
    let storConfig = await loadStorconfig();

    writeHeartbeatResult(storConfig.url);
    // when the page loads, change the submit button action to call loginRedirect
    document.getElementById('loginform').addEventListener('submit', loginRedirect);
}


// when the page loads call configLoad
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded')
    // call the page initializaton function for the page we're loading
    let page = window.location.pathname.split('/').pop();
    console.log('page: ' + page);
    if (page == '_login.html') {
        loginLoad();
    }
    else if (page == 'gefesle.config.html') {
        configLoad();
    }
    else if (page == 'gefesle.popup.html') {
        popupLoad();
        // uncomment this to enable the markdown editor
        easymde = new EasyMDE({ element: document.getElementById("list.comment") });
    }
    else {
        console.error('Unknown page WE SHOULDNT GET HERE: ' + page);
    }

});


// redirect handler for the login page form target
async function loginRedirect() {
    let fn = "loginRedirect"; console.log(fn);
    // prevent the form from submitting
    event.preventDefault();
    const storconfig = await loadStorconfig();

    if (storconfig.url == null || storconfig.url == '') {
        return;
    }

    let apiUrl = storconfig.url + '/me';
    console.log('apiUrl: ' + apiUrl);
    await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            "GeFeSLE-XMLHttpRequest": "true"

        },
        body: new URLSearchParams(new FormData(document.getElementById('loginform')))
    })
        .then(handleResponse)
        .then(response => response.json())
        .then(json => {
            // on a successful login, contains json with elements {username: "username", role: "role"}  
            console.debug(`${fn} -- entire response: ${JSON.stringify(json)}`);
            console.debug(`${fn} -- username: ${json.username}`);
            console.debug(`${fn} -- role: ${json.role}`);
            console.debug(`${fn} -- token: ${json.aftoken}`);
            // store the tokens in local storage
            browser.storage.local.set({ aftoken: json.aftoken });

            let msg = `Logged in to ${apiUrl} as ${json.username} with role ${json.role}`;
            msg+=`<br>Token: ${json.aftoken}`;
            d(msg);
            c(RC.OK);
            console.log(msg);

        })
        .catch(error => {
            console.error(error);
            d(error);
            c(RC.ERROR);
        });
}



async function addThing(e) {
    e.preventDefault();
    console.log('addThing');
    let apiUrl = "";


    const storconfig = await loadStorconfig();

    apiUrl = storconfig.url + '/additem/' + storconfig.listid;
    console.debug(' | API URL: ' + apiUrl);

    let name = document.getElementById('list.url').value;
    let listid = storconfig.listid;
    //let comment = document.getElementById('list.comment').value;
    let comment = easymde.value();
    let tagsall = document.getElementById('list.tags').value;

    // convert tags into a list of strings
    let tags = tagsall.split(" ");

    // Call the REST API
    let data = { name, listid, comment, tags };
    let apiMethod = 'POST';
    console.info(' | Calling API: ' + apiUrl + ' with data: ' + JSON.stringify(data));



    await fetch(apiUrl, {
        method: apiMethod,
        headers: {
            'Content-Type': 'application/json',
            "GeFeSLE-XMLHttpRequest": "true"
        },
        credentials: 'include',
        body: JSON.stringify(data),
    })
        .then(handleResponse)
        .then(response => {
            // dump out the complete response object
            console.debug(' | API Response: ' + JSON.stringify(response));
            if (response.ok) {
                return response.text();
            }
        })

        .then(data => {
            console.log('Success:', data);
            d('Success: ' + data);
            c(RC.OK);
            setTimeout(() => {
                window.close();
            }, 5000);
        })
        .catch(error => {
            console.error('Error:', error);
            d('Error: ' + error);
            c(RC.ERROR);
        });

}

async function getCookie(name) {
    let fn = 'getCookie'; console.debug(fn);
    let cookie = await browser.cookies.get({ url: 'http://localhost:7036', name: name });
    console.debug(`${fn} -- COOKIE STRING VALUE: ${cookie.value}`)
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function receiptUpload(e) {
    let fn = 'receiptUpload'; console.debug(fn);
    // get the screenshot
    let file = await captureTabAsFile();
    console.log(`${fn} -- file name: ${file.name}`);
    let url = URL.createObjectURL(file);
    let img = document.createElement('img');
    img.src = url;
    // make the img only 100px wide
    img.style.width = '100px';
    document.getElementById('result').appendChild(img);

    const storconfig = await loadStorconfig();
    let aftoken = null;
    apiUrl = storconfig.url + '/antiforgerytoken';
    console.debug(`${fn} --> ${apiUrl}`);
    await fetch(apiUrl, {
        headers: {
            "GeFeSLE-XMLHttpRequest": "true"
        },
        credentials: 'include'
    })
        .then(handleResponse)
        .then(response => response.json())
        .then(json => {
            aftoken = json;
            console.debug(`${fn} -- aftoken: ${aftoken.requestToken}`)
            return aftoken;
        })
        .catch(error => {
            console.error('Error:', error);
            d('Error: ' + error);
            c(RC.ERROR);
        });
    

    
    console.info(`${fn} -- aftoken: >>${aftoken.requestToken}<<`);
    // Call the REST API
    let data = new FormData();
    data.append('file', file);
    apiUrl = storconfig.url + '/fileuploadxfer';
    console.debug(`${fn} --> ${apiUrl}`);
    let apiMethod = 'POST';
    await fetch(apiUrl, {
        method: apiMethod,
        headers: {
            "GeFeSLE-XMLHttpRequest": "true",
            'RequestVerificationToken': aftoken.requestToken
        },
        credentials: 'include',
        body: data
    })
        .then(handleResponse)
        .then(response => response.text())
        .then(data => {
            let returnFileName = data;
            console.log('returning file name: ' + returnFileName);
            // store returnFilename in browser storage
            // because I hate trying to debug promises and I kept getting
            // undefined when I tried to return the value from here to 
            // let filename = await receiptUpload(e);
            browser.storage.local.set({ returnFileName });
            return returnFileName;
        })
        .catch(error => {
            console.error('Error:', error);
            d('Error: ' + error);
            c(RC.ERROR);
            return null;
        });
}

async function receiptSend(e) {
    console.log('receiptsend');
    await receiptUpload(e);
    // get the stored returnFileName; total hack to get around 
    // dealing with unresolved promises see return from receiptUpload above. 
    let savefile = await browser.storage.local.get('returnFileName');
    console.log('GOT SAVED returnFileName: ' + savefile.returnFileName);
    browser.storage.local.remove('returnFileName');

    // add the filename as an HTML image link to the end of the comment field

    // this is if you're not using the markdown editor
    //let comment = document.getElementById('list.comment');

    // strip any "" marks from around the filename if they exist
    savefile.returnFileName = savefile.returnFileName.replace(/"/g, '');
    // append to the value already in comment
    let oldval = easymde.value();
    console.debug('oldval: ' + oldval);
    let newval = oldval + ' ![receipt](' + savefile.returnFileName + ')';
    easymde.value(newval);
    //comment.value = comment.value + ' ![receipt](' + savefile.returnFileName + ')';
}



async function captureTabAsFile() {
    console.log('captureTabAsFile');
    let tabs = await browser.tabs.query({ active: true, currentWindow: true });
    let screenshotUrl = await browser.tabs.captureTab(tabs[0].id, { format: 'png' });
    let screenshotData = screenshotUrl.split(',')[1];
    let screenshotBlob = base64ToBlob(screenshotData, 'image/png');
    let currentDate = new Date();
    // we want ISO 68whatever form but replace the colons to make the file name NTFS safe
    currentDate = currentDate.toISOString().replace(/:/g, '-');
    let screenshotFile = new File([screenshotBlob], `screenshot-${currentDate}.png`);
    return screenshotFile;
}

function base64ToBlob(base64, type = '') {
    console.log('base64ToBlob');
    let binary = atob(base64.replace(/\s/g, ''));
    let len = binary.length;
    let buffer = new ArrayBuffer(len);
    let view = new Uint8Array(buffer);
    for (let i = 0; i < len; i++) {
        view[i] = binary.charCodeAt(i);
    }
    return new Blob([view], { type });
}