function uploadimg()
{
	document.getElementById("imginput").click();
}

function getimg(event)
{
		var image=event.files[0];

	  if(!image.type.match("image.*"))
	  {
	    alert("Please select image only");
	  }
	  else
	  {
	  		var reader=new FileReader();
	  		reader.addEventListener('load',function(){
	  			let imagesrc =reader.result;	  			
	  			document.getElementById("postimg").src=imagesrc;

	  		},false)
	  }

	   if(image)
    	{
      		reader.readAsDataURL(image);
    	}
}

function upload()
{
	if(document.getElementById("captioninput").value.length>100)
	{
		alert("Length of caption must be less than 100");
	}
	else
	{
		if(document.getElementById("postimg").src!=='')
		{	
					if(confirm("Are you sure?"))
					{			
						let post={};  
						let hr=new Date().getHours();
						let min=new Date().getMinutes();
						let sec=new Date().getSeconds();
						let seconds=(3600*hr)+(min*60)+sec;
						let year=new Date().getFullYear();
						let month=new Date().getMonth();
						let currentdate=new Date().getDate();
						let day=`${year}${month}${currentdate}`;
			        	key=`${day}-${seconds}`;

						 post={
						 	key:key,
							postedby:localStorage.getItem("currentUserkey"),
							user:firebase.auth().currentUser.displayName,
							profile:firebase.auth().currentUser.photoURL,
							image:document.getElementById("postimg").src,
							caption:document.getElementById("captioninput").value,
							dateTime:new Date().toLocaleString(),
						}		

						  firebase.firestore().collection('posts').doc(key).set(post).then((snapshot)=>{
						  		document.getElementById("captioninput").value=''; 						  		
						  		document.getElementById("postimg").src='';
						  		alert("Upload Success");  

						  })



					}
					else
					{
						alert("upload cancel");		
					}
			}		
			else
			{
				alert("Post can't be empty select image");
			}			
	}
	
}