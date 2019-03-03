"use strict";
document.addEventListener("DOMContentLoaded", init);

const Student = {
  fullname: "-student fullname-",
  firstname: "-student firstname-",
  lastname: "-student lastname-",
  imagename: "-student imagename-",
  house: "-student house-",
  expelled: "-student expelled-",
  bloodstatus: "-student bloodstatus-",
  inquisitorialsquad: "-student inquisitorialsquad-",
  setJSONdata(studentData) {
    this.fullname = studentData.fullname;
    const parts = studentData.fullname.split(" ");
    this.firstname = parts[0];
    this.lastname = parts[parts.length - 1];
    this.house = studentData.house;
    const lastNameLower = parts[parts.length - 1].toLowerCase();
    const firstLetterLower = parts[0].substring(0, 1).toLowerCase();
    this.imagename = `images/${lastNameLower}_${firstLetterLower}.png`;
  }
};

const studentlist = [];
let expelledList = [];
const destination = document.querySelector("#dest");

let houseFilter = "all";
let sortFilter = "";
let houseColor;

let bloodList;

function init() {
  console.log("init");

  document.querySelector("#grid").addEventListener("click", clickPage);

  document
    .querySelector(".warning_box")
    .addEventListener("click", clickWarning);

  getJSON();
}

async function getJSON() {
  console.log("getJSON");
  const dataJson = await fetch(
    "https://petlatkea.dk/2019/hogwarts/students.json"
  );
  const myJSON = await dataJson.json();

  const moreJson = await fetch(
    "https://petlatkea.dk/2019/hogwarts/families.json"
  );
  bloodList = await moreJson.json();
  // console.log(bloodList);

  prepareObjects(myJSON);
}

function prepareObjects(myJSON) {
  console.log("prepareObjects");

  // create new object for every student in the JSON file
  myJSON.forEach(studentData => {
    const newStudent = Object.create(Student);
    newStudent.setJSONdata(studentData);
    // push to new array
    studentlist.push(newStudent);
  });
  // insert my self to the list
  const myProfile = {
    fullname: "Karoline Sigrid",
    firstname: "Karoline",
    lastname: "Lüthje",
    imagename: "images/myimage.png",
    house: "Gryffindor",
    expelled: "-student expelled-",
    bloodstatus: "pure-blood",
    inquisitorialsquad: "-student inquisitorialsquad-"
  };

  studentlist.push(myProfile);
  // add unique id to everyone on the studentlist
  studentlist.forEach(student => {
    student.id = uuidv4();
  });
  // console.log(studentlist);

  checkNames();
}

function checkNames() {
  console.log("checkNames");
  // check for a match between every lastname on studentlist and family names on bloodlist
  studentlist.forEach(student => {
    bloodList.half.forEach(name => {
      if (name === student.lastname) {
        student.bloodstatus = "half-blood";
      }
    });
    bloodList.pure.forEach(name => {
      if (
        name === student.lastname &&
        student.bloodstatus === "-student bloodstatus-"
      ) {
        student.bloodstatus = "pure-blood";
      }
    });
    if (student.bloodstatus === "-student bloodstatus-") {
      student.bloodstatus = "muggle-blood";
    }
  });

  hackedBloodstatus();
}

function hackedBloodstatus() {
  console.log("hackedBloodstatus");

  // change purebloods to either half or muggle, and change half and muggles to pure
  studentlist.forEach(student => {
    const randomValue = Math.random();
    if (student.bloodstatus === "pure-blood") {
      if (randomValue < 0.5) {
        student.bloodstatus = "half-blood";
      }
      if (randomValue > 0.5) {
        student.bloodstatus = "muggle-blood";
      }
    } else if (
      student.bloodstatus === "half-blood" ||
      student.bloodstatus === "muggle-blood"
    ) {
      student.bloodstatus = "pure-blood";
    }
  });
  // make sure my bloodstatus is always pure
  studentlist[
    studentlist.findIndex(obj => obj.lastname === "Lüthje")
  ].bloodstatus = "pure-blood";

  countStudents();
}

function countStudents() {
  console.log("countStudents");

  // update counters
  const counts = {
    Gryffindor: 0,
    Slytherin: 0,
    Hufflepuff: 0,
    Ravenclaw: 0
  };
  //add one to counts for each match between a student's house and the property in counts
  studentlist.forEach(student => {
    counts[student.house]++;
  });

  document.querySelector(".hufflepuff_amount").innerHTML =
    counts.Hufflepuff + " Hufflepuff-students";

  document.querySelector(".gryffindor_amount").innerHTML =
    counts.Gryffindor + " Gryffindor-students";

  document.querySelector(".slytherin_amount").innerHTML =
    counts.Slytherin + " Slytherin-students";

  document.querySelector(".ravenclaw_amount").innerHTML =
    counts.Ravenclaw + " Ravenclaw-students";

  document.querySelector(".expelled_amount").innerHTML =
    expelledList.length + " Expelled students";
  document.querySelector(".total_amount").innerHTML =
    studentlist.length + " Students";

  filterList(houseFilter);
}

