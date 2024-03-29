
var win = Titanium.UI.currentWindow;

var currentUser = {};

var Cloud = win.Cloud;

var appkey = '';
var OAuthSecret = '';
var consumerKey = '';
var fromGallery = 'gallery';
var fromSD      = 'sd';
var fileloading = false
var uoloading   = false;

if(Cloud.debug == true){
	appkey = '4BwETUU5O8lUo0es7xlvYaKTJa6hmX4l';
	OAuthSecret = 'UOaevJco8KAAAZFfg83z5Qv8UHfnHsIp';
	consumerKey = '9SZA3i2EhaO3wAVqID8yDL6gLZdwMLs6';
}else{
	appkey = 't1HQXR8047dBuzkfMD8lVK646O5fT4bS';
	OAuthSecret = 'UOaevJco8KAAAZFfg83z5Qv8UHfnHsIp';
	consumerKey = '9SZA3i2EhaO3wAVqID8yDL6gLZdwMLs6';
} 

/*
 * UI 
 */
var isAndroid = Ti.Platform.osname == 'android';
var screenWidth 	= Titanium.Platform.displayCaps.platformWidth;
var screenHeight	= Titanium.Platform.displayCaps.platformHeight;

win.backgroundColor = '#399';
var addButton = Titanium.UI.createButton({
	title:'Add'
});
if(isAndroid){
	addButton.top=10;
	addButton.left=200;
	addButton.width =100;
	addButton.height = 44;
}
		
addButton.addEventListener('click', showFilesSourcesOption);

var messagelabel = Titanium.UI.createLabel({
	color:'#fff',
	text:currentUser.last_name,
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	width:'auto',
	top:10,
	left:20
});

win.add(messagelabel);

//Table
//create refresh view and relative variable
var pulling = false;
var reloading = false;

var tableHeader = Titanium.UI.createView({
	backgroundImage:'img/header.png',
	width: screenWidth,
	height: 120
})

var arrowImage = Titanium.UI.createImageView({
	backgroundImage:"img/refreshArrow.png",
	width:22,
	height:54,
	bottom:20,
	left:20
})
var statusLabel = Ti.UI.createLabel({ 
	text:"Pull to refresh...",
	left:85,
	width:200,
	bottom:28,
	height:"auto",
	color:"#FFF",
	textAlign:"center",
	font :{fontSize:14, fontWeight :"bold"},
	shadowColor:"#89a",
	shadowOffset:{x:0,y:1}
});
var actIndicator = Titanium.UI.createActivityIndicator({
	left:20,
	bottom:20,
	width: 40,
	height: 40
});
tableHeader.add(actIndicator);
tableHeader.add(arrowImage);
tableHeader.add(statusLabel);


//create a table view
var recipesTable = Titanium.UI.createTableView({
	width: screenWidth,
	height: screenHeight - 60,
	top: 	60,
	left: 	0,
	filterAttribute:'filter'
}); 
recipesTable.headerPullView = tableHeader;
win.add(recipesTable);

//table scrolling function
recipesTable.addEventListener('scroll', function(e){
	if(isAndroid){
		return;
	}
	
	var offset = e.contentOffset.y;
	if(offset < -80.0 && !pulling)
	{
		pulling = true;
		arrowImage.backgroundImage = 'img/refreshArrow_up.png';
		statusLabel.text = "Release to refresh...";
	}else{
		pulling = false;
		arrowImage.backgroundImage = 'img/refreshArrow.png';
		statusLabel.text = "Pull to refresh...";
	}
});
recipesTable.addEventListener('scroll', function(e){
	if(Ti.Platform.osname != 'iphone'){
		return;
	}
	var offset = e.contentOffset.y;
	if(pulling && !reloading && e.contentOffset.y <= -80.0)
	{
		reloading = true;
		pulling = false;
		arrowImage.hide();
		actIndicator.show();
		statusLabel.text = "Reloading recipes...";
		recipesTable.setContentInsets({top:80},{animated:true});
		
		//null out the existing recipe data
		recipesTable.data = null;
		data =[];
		
		loadFiles();
	}
});
//tablerow selected function: create new window
recipesTable.addEventListener('click', function(e){
	
	//get the selected row index
	var selectedRow = e.rowData;
		
});

