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
        apiUrl = serverUrl + '/heartbeat/';
        console.debug(' | API URL: ' + apiUrl);

        // Perform a GET request
        fetch(apiUrl)
            .then(response => {
                if (response.ok) {
                    return response.text();
                }
                else if (response.status == RC.NOT_FOUND) {
                    throw new Error('GeFeSLE server ' + storconfig.url + ' Not Found - check your settings');
                }
                else if (response.status == RC.UNAUTHORIZED) {
                    throw new Error('Not authorized - have you logged in yet? <a href="' + storconfig.url + '/login">Login</a>');
                }
                else if (response.status == RC.FORBIDDEN) {
                    throw new Error('Forbidden - have you logged in yet? <a href="' + storconfig.url + '/login">Login</a>');
                }
                else {
                    throw new Error('Error ' + response.status + ' - ' + response.statusText);
                }

            })
            .then(data => {
                console.log('Success:', data);
                // get the heartbeat div
                let heartBeatElement = document.getElementById('heartbeat');
                heartBeatElement.textContent = data;


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
        apiUrl = apiUrl + '/showlists';

    }
    // get the apiToken from local storage
    const storconfig = await loadStorconfig();


    console.debug(' | API URL: ' + apiUrl);
    try {
        let response = await fetch(apiUrl, {
            headers: {
                "GeFeSLE-XMLHttpRequest": "true",
                'Authorization': `Bearer ${storconfig.apiToken}`
            },
            credentials: 'include'
        }
        );
        if (!response.ok) {
            d('No lists found at this URL: ' + apiUrl);
            console.error(' | Error calling API: ' + response.status + ' ' + response.statusText);

            // also remove all the options from the listid select
            let listSelect = document.getElementById('listid');
            listSelect.innerHTML = '';



            return;
        }
        let data = await response.json();
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
    } catch (error) {
        d('EXCEPTION loading lists - no lists found at this URL:' + apiUrl);
        console.error(' | EXCEPTION calling API: ' + error);
        // also remove all the options from the listid select
        let listSelect = document.getElementById('listid');
        listSelect.innerHTML = '';
    }
}

async function loadStorconfig() {
    const storconfig = await browser.storage.local.get(['url', 'listid', 'listname', 'apiToken']);
    console.debug(' | Stored list parameters loaded: url=' + storconfig.url + ', listid=' + storconfig.listid + ', listname=' + storconfig.listname);
    console.debug(' | Stored API Token: ' + storconfig.apiToken);
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
    document.getElementById('listname').textContent = storConfig.listname;


    // Get the current active tab
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        // tabs[0] is the active tab
        let activeTabUrl = tabs[0].url;
        // Populate the list.url field with the active tab URL
        document.getElementById('list.url').value = activeTabUrl;
    });

    // add event listener to the receipt form
    document.getElementById('receiptform').addEventListener('submit', receiptsend);

}

async function receiptsend(e) {
    console.log('receiptsend');

    let filename = await receiptUpload(e);
    console.log('RECEIVED filename: ' + filename);
    if (filename != null) {
        
        
        console.log('NOW calling addThing');
        // add the filename to let comment = document.getElementById('list.comment').value;
        let comment = document.getElementById('list.comment').value;
        comment = comment + ' ' + filename;
        document.getElementById('list.comment').value = comment;
        await addThing(e);
    }
    else {
        d('Error uploading receipt image');
        c(RC.ERROR);
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
        //var simplemde = new SimpleMDE({ element: document.getElementById("list.comment") });
    }
    else {
        console.error('Unknown page WE SHOULDNT GET HERE: ' + page);
    }

});


