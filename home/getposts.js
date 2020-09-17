 function getposts()
{
    // var friendlist='';
     firebase.firestore().collection('friend_list').get().then((friendsnapshot)=>{
            friendsnapshot.docs.forEach((doc)=>{
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
          firebase.firestore().collection('users').doc(friendid).get().then((usersnapshot)=>{
                      var frienddata=usersnapshot.data();
                        firebase.firestore().collection('posts').where('postedby','==',usersnapshot.id).get().then((postsnapshot)=>{
                          postsnapshot.docs.forEach((posts)=>{
                            var post=posts.data();
                            document.getElementById("postlist").innerHTML+=`<div class="card sticky-action"> 
                            <div class="card-content">
                 <ul class="collection">
                <li class="collection-item avatar valign-wrapper">                   
                    <img src="${post.profile}" alt="" class="circle">                   
                    <span class="card-title  grey-text text-darken-4">${post.user}</span>                    
                    <button onclick="getcomment('${posts.id}')" class="btn-flat" style="margin-left:auto;cursor:pointer"><i class="material-icons" >more_vert</i></button>
                </li>
                </ul>
            </div>
            <div class="card-image waves-effect waves-block waves-light">
                <img class="activator post-img " id="userprofile" src=${post.image}>
            </div>
            <hr>
            <div style="padding:5px">
                    ${post.caption}
                </div>            
            <div class="card-action">                                
                <button  class="btn" onclick="comment('${posts.id}')"><i class="material-icons right">comment</i>Add Comment</button>
            </div>            
            </div>`;
                          })
                        })              
                })
            }
              })            
          })
}
getposts();

var getcommentelem = document.getElementById('getcomment');
const getcommentinstance = M.Modal.init(getcommentelem);
var getcommentpostid;



function getcomment(post_id)
{
    var commentcount=0;
    var commentlist="";
               firebase.firestore().collection("comments").where('postid','==',post_id).get().then((commentsnapshot)=>{
                    commentsnapshot.docs.forEach((comments)=>{
                            var comment=comments.data();
                           commentlist+=`
                            <li class="collection-item avatar">                        
                            <div>
                            <img src=${comment.photo} alt="" class="circle">
                            <span class="title">${comment.name}</span>                         
                            </div>
                            <div>
                            <div>
                            ${comment.comment}
                            </div>                             
                            <span style="float:right">
                            ${comment.dateTime}
                            </span>
                            </div>
                            </li>`;       
                            commentcount=commentcount+1;                       
                    })

                    document.getElementById("commentcount").innerHTML=commentcount;
                    document.getElementById("comment_list").innerHTML=commentlist;
                getcommentinstance.open();                
                })  
}



                    


