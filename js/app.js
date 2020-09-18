 
// initialize materialze component

 $(document).ready(function(){
    $('.sidenav').sidenav();
    $('.dropdown-trigger').dropdown();
      $('input#captioninput').characterCounter();       
  });

 // -----------------------------------------------------------------


 //-------------signIn ------------------------//
function signIn()
{
	var provider=new firebase.auth.GoogleAuthProvider();
	firebase.auth().signInWithPopup(provider).then((result)=>{
			window.open("/ping/home","_self");
	});
}
//-------------signIn ------------------------//




//------------------signout-------------------------//
function signOut()
{
    localStorage.clear();
	firebase.auth().signOut().then(()=>{
		window.open("/ping/","_self");
	});
}
//------------------signout-------------------------//


// ----------------notification count--------------------//



    
    var currentUserkey=localStorage.getItem("currentUserkey");                       
    firebase.firestore().collection('notification').onSnapshot((snapshot)=>{
	  var notificationcount=0;
          snapshot.docChanges().forEach((change)=>{
                var notification=change.doc.data(); 
                if(notification.sendTo===currentUserkey && notification.status==="Pending")
                {
                      notificationcount=notificationcount+1;
                }                
          })
	    if(notificationcount!==0)
	    {
	    	document.getElementById("notificationcount").innerHTML=`<span class="badge green">${notificationcount}</span>`;
	    }
    })





// ----------------notification count--------------------//



//---------------------------------State Change------------------------------//
//check state change
function onFirebaseStateChanged()
{
	firebase.auth().onAuthStateChanged(onStateChanged);
}

//check state change called
onFirebaseStateChanged();

//onStateChanged callback called
function onStateChanged(user)
{
	if(user)
	{
		
		//creating user object
        var userProfile = { email: '', name: '', photoURL: '' };
        userProfile.email = firebase.auth().currentUser.email;
        userProfile.name = firebase.auth().currentUser.displayName;
        userProfile.photoURL = firebase.auth().currentUser.photoURL;

        var flag=false;

        //checking if user exist
        firebase.firestore().collection('users').get().then((snapshot)=>{
        	snapshot.docs.forEach((doc)=>{
        		var user=doc.data();
        		if(user.email===userProfile.email)
        		{
                    currentUserkey=doc.id;
                    localStorage.setItem("currentUserkey",currentUserkey);
        			flag=true;
        		}
        	} )
     	     if(flag)
	        {
    	    	showinfo(); //display info if user exist
	        }
        	else
        	{
        			// add user and display info
        			firebase.firestore().collection('users').add(userProfile).then(()=>{
						showinfo();			
         			})
        	}

          //generating token for notifications
          var currentUserkey=localStorage.getItem("currentUserkey");
          const messaging = firebase.messaging();

            navigator.serviceWorker.register('../firebase-messaging-sw.js')
                .then((registration) => {
                    messaging.useServiceWorker(registration);

                    // Request permission and get token.....
                    messaging.requestPermission().then(function () {
                        return messaging.getToken();
                    }).then(function (token) {                        
                         firebase.firestore().collection('fcmTokens').doc(currentUserkey).set({ token_id: token });
                    })
                });
        })            
	}	
}
//---------------------------------State Change------------------------------//





//------------display info--------------------//
function showinfo()
{
	document.getElementById("username").innerHTML=firebase.auth().currentUser.displayName;
	document.getElementById("useremail").innerHTML=firebase.auth().currentUser.email;
	document.getElementById("userprofile").src=firebase.auth().currentUser.photoURL;        		 	
}
//------------display info--------------------//

