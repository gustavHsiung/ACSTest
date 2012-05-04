Ti.include('lib/oauth.js');
Ti.include('lib/sha1.js');



var win = Titanium.UI.currentWindow;

var currentUser = win.currentUser;
var cocoafish = require('lib/cocoafish_module');

var Cloud = require('ti.cloud');
Cloud.debug = true; 

var appkey = '';
var OAuthSecret = '';
var consumerKey = '';
if(Cloud.debug == true){
	appkey = '4BwETUU5O8lUo0es7xlvYaKTJa6hmX4l';
	OAuthSecret = 'UOaevJco8KAAAZFfg83z5Qv8UHfnHsIp';
	consumerKey = '9SZA3i2EhaO3wAVqID8yDL6gLZdwMLs6';
}else{
	appkey = 't1HQXR8047dBuzkfMD8lVK646O5fT4bS';
	OAuthSecret = 'UOaevJco8KAAAZFfg83z5Qv8UHfnHsIp';
	consumerKey = '9SZA3i2EhaO3wAVqID8yDL6gLZdwMLs6';
} 

var client = new cocoafish.Client(appkey);
 
win.backgroundColor = '#399';
var add = Titanium.UI.createButton({
	title:'Add'
});

add.addEventListener('click', addNewFiles);
if(Ti.Platform.name != 'android'){
	win.setRightNavButton(add);
}
var label = Titanium.UI.createLabel({
	color:'#fff',
	text:currentUser.last_name,
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	width:'auto'
});

win.add(label);


win.addEventListener('focus', loadFiles);

/*
 * File Methods
 * 
 */

function login()
{
	
	// login to the app
	client.login({
		'login' : "sharry@molinto.com",
		'password' : "password"
	}, function(e) {
	
	if(e.success === true) {
		Ti.API.info("logged in ok: " + JSON.stringify(e));
	} else {
		Ti.API.error(e.error);
	}
});
}
function loadFiles(pageNumber)
{
	if(!currentUser)
	{
		label.text = 'Please go back to Account tab and login first!';
		return;
	}
	
	label.text = 'Loading files...';
	
	var xhr = Titanium.Network.createHTTPClient({
 		enableKeepAlive:false
	});

	var data = {
  		where: '{"name":"Appcelerator Cloud Services"}',
  		page:pageNumber
	};
	xhr.open('GET','https://api.cloud.appcelerator.com/v1/files/query.json?key='+appkey,true,data);
		
	xhr.onload = function(response) {
			//the image upload method has finished 
		if(this.responseText != '0')
		{
			Ti.API.info(">>>>>>>>>>>>>>>>>>>>>> responseText:" +this.responseText);
			var data = JSON.parse(this.responseText);
			didLoadFiles(data);
		}else{
			Ti.API.info(">>>>>>>>>>>>>>>>>>>>>> files/query response error");
		}
	};
	
	xhr.onerror = function(e)
	{
     	Ti.API.info(e);
	};
		
	xhr.send();

}
function didLoadFiles(data) {
  if(data) {
    if(data.meta) {
      var meta = data.meta;

      if(meta.status == 'ok' && meta.code == 200 && meta.method_name == 'queryFiles') {
        var files = data.response.files;
        label.text = 'You have '+files.length +' files.';
      }
    }
  }
}

function addNewFiles(e){
	Titanium.Media.openPhotoGallery({
    	success:function(event) {
        /* success callback fired after media retrieved from gallery */
        /* Create a progress bar */
       		var selectedImage = event.media;
	        
			var ind=Titanium.UI.createProgressBar({
	  		  width:200,
	  		  height:50,
	  		  min:0,
	  		  max:1,
	  		  value:0,
	  		  style:Titanium.UI.iPhone.ProgressBarStyle.PLAIN,
	   		  top:10,
	  		  message:'Uploading...',
	 	      font:{fontSize:12, fontWeight:'bold'},
	  	      color:'#888'
			});
 
			win.add(ind);
			ind.show();
 			
 			var accessor = { consumerSecret: OAuthSecret };
 			var now = new Date();
			var params = [
				['name',now.toLocaleDateString + '_img'],  /* event.media holds blob from gallery */
	            ['file',selectedImage]
	        ];
 			var message = set_message('http://api.cloud.appcelerator.com/v1/files/create.json', 'POST', params);
 			OAuth.setTimestampAndNonce(message);
			OAuth.SignatureMethod.sign(message, accessor);
			var finalUrl = OAuth.addToURL(message.action, message.parameters);

			var xhr = Titanium.Network.createHTTPClient();
 
	    	// onsendstream called repeatedly, use the progress property to
       		// update the progress bar
			xhr.onsendstream = function(e) {
	    		ind.value = e.progress ;
	    		Ti.API.info('ONSENDSTREAM - PROGRESS: ' + e.progress);
			};
	        xhr.onload = function(e) {
	        	Ti.API.info(">>>>>>>>>>>>>>>>>>>>>> responseText:" +this.responseText);
				ind.hide();
	            Ti.UI.createAlertDialog({
	                  title:'Success',
	                  message:'status code ' + this.status
	            }).show();
	            
	        };
	        xhr.onerror = function(e)
			{
		     	Ti.API.info(e);
			};
			
	        xhr.open('POST',finalUrl);
	        xhr.setRequestHeader("Cookie", "_session_id="+currentUser.session_id);
	        Ti.API.info(">>>>>>>>>>>>>>>>>>>>>> _session_id:" +currentUser.session_id);
				
			xhr.send();
    	}
	});
	
}

function uploadFile (argument) {
	
 
}
/*
 * OAuth Methods
 * 
 */
function set_message(url, method, params) {
		var message = {
			action: url,
			method: (method=='GET') ? method : 'POST',
			parameters: [
			['oauth_consumer_key',consumerKey],
			['oauth_secret_key', OAuthSecret],
			['oauth_signature_method', 'HMAC-SHA1'],
			['oauth_token',''],
			["oauth_timestamp", OAuth.timestamp().toFixed(0)],
			["oauth_nonce", OAuth.nonce(42)],
			["oauth_version", "1.0"]
			]
		};
		
		Ti.API.info(">>>>>>>>>>>>>>>>>>>>>> message.parameters:" +message.parameters);
				
		for (var key in params) {
		    if (params.hasOwnProperty(key)) {
		        message.parameters.push([key,params[key]]);
		    }
		}


		return message;
}