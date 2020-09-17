function loadmypost(){
var userid=localStorage.getItem("currentUserkey");
firebase.firestore().collection('posts').where('postedby','==',userid).get().then((postsnapshot)=>{
                          postsnapshot.docs.forEach((posts)=>{
                            var post=posts.data();
                            document.getElementById("mypostlist").innerHTML+=`<div class="card sticky-action"> 
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
            <div class="card-action">
                 <button  class="btn red" onclick="deletepost('${posts.id}')"><i class="material-icons right">delete_forever</i>Delete</button>         
            </div>
            </div>`;
          })
    })  
}

loadmypost();



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


function deletepost(post_id)
{
  if(confirm("Are you sure?"))
  {
    firebase.firestore().collection('posts').doc(post_id).delete();
     alert("post deleted");
    window.open("/ping/profile","_self"); 
  }
  
}


