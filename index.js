const express = require("express");
const firebase = require("firebase");
const cors = require("cors");

var firebaseConfig = {
    apiKey: "AIzaSyA572iAGXuYzK5Nuca3lazd-3rvuepElVg",
    authDomain: "seneca-project-management-tool.firebaseapp.com",
    databaseURL:
        "https://seneca-project-management-tool-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "seneca-project-management-tool",
    storageBucket: "seneca-project-management-tool.appspot.com",
    messagingSenderId: "167806167502",
    appId: "1:167806167502:web:580f2ff20b144a32eb639f",
    measurementId: "G-YP7GTHWS42",
};
firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const app = express();
const port = 3000;
app.use(express.json());

let activeGroup = null;
// let activeUser = null
const JKT_OFFSET = "+7";

var allowedOrigins = ["http://localhost:3000", "http://localhost:8080"];
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                var msg =
                    "The CORS policy for this site does not " +
                    "allow access from the specified Origin.";
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        },
    })
);

function getTimeBaseOffset(locOffset) {
    var d = new Date();
    var utc = d.getTime() + d.getTimezoneOffset() * 60000;
    return new Date(utc + 3600000 * locOffset);
}

app.post("/create-phase-notification", (req, res) => {
    let data = req.body;

    let currentDate = getTimeBaseOffset(JKT_OFFSET);
    let currDay = currentDate.getDate();
    let currMonth = currentDate.getMonth();
    let currYear = currentDate.getFullYear();

    database
        .ref(`Subjects/${data.ClassTransactionId}/Groups/${data.GroupNumber}/Phases/${data.PhaseIdx}/`).get()
        .then((s) => {

            let phase = [];
            phase = s.val();

            let phaseDueDate = new Date(phase.DueDate);
            let day = phaseDueDate.getDate();
            let month = phaseDueDate.getMonth();
            let year = phaseDueDate.getFullYear();

            if (currDay == day && currMonth == month && currYear == year) {
                let students = {};
                data.Students.forEach((s) => {
                    students[s.StudentNumber] = false;
                });
                if (phase.Name == "Backlog") {
                    let notifId = database
                        .ref(`Notifications/${data.ClassTransactionId}/${data.GroupNumber}/`)
                        .push().key;
                    database
                        .ref(`Notifications/${data.ClassTransactionId}/${data.GroupNumber}/${notifId}/`)
                        .set({
                            text: `Today is ${data.Subject}'s ${phase.Name} due date 🔥`,
                            isViewed: students,
                        }).then(() => {
                            res.sendStatus(200);
                        });
                } else {
                    let notifId = database
                        .ref(`Notifications/${data.ClassTransactionId}/${data.GroupNumber}/`)
                        .push().key;
                    database
                        .ref(`Notifications/${data.ClassTransactionId}/${data.GroupNumber}/${notifId}/`)
                        .set({
                            text: `Today is ${data.Subject}'s ${phase.Name} due date 🔥\n go to discussion page for Sprint review and retrospective with your group!`,
                            isViewed: students,
                        }).then(() => {
                            res.sendStatus(200);
                        });
                }
            }
        });

});

app.post("/create-task-notification", (req, res) => {
    let data = req.body;

    let currentDate = getTimeBaseOffset(JKT_OFFSET);
    let currDay = currentDate.getDate();
    let currMonth = currentDate.getMonth();
    let currYear = currentDate.getFullYear();

    if (data.TaskIdx == -1) data.TaskIdx = 0


    database
        .ref(`Subjects/${data.ClassTransactionId}/Groups/${data.GroupNumber}/Phases/${data.PhaseIdx}/Categories/${data.CategoryIdx}/Tasks/${data.TaskIdx}/`).get()
        .then((s) => {
            if (!s.exists()) return

            let task = s.val();

            let taskDueDate = new Date(task.DueDate);
            let day = taskDueDate.getDate();
            let month = taskDueDate.getMonth();
            let year = taskDueDate.getFullYear();

            if (currDay == day && currMonth == month && currYear == year) {
                let students = {};
                data.Students.forEach((s) => {
                    students[s.StudentNumber] = false;
                });

                let notifId = database
                    .ref(`Notifications/${data.ClassTransactionId}/${data.GroupNumber}/`)
                    .push().key;
                database
                    .ref(`Notifications/${data.ClassTransactionId}/${data.GroupNumber}/${notifId}/`)
                    .set({
                        text: `Today is ${task.Name}'s due date 🔥`,
                        isViewed: students,
                    }).then(() => {
                        res.sendStatus(200);
                    });

            }

        })

})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);

    //   database.ref("Subjects/").on("value", (s) => {
    // console.log(s.val());
    //   });

    //   setInterval(() => {
    //     let date = getTimeBaseOffset(JKT_OFFSET);
    //     let day = date.getDate();
    //     let month = date.getMonth() + 1;
    //     let year = date.getFullYear();
    //     let hour = date.getHours()
    //     let minute = date.getMinutes()
    //     let seconds = date.getSeconds()
    //     console.log(`${hour}:${minute}:${seconds}`);
    //   }, 1000);

    //   if(activeGroup){
    //     console.log("course active")
    //     database.ref(`Subjects/${activeGroup.subject.ClassTransactionId}/Groups/${activeGroup.group.Group.GroupNumber}/Phases/`).on("value", (s) => {
    //         console.log("VALUE CHANGED")
    //         console.log(s.val());
    //     });
    //   }

});