//--------------------get list of users-----------------------------//
function userslist()
{
    var userslist='';
    var currentUserkey=localStorage.getItem("currentUserkey");                       
    firebase.firestore().collection('users').get().then((usersnapshot)=>{
        usersnapshot.docs.forEach( (userdoc)=>{
               var user=userdoc.data();               
               if(user.email!==firebase.auth().currentUser.email)
               { 
                       
                       firebase.firestore().collection("friend_list").get().then((friendsnapshot)=>{
                         var isfriend=false;
                         for(let i=0; i<friendsnapshot.docs.length;i++)
                         {
                               var friend=friendsnapshot.docs[i].data();
                                 if((friend.friendId===userdoc.id && friend.userId===currentUserkey) || (friend.friendId===currentUserkey && friend.userId===userdoc.id))
                                 {                                     
                                     isfriend=true;                                     
                                     break;
                                 }
                                 else
                                 {                                   
                                   isfriend=false;
                                 }
                         }

                         if(isfriend===false)
                         {               
                                 firebase.firestore().collection("notification").get().then(  (noticesnapshot)=>{
                                     var isrequested=false;
                                     for(let i=0;i<noticesnapshot.docs.length;i++)
                                     {  
                                         var notice=noticesnapshot.docs[i].data();
                                         if(notice.sendTo===userdoc.id && notice.sendFrom===currentUserkey && notice.status==="Pending")
                                         {
                                               isrequested=true;                                                                                                                                    
                                               break;
                                         }
                                         else
                                         {
                                              isrequested=false;                                           
                                         }
                                     }
                                     if( isrequested)
                                     {
                                             userslist+= `
                                                <div class="col s12 m3">  
                                                <div class="card">
                                                <div class="card-image">
                                                <img src="${user.photoURL}" style="width:100%;height:200px">                                                
                                                </div>
                                                <div class="card-content">
                                                <h5>${user.name}</h5>                                                                        
                                                <button disabled>Request sent</button>                        
                                                </div>
                                                </div>
                                                </div>
                                                `;    
                                     }
                                     else
                                     {
                                             userslist+= `
                                              <div class="col s12 m3">  
                                              <div class="card">
                                              <div class="card-image">
                                              <img src="${user.photoURL}" style="width:100%;height:200px">
                                              <a class="btn-floating halfway-fab waves-effect waves-light red"><i class="material-icons">add</i></a>
                                              </div>
                                              <div class="card-content">
                                              <h5>${user.name}</h5>                        
                                              <button onclick="sendrequest( '${userdoc.id}' )" class="btn  blue waves-effect waves-light">Add</button>                        
                                              </div>
                                              </div>
                                              </div>
                                              `;  
                                     }
                                     document.getElementById("userslist").innerHTML=userslist;   
                                 })
                         }                         
                           
                       }  )
                 }                                    
                                                           
           }  )
           
      })
}
//--------------------get list of users-----------------------------//

//-------------------------send message----------------------------------//
function send()
{
    document.addEventListener('keydown',(key)=>{
        if(key.which==13)
        {
            sendmessage();
        }
    })
}

function sendmessage()
{
        let message =document.getElementById("msginput").value;
        let date= new Date().toLocaleString();      
        let sender=localStorage.getItem("currentUserkey");
        let chatobj={};  

        let hr=new Date().getUTCHours();
        let min=new Date().getUTCMinutes();
        let sec=new Date().getUTCSeconds();

        let seconds=(3600*hr)+(min*60)+sec;

        let year=new Date().getUTCFullYear();
        let month=new Date().getUTCMonth();
        let currentdate=new Date().getUTCDate();

        let day=`${year}${month}${currentdate}`;
      
        
        chatMessage=`${day}-${seconds}`;
        chatobj[chatMessage]={ msg:message,sender:sender,dateTime:date}                 
        if (message!=='')
        {
            let chatkey=localStorage.getItem("chatkey");

            firebase.firestore().collection('chatMessages').doc(chatkey).set( chatobj,{merge:true} ).then(()=>{ 

              var friend_id=localStorage.getItem("friendid");
               firebase.firestore().collection('fcmTokens').doc(friend_id).get().then(function (data) {
                 var friendtoken=data.data();                 
                $.ajax({
                    url: 'https://fcm.googleapis.com/fcm/send',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'key=AAAAi_TEqKc:APA91bH3cXXg4zLy4EbGW8srnO9dN9SGG6A3iOo52aSGy3Al2DldLn5-zW2vxHEBsGCZy1OBblbWZt3Uwp2lCTFCYiUCV01cmQutdqSXfi9Tke0nlRhge-tzmzv1tOL_BL8zN97g6zof'
                    },
                    data: JSON.stringify({
                        'to': friendtoken.token_id, 'data': { 'message': chatobj[chatMessage].msg.substring(0, 30) + '...', 'icon': firebase.auth().currentUser.photoURL }
                    }),
                    success: function (response) {
                        // console.log(response);
                    },
                    error: function (xhr, status, error) {
                        console.log(xhr.error);
                    }
                });
            });

                  document.getElementById("msginput").value='';            
            })
        }
          document.getElementById("msginput").focus();
          document.getElementById("message_body").scrollTo(0, document.getElementById("message_list").clientHeight );
}
//-------------------------send message----------------------------------//


