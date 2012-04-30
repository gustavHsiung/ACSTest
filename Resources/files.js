

var win = Titanium.UI.currentWindow; 
var currentUser = win.currentUser;
var sdk = new Cocoafish('4BwETUU5O8lUo0es7xlvYaKTJa6hmX4l');  // app key

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

	var data = {
  		where: '{"name":"Appcelerator Cloud Services"}',
  		page:pageNumber
	};
	sdk.sendRequest('files/query.json', 'GET', data, didLoadFiles);
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