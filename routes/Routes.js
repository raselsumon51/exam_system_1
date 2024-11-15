const express = require('express');
const app = express();
const router = express.Router();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.set('view engine', 'ejs');
const {subjectWiseMarksController, allMarksController, submitOnequestionController, addOnequestionController,correctAnswerController,resultController,startAnExamController, submitAnsController,getQuestionController, homeController, submitHomeForm , loginController, submitloginForm, dashboardController,logoutController, addQuestionController, addExamController,getExamsController, questionsController,questionSubmitController} = require('../controllers/Controller');

router.route('/')
   .get(homeController)
   .post(submitHomeForm)


router.route('/login')
   .get(loginController)
   .post(submitloginForm)


   // Middleware to check authentication
   // Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
   if (req.session && req.session.userId) {
      // console.log(req.session.role=="user")
     return next(); // User is authenticated, proceed to the next middleware/route
   } else {
     res.redirect('/login'); // Redirect to the login page if not logged in
   }
 };

 const ensureAdminLogin = (req, res, next) => {
   if (req.session && req.session.userId && req.session.role=="user") {
     return next(); // User is authenticated, proceed to the next middleware/route
   } else {
     res.redirect('/login'); // Redirect to the login page if not logged in
   }
 };
// const isAuthenticated = (req, res, next) => {
//    // if (req.session.userId) {
//        next();
//    // } else {
//    //     res.status(403).send('Unauthorized access');
//    // }
// };

router.route('/dashboard')
   .get(isAuthenticated, dashboardController)


// Logout route
router.get("/logout",logoutController);
router.get("/add-question",ensureAdminLogin, addQuestionController);
router.post("/add-exam",addExamController);
router.get("/exams",ensureAdminLogin, getExamsController);
router.get("/exam/:examId/:numOfQuestions",questionsController);
router.get("/exam/:examId",isAuthenticated, addOnequestionController);
router.post("/exam/:examId",isAuthenticated,  submitOnequestionController);
// submitOnequestionController
router.post("/question-submit",isAuthenticated, questionSubmitController);
// /exam-1

// router.get("/exam-1",examOneController);
router.post("/submit-answers",isAuthenticated, submitAnsController);
router.get("/result",isAuthenticated, resultController);
router.get("/all-marks/:examId/:userId", isAuthenticated, allMarksController);
router.get("/subject-wise-marks", isAuthenticated, subjectWiseMarksController);
// /all-answer/${examId}/${userId}

router.get("/start-an-exam", isAuthenticated, startAnExamController);
router.get("/exam-started/:examId", isAuthenticated, getQuestionController);

router.get("/correct-answer/:examId",isAuthenticated, correctAnswerController);

module.exports = router;



