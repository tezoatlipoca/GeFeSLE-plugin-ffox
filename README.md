# GeFeSLE-plugin-ffox
Firefox plugin for GeFeSLE - Generic Federated Subscribable List Engine
Go here for background: [https://github.com/tezoatlipoca/GeFeSLE-server]

_THIS_ is a Firefox plug that submits List Items to a List on a GeFeSLE instance. 
Its original design intent was to rapidly take screen snips and upload those along with URL and commentary to a GeFeSLE list. 

# Installing
1. download and extract the plugin (not available in any of the plugin repositories yet)
2. in Firefox, go to `about:debugging#/runtime/this-firefox`
3. click `Load Tempoary Plugin` and navigate to the folder w/ the extracted Plugin contents
4. select the `manifest.json` from the plugin folder; the plugin will load but is hidden by default in your FireFox plugins area: click the Extensions button and Pin the GeFeSLE Plugin to your plugins toolbar.

# Using
The plugin opens by clicking its widget from the plugin toolbar or the default hotkey of `CTRL+ALT+X`
The plugin opens to the default `Add and item` screen, but the first time you run the plugin (and for now, every time you load it via that `Load Temporary Plugin` method) we have to configure where it points. 

1. select **Config** link/page in the plugin.
2. in `Where is GeFeSLE?`, put the outward external URL of where you configured GeFeSLE. As you type, it feels out the URL so far for the `/lists` endpoint (which returns a list of list names).
3. Once you provide the correct endpoint, the dropdown of list names should populate ![like this](/docs/plugin1.PNG)
4. select the GeFeSLE list you want to send items to and click **Save**. **_Note_** - when you first do this, you may see no lists, or only lists that are Public; this is ok - unless you're logged into the GeFeSLE instance you'll only see list that are Public. But for now we need to store the server URL in the plugin's storage.
5. if you have successfully "connected" to your GeFeSLE server you should see a heartbeat message at the bottom of the plugin screen like `2024-07-06T16:00:04.648Z connected to https://lists.awadwatt.com - BUT NOT LOGGED IN`
7. now change to the **Login** link/page.
8. Log into your GeFeSLE server with whatever credentials you have setup. _Logging in with OAUth credentials from the plugin remains... experimental; use local credentials - either ones you've added using the Edit Users screen as a SuperUser or the backdoor admin credentials specified in GeFeSLE's config file._
9. On success, that hearbeat message should change: `024-07-06T16:03:15.694Z logged into https://lists.awadwatt.com as backadmin with role SuperUser`
10. Now, if you go back to the **Config** page you should see additional lists that your credentials give you visibility to. Change the selected List and click **save** - the server URL and your chosen list will be rememberd until you change them (or the plugin is unloaded).

From here, use the plugin's main page to add items to the selected list (which is displayed at the top of the window). 
When you invoke the plugin (via button or `CTRL+ALT+X`, 
- the current open Tab URL is pre-populated into the Item Name field
- any selected text, HTML or Markdown from the open Tab is pre-populated into the Markdown body of the item.

The **Receipt IT** button renders a screenshot of the open browser tab (minus browser chrome (tabs, url, toolbars)), uploads it to the GeFeSLE server and returns a URI to the image ON the GeFeSLE server which it injects into the Markdown body of the item. 

The **Tags** field works exactly the same as it does when creating an item in GeFeSLE's user interface. 

.. and the **Send** button uploads and clears the form. 

Rinse and repeat.
