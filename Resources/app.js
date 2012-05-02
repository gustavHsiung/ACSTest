var Cloud = require('ti.cloud');
Cloud.debug = true;  // optional; if you add this line, set it to false for production

Titanium.Facebook.appid = '203212366445168'; 
Ti.Facebook.permissions = ['publish_stream','email']; // Permissions your app needs
		
var currentUser = {
	
};

// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create tab group
var tabGroup = Titanium.UI.createTabGroup();


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
    url: 'files.js'
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
	Cloud.SocialIntegrations.externalAccountLogin({
            type: 'facebook',
            token: Ti.Facebook.accessToken
        }, function (e) {
            if (e.success) {
                currentUser = e.users[0];
                win2.currentUser = currentUser;
                alert('Logged in! You are now logged in as ' + currentUser.first_name + currentUser.last_name);	
               	label.text = 'Hi!'+ currentUser.first_name +' '+ currentUser.last_name;
	
            }
            else {
                error(e);
            }
        });
}
function showAccountUpdate()
{
	
}