// this is use for more actions
var floatingView = Ti.UI.createView({
	width: screenWidth-40,
	height: screenHeight - 100,
	top: 20,
	left:20
});
if(isAndroid){
	floatingView.backgroundColor= '#000';
	floatingView.opacity= 0.6;
}else{
	floatingView.updateLayout({
		backgroundColor: 'rgba(0,0,0,0.5)'
	});	
}
var closeButton = Titanium.UI.createButton({
		zIndex:9,
		width: 35,
		height: 35 ,
		top: 	5,
		right: 	10,
		title:'X'
});
closeButton.addEventListener('click',function(){
	win.remove(floatingView);
});

floatingView.add(closeButton);
 
var dsFileTable = Titanium.UI.createTableView({
	width: floatingView.width -20,
	height: floatingView.height - 20 ,
	top: 	10,
	left: 	10,
});

var ind=Titanium.UI.createProgressBar({
	width:200,
	height:50,
	bottom:'30%',
	min:0,
	max:1,
	value:0,
	style:Titanium.UI.iPhone.ProgressBarStyle.PLAIN,
	message:'Uploading...',
	font:{fontSize:12, fontWeight:'bold'},
	color:'#888'
});
Ti.App.addEventListener('userHasLogin',userHasLogin);		
win.addEventListener('focus', loadFiles);

		
init(win.currentUser);


/*
 * Initialiez Methods
 * 
 */

function init(loginedUser)
{
	Ti.API.info(">>>>>>>>>>>>>>>>>>>>>> loginedUser.status:" +loginedUser.status);
	
	if(loginedUser.status == 'logined')
	{
		currentUser = win.currentUser;
		if(isAndroid){
			addButton.top=10;
			addButton.left=200;
			addButton.width =100;
			addButton.height = 44;
			win.add(addButton);
		}else
		{
			win.setRightNavButton(addButton);
		}
		
		loadFiles(1);
		
	}else if(loginedUser.status == 'waiting')
	{
		messagelabel.text = 'Waiting...';
	
	}else if(loginedUser.status == 'unlogin')
	{
		messagelabel.text = 'Please go back to Account tab and login first!';
	}

}

function userHasLogin(data)
{
	Ti.API.info(">>>>>>>>>>>>>>>>>>>>>>userHasLogin:"+data.user.status);
	
	var loaginedUser = data.user;
	init(loaginedUser);
}
/*
 * File Methods
 * 
 */