function clickPage(event) {
  console.log("clickPage");
  const action = event.target.dataset.action;
  // console.log(action);
  if (action === "firstname" || action === "lastname" || action === "house") {
    event.preventDefault();
    sortFilter = action;
    // make the active sorting visible in dropdown button
    document.querySelectorAll(".sort_button").forEach(button => {
      button.classList.remove("active");
    });
    event.target.classList.add("active");
    filterList(houseFilter);
  }
  if (
    action === "all" ||
    action === "Gryffindor" ||
    action === "Ravenclaw" ||
    action === "Hufflepuff" ||
    action === "Slytherin"
  ) {
    event.preventDefault();
    houseFilter = action;
    // make the active filter visible in dropdown button
    document.querySelectorAll(".filter_button").forEach(button => {
      button.classList.remove("active");
    });
    event.target.classList.add("active");
    filterList(houseFilter);
  }
  if (action === "add_inquisitorial" || action === "remove_inquisitorial") {
    event.preventDefault();
    clickedInquisitorial(event, action);
  }

  if (action === "close_modal") {
    event.preventDefault();
    hideModal();
  }

  if (action === "close_denied_box") {
    event.preventDefault();
    hideModal();
    hideDenied();
  }
  if (action === "expell") {
    event.preventDefault();
    clickRemove(event);
  }
}

function clickRemove(event) {
  console.log("clickRemove");
  // compare the buttons id to the students and find the matching object and its index
  const uniqueId = event.target.dataset.id;
  const studentIndex = studentlist.findIndex(obj => obj.id === uniqueId);
  const clickedStudent = studentlist.find(obj => obj.id === uniqueId);

  // show a warning if user tries to expell me
  if (clickedStudent.lastname === "Lüthje") {
    document.querySelector(".warning_box").style.opacity = 1;
    document.querySelector(".warning_box").style.pointerEvents = "all";
    document
      .querySelector(".warning_box")
      .classList.add("warning_box_animation");
    // prevent the user from activating anything "through" the warningbox
    document.querySelector("#grid").style.pointerEvents = "none";
    document.querySelector("#siren_noise").play();
  } else {
    expelledList.push(clickedStudent);
    // TODO: Splice that element from the array
    studentlist.splice(studentIndex, 1);
  }
  // Re-display the list
  countStudents();
}

function clickWarning(event) {
  console.log("clickWarning");
  const action = event.target.dataset.action;

  if (action === "close_warning") {
    closeWarning();
  }
  if (action === "scale_button") {
    document.querySelector(".got_it").style.transform = "scale(2)";
  }
}

function closeWarning() {
  console.log("closeWarning");
  document.querySelector(".got_it").style.transform = "scale(1)";
  document.querySelector(".warning_box").style.pointerEvents = "none";
  document.querySelector(".warning_box").style.opacity = 0;
  document
    .querySelector(".warning_box")
    .classList.remove("warning_box_animation");
  document.querySelector("#grid").style.pointerEvents = "all";
  document.querySelector("#siren_noise").pause();
}

function filterList(houseFilter) {
  console.log("filterList");
  if (houseFilter === "all") {
    sortList(sortFilter, studentlist);
  } else {
    const filtered = filterByHouse(houseFilter, studentlist);
    sortList(sortFilter, filtered);
  }
}

function filterByHouse(house, list) {
  console.log("filterByHouse");
  function filterHouse(student) {
    return student.house === house;
  }
  return list.filter(filterHouse);
}

function sortList(sortFilter, list) {
  console.log("sortList");
  let sorted;
  if (sortFilter === "") {
    sorted = list;
  }
  if (sortFilter === "firstname") {
    sorted = list.sort(firstnameSort);
  }
  if (sortFilter === "lastname") {
    sorted = list.sort(lastnameSort);
  }
  if (sortFilter === "house") {
    sorted = list.sort(houseSort);
  }
  displayStudentlist(sorted);
}

function firstnameSort(a, b) {
  if (a.firstname < b.firstname) {
    return -1;
  } else {
    return 1;
  }
}
function lastnameSort(a, b) {
  if (a.lastname < b.lastname) {
    return -1;
  } else {
    return 1;
  }
}
function houseSort(a, b) {
  if (a.house < b.house) {
    return -1;
  } else {
    return 1;
  }
}

