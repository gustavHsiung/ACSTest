
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
var add = Titanium.UI.createButton({
	title:'Add'
});

add.addEventListener('click', addNewFiles);

win.setRightNavButton(add);

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
	xhr.open('GET','https://api.cloud.appcelerator.com/v1/files/query.json?key='+appkey);
		
	xhr.onload = function(response) {
			//the image upload method has finished 
		if(this.responseText != '0')
		{
			Ti.API.info(">>>>>>>>>>>>>>>>>>>>>> responseText:" +this.responseText);
			var data = JSON.parse(this.responseText);
			Ti.API.info(">>>>>>>>>>>>>>>>>>>>>> data:" +data);
			
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
        label.text = 'You have '+files.length +' files...';
      }
    }
  }
}

function addNewFiles(e){
	
}