function loadFiles(pageNumber)
{
	if(fileloading ||currentUser.status != 'logined' )
	{
		return;
	}
	
	fileloading = true; 		
	messagelabel.text = 'Loading files...';
	
	var xhr = Titanium.Network.createHTTPClient({
 		enableKeepAlive:false
	});

	var data = {
  		where: '{"user_id":"'+currentUser.id+'"}',
  		page:pageNumber
	};
	xhr.open('GET','https://api.cloud.appcelerator.com/v1/files/query.json?key='+appkey+'&where={"user_id":"'+currentUser.id+'"}',true,data);
		
	xhr.onload = function(response) {
		fileloading = false;
		
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
		fileloading = false;
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
        messagelabel.text = 'You have '+files.length +' files.';
        var tableData = [];
        	//get through each item 
		for(var i = 0; i < files.length; i++)
		{
			var aFile = files[i];
			
			//create table row
			var row = Titanium.UI.createTableViewRow({
				_title:aFile.name,
				_id:   aFile.id,
				_url:  aFile.url,
				hasChild: true,
				className: 'recipe-row',
				filter: aFile.name,
				height:'auto',
				backgroundColor: '#fff',
				height: 50
			});
			//title label for row at index i
			var titleLabel = Titanium.UI.createLabel({
				text:  aFile.name,
				font : {fontSize: 14, fontWeight : ' bold' },
				left: 70,
				top: 5,
				height: 20,
				width: 210,
				color:'#232'
			});
			
			row.add(titleLabel);
			
			//description view for row at index i
			var updateTimeLabel = Titanium.UI.createLabel({
				text: aFile.updated_at,
				font : {fontSize: 10, fontWeight : ' normal ' },
				left: 	70,
				top: 	titleLabel.height+5,
				width: 	200,
				color:	'#9a9',
				height: 20
			});
			
			row.add(updateTimeLabel);
			
		
			//according to the file type, add different icon to the left of the row
			var imageName = 'img/Unknown.png';
			if(aFile.custom_fields){
			if(aFile.custom_fields.tag == "photo")
			{
				imageName = 'img/Gallery.png';
			}else if(aFile.custom_fields.tag == "text")
			{
				imageName = 'img/TEXT.png';
			} }
			var iconImage = Titanium.UI.createImageView({
				image:imageName,
				width: 50,
				height: 50,
				left: 10,
				top: 10 
			});
			row.add(iconImage);
			//add the row to data array
			tableData.push(row);
		}
		// set the data to tableview's data
		recipesTable.data = tableData;
		
		if(reloading == true){
			//when done, reset the header to its original style 
			recipesTable.setContentInsets({top:0},{animated:true});
			reloading = false;
			statusLabel.text = "Pull to refresh...";
			actIndicator.hide();
			arrowImage.backgroundImage = 'img/refreshArrow.png';
			arrowImage.show();
		 }
      }
    }
    
  }
}

function showFilesSourcesOption(){
	if(isAndroid &&Ti.Filesystem.isExternalStoragePresent()){
		var opts = {
 		 title: 'Choose from',
 		 cancel:1
		};
		opts.options = ['SD Card', 'Photo Gallery'];
  		//opts.buttonNames = ['Confirm','Cancel'];
  		
  		var dialog = Ti.UI.createOptionDialog(opts);
  		dialog.addEventListener('click',function(e){
  			if(e.index == 0)
  			{
  				openSDFiles(e);	
  			}else{
  				openPhotoGallery(e);
  			}
  		});
  		dialog.show();
	}else{
		openPhotoGallery();
	}
}

function uploadFiles(file, fileName, tag){

 /* Create a progress bar */
    uoloading = true;
       		 
	floatingView.add(ind);
	ind.show();
 		
 	var custom_fields='{\"tag\": \"photo\"}';
        
	var params = {
		'name':fileName, 
	    'file':file,
        'custom_fields':custom_fields
	};

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
			
	xhr.open('POST','https://api.cloud.appcelerator.com/v1/files/create.json?key='+appkey);
	xhr.setRequestHeader("Cookie", "_session_id="+currentUser.session_id);
	     		
	xhr.send(params);
	
}

