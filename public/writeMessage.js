var sendMess = document.getElementById("sendMess");
var textArea = document.getElementById("messText");
var modified = document.getElementById("modified");

function completedCheck(error) {
  if (error) {
    alert("Data could not be saved." + error);
  } else {
    alert("Message added to Comments List.");
    textArea.value = "";
  }
}
``
var modComments = {
  init: function() {
    sendMess.addEventListener("click", function() {
      var message = textArea.value;
      modComments.writeUserData(message);
    });
    setTimeout(function() {
      modComments.removePulse();
    }, 1500);
  },
  removePulse: function() {
    sendMess.classList.remove("pulse");
  },
  writeUserData: function(message) {
    var db = firebase.database();
    var ref = db.ref("messages/");
    var newPostRef = ref.push();
    var postKey = newPostRef.key;
    console.log(postKey, "before");
    newPostRef.set(
      {
        text: message
      },
      completedCheck
    );
    this.addToList(postKey);
  },
  addToList: function(postKey) {
    this.writeModifiedText(postKey);
  },
  writeModifiedText: function(key) {
    var db = firebase.database();
    var entry = "messages/" + key;
    var ref = db.ref(entry);

    ref.on(
      "value",
      function(snapshot) {
        modified.classList.remove("hidden");
        modified.parentElement.classList.remove("hidden");
        console.log(snapshot.val());
        var snap = snapshot.val();
        var listItem = document.createElement("li");
        listItem.classList.add("collection-item");
        listItem.innerText = snap.text;
        modified.appendChild(listItem);
      },
      function(error) {
        console.log("Error: " + error.code);
      }
    );
  }
};

document.addEventListener("DOMContentLoaded", function(event) {
  modComments.init();
});