//----------------select friend to chat  chatwithfriend-------------------------//
function chatwithfriend(friendid,friendname,friendprofile)
{
        chatwith(friendid,friendname,friendprofile);
        //creating user object
        var friendList = { friendId: friendid , userId: localStorage.getItem("currentUserkey") };       
        var flag=false;
        //checking if friend exist
        firebase.firestore().collection('friend_list').get().then((snapshot)=>{
            snapshot.docs.forEach((doc)=>{
                var user=doc.data();
                if((user.friendId===friendList.friendId && user.userId===friendList.userId) || (user.friendId===friendList.userId && user.userId===friendList.friendId) )
                {                              
                    flag=true;
                    localStorage.setItem("chatkey",doc.id);
                }
            })
              if(flag)
            {
                // showinfo(); //display info is user exist
                window.open("/ping/chat","_self");           
            }
            else
            {
                    // add user and display info
                    firebase.firestore().collection('friend_list').add(friendList).then((result)=>{                        
                        localStorage.setItem("chatkey",result.id);
                        window.open("/ping/chat","_self");           
                     })
            }
        })        
}


//chatwith
function chatwith(friendid,friendname,friendprofile)
{
    localStorage.setItem("friendid",friendid);
    localStorage.setItem("friendname",friendname);
    localStorage.setItem("friendprofile",friendprofile);
}
//----------------select friend to chat  chatwithfriend-------------------------//



//-----------load chat list----------------------------//
function loadchatlist()
{
     
     firebase.firestore().collection('friend_list').get().then((snapshot)=>{
         snapshot.docs.forEach((doc)=>{

             var friendkey='';
             var lst=doc.data();             
             if(lst.friendId===localStorage.getItem("currentUserkey"))
             {
                  friendkey=lst.userId;
             }
             else if(lst.userId===localStorage.getItem("currentUserkey"))
                 {
                      friendkey=lst.friendId;
                 }

                 if (friendkey !== "") {                          
                     //get friend information for chat list
             firebase.firestore().collection('users').doc(friendkey).get().then((frienddoc)=>{              
                        var friend=frienddoc.data();
                        document.getElementById("chatlist").innerHTML+=`
                                    <div class="friend_chat card horizontal hoverable" style="padding: 4px;align-items: center;cursor:pointer" 
                                        onclick="chatwithfriend( '${friendkey}' , '${friend.name}' ,'${friend.photoURL}' )">
                                        <div class="card-image" style="margin: 5px;padding: 2px;">
                                            <img src="${friend.photoURL}" style="width: 50px; height: 50px;border-radius: 50%">
                                        </div>
                                        <p>${friend.name}</p>
                                    </div>`;
                         })     
                 }
         })
     })
}
//-----------load chat list----------------------------//


//-----------------------loadchat-----------------------------//
function loadchat()
{
    var chatkey=localStorage.getItem("chatkey"); 
    firebase.firestore().collection('chatMessages').doc(chatkey).get().then((doc)=>{              
                        var message=doc.data();
                        var msg='';
                        var sender=localStorage.getItem("currentUserkey");
                        var msgarr=Object.entries(message);
                        msgarr.sort().forEach((data)=>{                            
                            if(data[1].sender===sender)
                            {
                                   msg=` <div class="row">
                                <p class="rightmsg">
                                  ${data[1].msg}
                                </p>
                                 </div>`;
                            }
                            else
                            {
                                 msg=` <div class="row">
                                <p class="leftmsg">
                                  ${data[1].msg}
                                </p>
                                 </div>`;   
                            }                               
                              document.getElementById("message_list").innerHTML+=msg; 
                              document.getElementById("msginput").focus();
                              document.getElementById("message_body").scrollTo(0, document.getElementById("message_list").clientHeight );
                            })                        
                         })
}

// loadchat();
//-----------------------loadchat-----------------------------//


//------------------------send image-----------------------------------------//
function chooseimage()
{
  document.getElementById("imgfile").click();
}

function sendimage(event)
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

      //sending image
      let message =reader.result;
      let date= new Date().toLocaleString();      
      let sender=localStorage.getItem("currentUserkey");
      let chatobj={};  

        let hr=new Date().getHours();
        let min=new Date().getMinutes();
        let sec=new Date().getSeconds();

        let seconds=(3600*hr)+(min*60)+sec;

        let year=new Date().getFullYear();
        let month=new Date().getMonth();
        let currentdate=new Date().getDate();

        let day=`${year}${month}${currentdate}`;
      
        
        chatMessage=`${day}-${seconds}`;
        chatobj[chatMessage]={ msg:message,sender:sender,dateTime:date}                 
        if (message!=='')
        {
            let chatkey=localStorage.getItem("chatkey");

            firebase.firestore().collection('chatMessages').doc(chatkey).set( chatobj,{merge:true} ).then(()=>{                              
                  document.getElementById("msginput").value='';            
            })
        }
          document.getElementById("msginput").focus();
          document.getElementById("message_body").scrollTo(0, document.getElementById("message_list").clientHeight );

    },false);

    if(image)
    {
      reader.readAsDataURL(image);
    }

  }
}
//------------------------send image-----------------------------------------//