// redirect handler for the login page form target
async function loginRedirect() {
    console.log('loginRedirect');
    // prevent the form from submitting
    event.preventDefault();
    const storconfig = await loadStorconfig();

    if (storconfig.url == null || storconfig.url == '') {
        return;
    }

    let apiUrl = storconfig.url + '/login';
    console.log('apiUrl: ' + apiUrl);
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            "GeFeSLE-XMLHttpRequest": "true"
        },
        body: new URLSearchParams(new FormData(document.getElementById('loginform')))
    })
        .then(response => {
            //console.debug(' | API Response: ' + response.text());
            if (response.ok) {
                return response.json();
            }
            else {
                return response.text().then(text => { throw new Error('Error ' + response.status + ' - ' + response.statusText + ' - ' + text); });
            }
        })
        .then(json => {
            // on a successful login, contains json with elements {token: "token", username: "username", role: "role"}  
            console.debug(' | API Response: ' + JSON.stringify(json));
            console.debug(' | new token: ' + json.token);
            console.debug(' | login username: ' + json.username);
            console.debug(' | as role: ' + json.role);
            // store the token in local storage
            browser.storage.local.set({ apiToken: json.token });
            let msg = `Logged in to ${apiUrl} as ${json.username} with role ${json.role}`;
            d(msg);
            c(RC.OK);
            console.log(msg);
        })
        .catch(error => {
            console.error('Error:', error);
            d('Error: ' + error);
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
    let comment = document.getElementById('list.comment').value;
    let tagsall = document.getElementById('list.tags').value;

    // convert tags into a list of strings
    let tags = tagsall.split(" ");

    // Call the REST API
    let data = { name, listid, comment, tags };
    let apiMethod = 'POST';
    console.info(' | Calling API: ' + apiUrl + ' with data: ' + JSON.stringify(data));



    fetch(apiUrl, {
        method: apiMethod,
        headers: {
            'Content-Type': 'application/json',
            "GeFeSLE-XMLHttpRequest": "true",
            'Authorization': `Bearer ${storconfig.apiToken}`
        },
        credentials: 'include',
        body: JSON.stringify(data),
    })
        .then(response => {
            // dump out the complete response object
            console.debug(' | API Response: ' + JSON.stringify(response));
            if (response.ok) {
                return response.text();
            }
            else if (response.status == RC.NOT_FOUND) {
                throw new Error('GeFeSLE server ' + storconfig.url + ' Not Found - check your settings');
            }
            else if (response.status == RC.UNAUTHORIZED) {
                throw new Error('Not authorized - have you logged in yet? <a href="_login.html">Login</a>');
            }
            else if (response.status == RC.FORBIDDEN) {
                throw new Error('Forbidden - have you logged in yet? <a href="_login.html">Login</a>');
            }
            else {
                throw new Error('Error ' + response.status + ' - ' + response.statusText);
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

// ugh. ok we can't select a file to upload using the js. file selector because of this:
// https://bugzilla.mozilla.org/show_bug.cgi?id=1378527
// (i.e. bug in panels where something popped up from the popup panel causes it to lose focus and close)

async function receiptUpload(e) {


    // prevent the form from submitting
    e.preventDefault();
    console.log('receiptUpload called');
    // get the screenshot
    let file = await captureTabAsFile();
    console.log('file name: ' + file.name);
    let url = URL.createObjectURL(file);
    let img = document.createElement('img');
    img.src = url;
    // make the img only 100px wide
    img.style.width = '100px';
    document.getElementById('result').appendChild(img);
    // pause for a second to let the image load
    new Promise(r => setTimeout(r, 1000));
    const storconfig = await loadStorconfig();

    apiUrl = storconfig.url + '/fileuploadxfer/';
    console.debug(' | API URL: ' + apiUrl);


    // Call the REST API
    let data = new FormData();
    data.append('file', file);
    let apiMethod = 'POST';
    console.info(' | Calling API: ' + apiUrl + ' with data: ' + JSON.stringify(data));

    let token = await getAntiForgeryToken();
    console.debug(' | anti-forgery token: ' + token);
    if (token == null || token == '' || 'antiforgeToken' in token == false) {
        d('No anti-forgery token found/obtained');
        c(RC.ERROR);
        return null;
    }
    console.debug(' | jwt token: ' + storconfig.apiToken);
    console.debug(' | anti-forgery token: ' + token.antiforgeToken);

    await fetch(apiUrl, {
        method: apiMethod,
        headers: {
            "GeFeSLE-XMLHttpRequest": "true",
            'Authorization': `Bearer ${storconfig.apiToken}`,
            'RequestVerificationToken': token.antiforgeToken
        },
        credentials: 'include',
        body: data
    })
        .then(response => {
            // dump out the complete response object
            console.debug(' | API Response: ' + JSON.stringify(response));
            if (response.ok) {
                return response.text();
            }
            else if (response.status == RC.NOT_FOUND) {
                throw new Error('GeFeSLE server ' + storconfig.url + ' Not Found - check your settings');
            }
            else if (response.status == RC.UNAUTHORIZED) {
                throw new Error('Not authorized - have you logged in yet? <a href="_login.html">Login</a>');
            }
            else if (response.status == RC.FORBIDDEN) {
                throw new Error('Forbidden - have you logged in yet? <a href="_login.html">Login</a>');
            }
            else {
                throw new Error('Error ' + response.status + ' - ' + response.statusText);
            }




        })

        .then(data => {
            console.log('Success:', data);
            d('Success: ' + data);
            c(RC.OK);
            
            
            console.log('returning file name: ' + file.name);
            return file.name;
        })
        .catch(error => {
            console.error('Error:', error);
            d('Error: ' + error);
            c(RC.ERROR);
            return null;
        });


}


async function getAntiForgeryToken() {
    // get the anti-forgery token from the page
    console.log('getAntiForgeryToken');
    const storconfig = await loadStorconfig();
    let result = await browser.storage.local.get('antiforgeToken');

    if ('antiforgeToken' in result) {
        console.debug(' | returning saved antiforgerytoken: ' + JSON.stringify(result));
        return result;
    }
    else {
        console.debug(' | no saved antiforgerytoken found - getting one');
        let apiUrl = storconfig.url + '/antiforgerytoken';
        fetch(apiUrl, {
            method: 'GET',
            headers: {
                "GeFeSLE-XMLHttpRequest": "true",
                'Authorization': `Bearer ${storconfig.apiToken}`
            },
            credentials: 'include' // Include cookies in the request
        })
            .then(response => {
                // dump out the complete response object
                console.debug(' | API Response: ' + response.status);
                if (response.ok) {
                    return response.json();
                }
                else if (response.status == RC.NOT_FOUND) {
                    throw new Error('GeFeSLE server ' + storconfig.url + ' Not Found - check your settings');
                }
                else if (response.status == RC.UNAUTHORIZED) {
                    throw new Error('Not authorized - have you logged in yet? <a href="_login.html">Login</a>');
                }
                else if (response.status == RC.FORBIDDEN) {
                    throw new Error('Forbidden - have you logged in yet? <a href="_login.html">Login</a>');
                }
                else {
                    throw new Error('Error ' + response.status + ' - ' + response.statusText);
                }




            })
            .then(json => {
                // Store the token in local storage
                let requestToken = json.requestToken;
                browser.storage.local.set({ antiforgeToken: requestToken });
                console.debug(' | (success!) API Response {requestToken}: ' + requestToken);
                return { antiforgeToken: requestToken };
            })
            .catch(error => {
                console.error('Error:', error);
                d('Error: ' + error);
                c(RC.ERROR);
                return null;
            })



    }
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