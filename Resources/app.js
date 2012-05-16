var Cloud = require('ti.cloud');
Cloud.debug = true;  // optional; if you add this line, set it to false for production

Titanium.Facebook.appid = '203212366445168'; 
Ti.Facebook.permissions = ['publish_stream','email']; // Permissions your app needs
		
var currentUser = { status:'unlogin'};

// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create tab group
var tabGroup = Titanium.UI.createTabGroup();

if (Ti.Platform.osname === "android") {
    // window focus events don't work on android so this workaround
    // catches the tabGroup focus event and fires the event on the
    // active window object
    tabGroup.addEventListener('focus', function(e) {
        var win = tabGroup.activeTab.window;
        e.originalSource = e.source;
        e.source = win;
        win.fireEvent('focus', e);
    });
}

//
// create base UI tab and root window
//
var win1 = Titanium.UI.createWindow({  
    title:'User Account',
    backgroundColor:'#fff'
});
var tab1 = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'Account',
    window:win1
});

var label = Titanium.UI.createLabel({
	color:'#999',
	text:'I am Window 1',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	width:'auto'
});

// Not shown is the code to implement the Facebook module in your app

// call the ACS Facebook SocialIntegrations API to link logged in states
function updateLoginStatus(e) {
    if (Ti.Facebook.loggedIn) {
        
        var facebookName 	= e.data.name;
        var facebookEmail 	= e.data.email;
        
        label.text = 'Welcome '+facebookName+', now logging in to ACS as well, please wait...';
        loginACS();
    }
    else {
        label.text = 'Please login to Facebook.';
    }
}

// when the user logs into or out of Facebook, link their login state with ACS
Ti.Facebook.addEventListener('login', updateLoginStatus);
Ti.Facebook.addEventListener('logout', updateLoginStatus);

// add the Facebook login button
win1.add(Ti.Facebook.createLoginButton({
    top: 10
}));

if(Ti.Facebook.loggedIn)
{
	label.text = 'Welcome, now logging in to ACS as well, please wait...';
	loginACS();
}
win1.add(label);

//
// create controls tab and root window
//
var win2 = Titanium.UI.createWindow({  
    title:'Files',
    backgroundColor:'#fff',
    currentUser:currentUser,
    url: 'files.js',
    Cloud:Cloud
});
var tab2 = Titanium.UI.createTab({  
    icon:'KS_nav_ui.png',
    title:'Files',
     window:win2
});


//
//  add tabs
//
tabGroup.addTab(tab1);  
tabGroup.addTab(tab2);  


// open tab group
tabGroup.open();

/*
 * Account Methods
 * 
 */
function loginACS()
{
	currentUser.status = 'waiting';	
        
	Cloud.SocialIntegrations.externalAccountLogin({
            type: 'facebook',
            token: Ti.Facebook.accessToken
        }, function (e) {
            if (e.success) {
                currentUser = e.users[0];
                currentUser.session_id = e.meta.session_id;
                currentUser.status = 'logined';
                win2.currentUser = currentUser;
                alert('Logged in! You are now logged in as ' + currentUser.first_name + currentUser.last_name);	
               	label.text = 'Hi!'+ currentUser.first_name +' '+ currentUser.last_name;
               	Ti.API.info(">>>>>>>>>>>>>>>>>>>>>>Titanium.App.fireEvent 'userHasLogin'");
	
				Titanium.App.fireEvent('userHasLogin', { user:currentUser});
            }
            else {
                error(e);
            }
        });
}
function showAccountUpdate()
{
	
}