//----------------send friend request--------------------//
function sendrequest( sendto )
{
    var currentUserKey=localStorage.getItem("currentUserkey");
    let notification = {
        sendTo: sendto,
        sendFrom: currentUserKey,
        name: firebase.auth().currentUser.displayName,
        photo: firebase.auth().currentUser.photoURL,
        dateTime: new Date().toLocaleString(),
        msg:`${firebase.auth().currentUser.displayName} has sent you a friend request..`,
        status: 'Pending'
    };
    firebase.firestore().collection('notification').add(notification).then(()=>{
      // do something after request is sent
      console.log("request sent success");
      userslist();

    });    

}
//----------------send friend request--------------------//


function notificationlist()
{
    var notificationlist='';
    var currentUserkey=localStorage.getItem("currentUserkey");                       
    firebase.firestore().collection('notification').get().then((snapshot)=>{
          snapshot.docs.forEach((doc)=>{
                var notification=doc.data(); 
                if(notification.sendTo===currentUserkey && notification.status==="Pending")
                {
                      notificationlist+=`<li class="collection-item avatar valign-wrapper">
                        <img src="${notification.photo}" alt="" class="circle">
                        <span class="title">${notification.msg} </span>                        
                        <small style="margin-left: auto; margin-right: 20px">${notification.dateTime}</small>
                        <div>
                        <button onclick="acceptrequest('${notification.sendFrom}','${doc.id}')" class="btn green waves-effect waves-light">Accept</button>
                        <button onclick="rejectrequest('${doc.id}')" class="btn red waves-effect waves-light">Reject</button>
                    </div>
                    </li>                    
                    `;
                }                
          })
          document.getElementById("notificationlist").innerHTML=notificationlist;
    })
}



function acceptrequest(friendid,docid)
{
    var friendList = { friendId: friendid , userId: localStorage.getItem("currentUserkey") };
    var flag=false;
        //checking if friend exist
        firebase.firestore().collection('friend_list').get().then((snapshot)=>{
            snapshot.docs.forEach((doc)=>{
                var user=doc.data();
                if((user.friendId===friendList.friendId && user.userId===friendList.userId) || (user.friendId===friendList.userId && user.userId===friendList.friendId) )
                {                              
                    flag=true;                    
                }
            })
              if(flag)
            {           
                alert("already a friend");
            }
            else
            {
                    // add friend
                    firebase.firestore().collection('friend_list').add(friendList).then((result)=>{                        
                        firebase.firestore().collection('notification').doc(docid).update({
                          status:'Accept'
                        }).then(()=>{
                             alert("added as your friend");
                             notificationlist();   
                        })                       
                     })                    
            }
        })       
}
function rejectrequest(docid)
{
    if(confirm(`Once rejected can't be friend again. Are you sure?`))
    {
                      firebase.firestore().collection('notification').doc(docid).update({
                          status:'Rejected'
                        }).then(()=>{
                             notificationlist();   
                             alert("Rejected with pride.");
                        })
    }
                        
}

function friendlist()
{
    // var friendlist='';
     firebase.firestore().collection('friend_list').get().then((snapshot)=>{
            snapshot.docs.forEach((doc)=>{
                var friend=doc.data();
                var friendid='';
                if( friend.friendId===localStorage.getItem("currentUserkey")   )
                {
                      friendid=friend.userId;
                }
                else  if( friend.userId===localStorage.getItem("currentUserkey")  )
                {
                   friendid= friend.friendId;
                }                
                if(friendid!='')
                {
                firebase.firestore().collection('users').doc(friendid).get().then((snapshot)=>{
                      var frienddata=snapshot.data();
                      document.getElementById("friendlist").innerHTML+=`<div class="col s12 m3">  
                                            <div class="card">
                                                <div class="card-image">
                                                    <img src="${frienddata.photoURL}" width="100%" height="200px">
                                                </div>
                                                <div class="card-content">
                                                    ${frienddata.name}
                                                </div>
                                                <div class="card-action">
                                                    <button class="btn blue waves-effect waves-light" onclick="chatwithfriend( '${snapshot.id}' , '${frienddata.name}' ,'${frienddata.photoURL}' )">chat</button>                                                   
                                                </div>
                                            </div>
                                            </div>`;                                       
                                       ;
                })
            }
              })            
          })
}
