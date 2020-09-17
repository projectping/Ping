var elem = document.getElementById('comment_modal');
const instance = M.Modal.init(elem);
var postid;


function comment(post_id)
{
	 postid=post_id;
	 instance.open();	 
}

function addcomment()
{

	var comment=document.getElementById("textarea-comment").value;
	var photo=firebase.auth().currentUser.photoURL;
	var name=firebase.auth().currentUser.displayName;
	var date= new Date().toLocaleString(); 
	var senderid=localStorage.getItem("currentUserkey");     

	if (comment!=="") 
	{

	let comment_content={};
	let hr=new Date().getHours();
	let min=new Date().getMinutes();
	let sec=new Date().getSeconds();
	let seconds=(3600*hr)+(min*60)+sec;
	let year=new Date().getFullYear();
	let month=new Date().getMonth();
	let currentdate=new Date().getDate();
	let day=`${year}${month}${currentdate}`;
	key=`${day}-${seconds}`;



	comment_content={
		key:key,
		postid:postid,
		comment:comment,
		name:name,
		photo:photo,
		senderid:senderid,
		dateTime:new Date().toLocaleString(),
	}

	
				firebase.firestore().collection('comments').doc(key).set(comment_content).then((snapshot)=>{
  					document.getElementById("textarea-comment").value=''; 						  		  		
  					alert("You comment on the post");  
				})
				
	}
	
}