function updateFile (argument) {
	
 
}
function openPhotoGallery(e){
	Titanium.Media.openPhotoGallery({
    	success:didSelectPhoto
   });
}
function openSDFiles(){
	var dir = Titanium.Filesystem.getFile(Titanium.Filesystem.externalStorageDirectory);
	var fileList = dir.getParent().getDirectoryListing();
	Ti.API.info('external directoryListing = ' + dir.getParent().getDirectoryListing());
	
	win.add(floatingView);
	
	floatingView.updateLayout({
		top: 20,
		width: screenWidth-40,
		height: screenHeight - 100,
   	});
	var tableData =[];
	for(var i=0; i<fileList.length; i++) {
   		var file = fileList[i];
 
    	var fileName = file.toString();
    	fileName = fileName.substr(fileName.lastIndexOf("/") + 1);
 
    	if (fileName.substr(0,5) == 'tixhr') {
      	//	file.deleteFile();
    	}else
    	{
	    	//create table row
			var row = Titanium.UI.createTableViewRow({
				_file:file,
				height:44,
				backgroundColor: '#fff'
			});
			//title label for row at index i
			var titleLabel = Titanium.UI.createLabel({
				text:	fileName,
				font : {fontSize: 14, fontWeight : ' bold' },
				left: 20,
				top: 5,
				height: 30,
				width: dsFileTable.width -40,
				color:'#232'
			});
			
			row.add(titleLabel);
			tableData.push(row);
    	}
  	}
  	dsFileTable.data= tableData;
  	dsFileTable.addEventListener('click',didSelectSDFile);
  		
	dsFileTable.show();
	floatingView.add(dsFileTable);
	floatingView.add(closeButton);
	
}
function didSelectPhoto(event){
	var selectedPhoto = event.media;
	dsFileTable.hide();
	win.add(floatingView);
	showUploadFileView(selectedPhoto,'','gallery');       
}
function didSelectSDFile(event){
	var selectedRow = event.rowData;
	var file = selectedRow._file;
	var fileName = file.toString();
	dsFileTable.hide();
	showUploadFileView(file,fileName,'sd');
}
function showUploadFileView(file, fileName, source){
	//get the selected row index
		
    	floatingView.updateLayout({
    	    top: '25%',
        	height: '50%'
   		});
   		
		var uploadView = Titanium.UI.createView({
			zIndex:0,
			width: '90%',
			height: '90%',
			top: 	'5%',
			left: 	'5%',
			backgroundColor:'#FFF',
			opacity:1.0
		});
		var titleLable = Titanium.UI.createLabel({
			text: 'File Name:',
			font : {fontSize: 16, fontWeight : ' bold' },
			height: 30,
			width:  '30%',
			top: 	20,
			left: 	'5%',
			color:'#232'
		});
		uploadView.add(titleLable);
		
		var titleTextFiled = Titanium.UI.createTextField({
			value:	fileName,
			font: {fontSize: 16},
			borderStyle:2,
			height: 45,
			width:  '50%',
			top: 	20,
			left: 	'30%'
		});
		uploadView.add(titleTextFiled);
		
		var tagLable = Titanium.UI.createLabel({
			text: 'Tag:',
			font : {fontSize: 16, fontWeight : ' bold' },
			height: 30,
			width:  '30%',
			top: 	80,
			left: 	'5%',
			color:'#232'
		});
		uploadView.add(tagLable);
		var tagTextFiled = Titanium.UI.createTextField({
			value:	'',
			font: {fontSize: 16},
			borderStyle:2,
			height: 45,
			width:  '50%',
			top: 	70,
			left: 	'30%'
		});
		if(source == fromGallery)
		{
			tagTextFiled.value = 'photo';
		}
		uploadView.add(tagTextFiled);
		
		
		var uploadButton = Titanium.UI.createButton({
			width: '40%',
			height: 44 ,
			top: 	120,
			left: 	'10%',
			title:'Upload'
		});
		uploadButton.addEventListener('click',function(e){
			uploadView.remove(uploadButton);
			uploadFiles(file, titleTextFiled.value, tagTextFiled.value );
		});
		uploadView.add(uploadButton);
		
		var cancelButton = Titanium.UI.createButton({
			width: '40%',
			height: 44 ,
			top: 	120,
			right: 	'10%',
			title:'Cancel'
		});
		cancelButton.addEventListener('click',function(){
			if(uploading){
			
			}
			floatingView.remove(uploadView);
			win.remove(floatingView);
			if(source == fromSD){
				openSDFiles();
			}else{
				openPhotoGallery();
			}
			
		});
		uploadView.add(cancelButton);
		
		
		floatingView.add(uploadView);
		
}
