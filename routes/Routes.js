const express = require('express');
const app = express();
const router = express.Router();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.set('view engine', 'ejs');
const {getAnswers, getLeaderboard,getAllSubjects, getPracticeQuestions, getSingleSubject,uniqueSubjects, postExcelFormController,getExcelFormController, deleteExamController,subjectWiseMarksController, allMarksController, submitOnequestionController, addOnequestionController,correctAnswerController,resultController,startAnExamController, submitAnsController,getQuestionController, homeController, submitHomeForm , loginController, submitloginForm, dashboardController,logoutController, addQuestionController, addExamController,getExamsController, questionsController,questionSubmitController} = require('../controllers/Controller');


const isAuthenticated = (req, res, next) => {
   if (req.session && req.session.userId && (req.session.role=="user" || req.session.role=="admin")) {
      // console.log(req.session.role=="user")
     return next(); // User is authenticated, proceed to the next middleware/route
   } else {
     res.redirect('/login'); // Redirect to the login page if not logged in
   }
 };

 const ensureAdminLogin = (req, res, next) => {
   if (req.session && req.session.userId && req.session.role=="admin") {
     return next(); // User is authenticated, proceed to the next middleware/route
   } else {
     res.redirect('/login'); // Redirect to the login page if not logged in
   }
 };



router.route('/signup')
   .get(homeController)
   .post(submitHomeForm)


router.route('/login')
   .get(loginController)
   .post(submitloginForm)

router.route('/dashboard')
   .get(ensureAdminLogin ,dashboardController)

// all subjects route
router.get("/subjects", getAllSubjects);


// leader board route
router.get("/leader-board", getLeaderboard);

// Logout route
router.get("/logout",logoutController);

router.get("/add-exam", ensureAdminLogin ,addQuestionController);
router.post("/add-exam",ensureAdminLogin, addExamController);

router.get("/exams",ensureAdminLogin, getExamsController)
router.get("/exam/:examId/:numOfQuestions", ensureAdminLogin, questionsController);
router.get("/exam/:examId",ensureAdminLogin, addOnequestionController);
router.post("/exam/:examId",ensureAdminLogin,  submitOnequestionController);
// submitOnequestionController
router.post("/question-submit",ensureAdminLogin, questionSubmitController);
// /exam-1



// router.get("/exam-1",examOneController);
router.post("/submit-answers", submitAnsController);
router.get("/result", resultController);
router.get("/all-marks/:examId/:userId", isAuthenticated, allMarksController);
router.get("/subject-wise-marks", isAuthenticated, subjectWiseMarksController);
// /all-answer/${examId}/${userId}

//Exam List Page Route 
router.get("/start-an-exam",  startAnExamController);
router.get("/exam-started/:examId", getQuestionController);   // home/examQuestions
router.post("/exam/delete/:examId", ensureAdminLogin, deleteExamController);


// add  exam/67b4f554e5c0caa3812a7a80/excel route
router.get("/excel/:examId/", getExcelFormController);
//post
router.post("/excel/:examId/", postExcelFormController);

router.get("/", uniqueSubjects);
router.get("/subject/:subjectName", getSingleSubject);
router.get("/practice-exam/:examId", getPracticeQuestions);
// question-answers/:examId
router.get("/question-answers/:examId", getAnswers);
router.get("/correct-answer/:examId", correctAnswerController);

module.exports = router;