function displayStudentlist(list) {
  console.log("displayStudentlist");
  destination.innerHTML = "";
  list.forEach(displayStudent, list);
  // console.log(list);
}

function displayStudent(student, list) {
  const clone = document.querySelector(".temp").cloneNode(true).content;

  clone.querySelector(".data-firstname").textContent = student.firstname;
  clone.querySelector(".data-lastname").textContent = student.lastname;
  clone.querySelector("h2").addEventListener("click", () => {
    showModal(student);
  });
  clone.querySelector(".data-house").textContent = student.house;
  clone.querySelector(".expell_button").dataset.id = student.id;

  destination.appendChild(clone);
}

function showModal(studenten) {
  console.log("showModal");

  const modal = document.querySelector(".modal");
  const closeModal = document.querySelector(".close");

  modal.dataset.status = "modal_is_open";

  modal.classList.add("show");
  document.querySelector("body").classList.add("modal_open");

  houseColor = studenten.house.toLowerCase();
  document.querySelector(".modal_content").classList.add(houseColor);

  modal.querySelector(".student_picture").src = studenten.imagename;

  if (studenten.firstname === "Justin") {
    modal.querySelector(".student_picture").src = "images/fletchley_j.png";
  }
  if (studenten.lastname === "-unknown-") {
    modal.querySelector(".student_picture").src = "images/unknown.png";
  }

  modal.querySelector(".student_picture").alt = `Picture of ${
    studenten.fullname
  }`;

  modal.querySelector(".firstname").innerHTML =
    "<span class='heavy'>Firstname: </span>" + studenten.firstname;
  modal.querySelector(".lastname").innerHTML =
    "<span class='heavy'>Lastname:  </span>" + studenten.lastname;
  modal.querySelector(".bloodstatus").innerHTML =
    "<span class='heavy'>Bloodstatus: </span>" + studenten.bloodstatus;

  modal.querySelector(".crest").src = "images/" + studenten.house + ".png";
  modal.querySelector(".crest").alt =
    "Picture of " + studenten.house + "s crest.";

  modal.querySelector(".inquisitorial_button").dataset.id = studenten.id;

  showInquisitorialStatus(studenten);
}

function showInquisitorialStatus(studenten) {
  if (studenten.inquisitorialsquad === "Yes") {
    document.querySelector(".inquisitorial_button").style.backgroundColor =
      "rgba(150, 30, 30, 0.856)";
    document.querySelector(".inquisitorial_button").innerHTML =
      "Remove from inquisitorial squad";
    document.querySelector(".inquisitorial_button").dataset.action =
      "remove_inquisitorial";
  } else {
    document.querySelector(".inquisitorial_button").style.backgroundColor =
      "white";
    document.querySelector(".inquisitorial_button").innerHTML =
      "Add to inquisitorial squad";
    document.querySelector(".inquisitorial_button").dataset.action =
      "add_inquisitorial";
  }
}

function hideModal() {
  console.log("hideModal");

  document.querySelector(".modal").classList.remove("show");
  document.querySelector("body").classList.remove("modal_open");
  document.querySelector(".modal_content").classList.remove(houseColor);

  document.querySelector(".modal").dataset.status = "modal_is_closed";
}

function clickedInquisitorial(event, action) {
  const uniqueId = event.target.dataset.id;
  const clickedStudent = studentlist.find(obj => obj.id === uniqueId);

  if (action === "add_inquisitorial") {
    if (
      clickedStudent.bloodstatus === "pure-blood" ||
      clickedStudent.house === "Slytherin"
    ) {
      clickedStudent.inquisitorialsquad = "Yes";
      showModal(clickedStudent);
      filterList(houseFilter);

      // remove student from inquisitoraíal squad
      setTimeout(function() {
        clickedStudent.inquisitorialsquad = "-student inquisitorialsquad-";

        // TODO: Only update IF modal is still displayed for THIS student!!!
        if (
          document.querySelector(".modal").dataset.status === "modal_is_open"
        ) {
          showInquisitorialStatus(clickedStudent);
        }
      }, 7000);
    } else {
      showDenied();
    }
  }
  if (action === "remove_inquisitorial") {
    clickedStudent.inquisitorialsquad = "-student inquisitorialsquad-";
    showModal(clickedStudent);
    filterList(houseFilter);
  }
}

function showDenied() {
  console.log("showDenied");
  document.querySelector(".denied_box").classList.add("show");
}

function hideDenied() {
  console.log("hideDenied");
  document.querySelector(".denied_box").classList.remove("show");
}

// creates a unique id
// copyed from https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
