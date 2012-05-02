
var win = Titanium.UI.currentWindow;

var currentUser = win.currentUser;

var Cloud = require('ti.cloud');

var appkey = '';

if(Cloud.debug){
	appkey = '4BwETUU5O8lUo0es7xlvYaKTJa6hmX4l';
}else{
	appkey = 't1HQXR8047dBuzkfMD8lVK646O5fT4bS';
} 


 
win.backgroundColor = '#399';

var label = Titanium.UI.createLabel({
	color:'#fff',
	text:currentUser.last_name,
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	width:'auto'
});

win.add(label);

if(!currentUser)
{
	label.text = 'Please go back to Account tab and login first!';
}else
{
	label.text = 'Loading files...';
	loadFiles(1);
}

/*
 * File Methods
 * 
 */
function loadFiles(pageNumber)
{
	var xhr = Titanium.Network.createHTTPClient({
 		enableKeepAlive:false
	});

	var data = {
  		where: '{"name":"Appcelerator Cloud Services"}',
  		page:pageNumber
	};
	xhr.open('GET','https://api.cloud.appcelerator.com/v1/files/query.json?key='+appkey);
		
	xhr.onload = function(response) {
			//the image upload method has finished 
		if(this.responseText != '0')
		{
			Ti.API.info(">>>>>>>>>>>>>>>>>>>>>> responseText:" +this.responseText);
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
        label.text = 'You have '+files.size +' files...';
      }
    }
  }
}