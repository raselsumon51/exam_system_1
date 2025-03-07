const express = require('express');
const app = express();
const {connectToDB}  = require("../connection/db");
const { ObjectId } = require('mongodb');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Home route
exports.homeController = (req, res) => {
    res.render('home/registration', {
        layout: false,
    });
};



// Example usage in index route
exports.submitHomeForm = async (req, res) => {
    const db = await connectToDB(); // Get the db instance
    const {email, password} = req.body
    try {
        const collection = db.collection("user_auth"); 
        const user = await collection.findOne({ email }); 
        // console.log(user)

       if(!user){
            // Insert the entire req.body object
            await collection.insertOne({
                email,
                password,
                role:"student"
            });
            //  console.log('Form data inserted:', req.body);
             res.redirect("/login")
       }
       else{
        res.json({msg:"User already exists"});
       }

    } catch (err) {
        console.error('Error inerting data:', err);
        res.status(500).send("Error loading data.");
    }
};



// Home route
exports.loginController = (req, res) => {
    //console.log(req.session.userId==null)
    
    if(req.session.userId==null){
        res.render('home/login', {
          layout: false,
        });
    }
    else{
        res.redirect("/dashboard")
    }
    
};

// 

// Home route
exports.submitloginForm = async (req, res) => {
    try {
        const db = await connectToDB(); // Connect to the database
        const collection = db.collection('user_auth'); // Specify the collection
        
        // Get name and password from the request body
        const { email, password } = req.body;

        // Fetch the user document matching the provided name and password
        const user = await collection.findOne({ email, password }); // Find a single document
        req.session.email = email;
        req.session.userId = user._id;
        req.session.role = user.role;

        //console.log(user);
        // console.log(req.session);
        res.redirect("/dashboard");
       
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).send("Error fetching data.");
    }
};


exports.dashboardController = (req, res) => {
    user = req.session.userId
    email = req.session.email
   const role = req.session.role
    //console.log(req.session)
     if (user) {
            res.render('home/welcome', {
                layout: false,
                email,
                role
            });
        } else {
            res.status(404).send("User not found.");
    }
};



exports.logoutController = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Failed to log out");
        }
        res.redirect("/login"); // Redirect to the login page
      });
};


exports.addQuestionController = (req, res) => {
    res.render('home/addQuestion', {
        layout: false,
    });
};


// // Add Exam Route
// router.post("/add-exam", async (req, res) => {
    
//   });
  

exports.addExamController = async (req, res) => {
    const { subjectName, examName, numberOfQuestions } = req.body;
  
    try {
      const db = await connectToDB(); // Connect to the database
      const collection = db.collection("exams"); // Assuming a collection called "exams"
  
      // Prepare the document to insert
      const examDetails = {
        subjectName,
        examName,
        numberOfQuestions: parseInt(numberOfQuestions), // Ensure it's stored as a number
        createdAt: new Date(), // Optionally track when the exam was created
      };
  
      // Insert the exam details into the collection
      const result = await collection.insertOne(examDetails);
  
      // Redirect or send success message
      if (result.acknowledged) {
        res.redirect("/dashboard"); // Redirect to a success page after adding
      } else {
        res.status(500).send("Failed to save exam details.");
      }
  
    } catch (error) {
      console.error("Error inserting exam data:", error);
      res.status(500).send("Error saving exam details.");
    }
};


exports.getExamsController = async (req, res) => {
    try {
        const db = await connectToDB(); // Connect to the database
        const collection = db.collection("exams"); // Assuming a collection called "exams"
        const exams = await collection.find().toArray();
        res.render('home/exams', {
            layout: false,
            exams
        });    
    } catch (error) {
      console.error("Error fetching exams:", error);
      res.status(500).send("Error fetching exams.");
    }
  };


  exports.questionsController = async (req, res) => {
       const examId = req.params.examId;
        const numOfQuestions =  req.params.numOfQuestions
        res.render('home/questions', {
            layout: './layouts/admin',
            examId,
            numOfQuestions
        });    
  };

//   questionSubmitController
// exports.questionSubmitController = async (req, res) => {
  
  // const { examId, questions } = req.body; // Get the examId and questions from the form submission
  // const formattedExamId = new ObjectId(examId);


  // const formattedQuestions = questions.map((question) => {
  //   return {
  //     text: question.text,
  //     options: {
  //       a: question.option_a,
  //       b: question.option_b,
  //       c: question.option_c,
  //       d: question.option_d
  //     },
  //     correctAnswer: question.answer // The selected answer
  //   };
  // });

  // const db = await connectToDB(); 
  // // Save the examId and questions to MongoDB
  // db.collection('questions')
  //   .insertOne({ examId: formattedExamId, questions: formattedQuestions })
  //   .then((result) => {
  //     res.send('Questions have been saved successfully!');
  //   })
  //   .catch((err) => {
  //     console.error(err);
  //     res.status(500).send('An error occurred while saving the questions.');
  //   });
// };
exports.questionSubmitController = async (req, res) => {
  const { examId, questions } = req.body; // Get the examId and questions from the form submission
  const formattedExamId = new ObjectId(examId);

  const formattedQuestions = questions.map((question, index) => {
    return {
      number: index + 1, // Add question number, starting from 1
      text: question.text,
      options: {
        a: question.option_a,
        b: question.option_b,
        c: question.option_c,
        d: question.option_d
      },
      correctAnswer: question.answer // The selected answer(s)
    };
  });

  const db = await connectToDB(); 
  // Save the examId and questions to MongoDB
  db.collection('questions')
    .insertOne({ examId: formattedExamId, questions: formattedQuestions })
    .then((result) => {
      res.send('Questions have been saved successfully!');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('An error occurred while saving the questions.');
    });
};





// examOneController



exports.getQuestionController = async (req, res) => {
  try {
    const examId = req.params.examId;
    // const formattedExamId = new ObjectId(examId);
    const db = await connectToDB();
    const data = await db.collection('exams').aggregate([
      {
        $match: { _id: new ObjectId(examId) } // Match the specific exam ID
      },
      {
        $lookup: {
          from: 'questions',      // The collection to join (questions)
          localField: '_id',    // The field from 'exams' collection
          foreignField: 'examId',  // The field in 'questions' collection (examId)
          as: 'questions'          // Store the joined data in 'questions'
        }
      }
    ]).toArray();
    // console.log(data);

    res.render('home/examQuestion', {
      layout: false,
       data,
       examId 
    });
    
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).send('An error occurred while fetching data.');
  }
};




exports.deleteExamController = async (req, res) => {
  try {
    const examId = req.params.examId; 
    const db = await connectToDB(); 

    const result = await db.collection('exams').deleteOne({ _id: new ObjectId(examId) });
    await db.collection('questions').deleteOne({ _id: new ObjectId(examId) });
    await db.collection('results').deleteOne({ _id: new ObjectId(examId) });

    if (result.deletedCount === 0) {
      return res.status(404).send('Exam not found.');
    }

    res.redirect('/start-an-exam'); 
  } catch (err) {
    console.error('Error deleting exam:', err);
    res.status(500).send('An error occurred while deleting the exam.');
  }
};







// 
exports.submitAnsController = async (req, res) => {
  try {
    const db = await connectToDB();
    const { examId, ...answers } = req.body;

    // console.log(req.session.userId)
    const userAnswers = Object.keys(answers).map(key => {
      const [questionSetIndex, questionIndex] = key.split('_').slice(1, 3);
      return {
        questionId: questionIndex,
        selectedAnswer: answers[key]
      };
    });

    const formattedExamId = new ObjectId(examId);

    // Insert answers into the MongoDB collection
    const answersCollection = db.collection('user_answers');
    await answersCollection.insertOne({
      formattedExamId,
      userAnswers,
      submittedAt: new Date()
    });

    // Redirect to a thank you page
    res.redirect(`/result?examId=${examId}`);
  } catch (error) {
    console.error('Error saving answers:', error);
    res.status(500).send('Error saving answers.');
  }
};


// // startAnExamController
// exports.startAnExamController = async (req, res) => {

//   const db = await connectToDB(); // Connect to the database
//   const collection = db.collection("exams"); // Assuming a collection called "exams"
//   const exams = await collection.find().toArray();   
// // examList
// res.render('home/examList', {
//   layout: './layouts/admin',
//   exams
// });

// };
// startAnExamController
exports.startAnExamController = async (req, res) => {
  try {
    const db = await connectToDB(); // Connect to the database
    // console.log(db);
    const collection = db.collection("exams"); // Access the "exams" collection
    const exams = await collection.find().toArray(); // Retrieve all exams

    // Render the exam list page
    res.render('home/examList', {
      layout: false,
      exams
    });

  } catch (error) {
    console.error("Error fetching exams:", error);
    res.status(500).send("Failed to load exams.");
  }
};


// resultController
exports.resultController = async (req, res) => {
    const userId  = req.session.userId;
    const examId = req.query.examId;
    const formattedUserId = new ObjectId(userId);
    const formattedExamId = new ObjectId(examId);
    const db = await connectToDB();
    const results = await db.collection('questions').aggregate([
    {
      $match: { examId: formattedExamId }  // Match the specific examId in questions collection
    },
    {
      $lookup: {
        from: 'user_answers',             // Join with the 'user_answers' collection
        localField: 'examId',              // Match on the examId in questions collection
        foreignField: 'formattedExamId',            // Match on the examId in user_answers collection
        as: 'userAnswers'                 // Store the result in 'userAnswers' array
      }
    }
  ]).toArray();
  // console.log(results)

let score  = 0;
  results.forEach(result => {
        result.questions.forEach(question => {
            result.userAnswers.forEach(userAnswer => {
                userAnswer.userAnswers.forEach(answer=>{
                if(question.number-1 == answer.questionId && question.correctAnswer==answer.selectedAnswer){
                  //  console.log(`${question.correctAnswer} : ${answer.selectedAnswer}`)
                  score = score +1;
                }
                })
          });
        })
  });

  // console.log(score);

    // Save the result in the 'results' collection
  const resultData = {
      userId: formattedUserId,
      examId: formattedExamId,
      score: score
  };

  await db.collection('results').insertOne(resultData);
  const result = await db.collection('user_answers').deleteMany({});

  res.render('home/result', {
    layout:false,
    score: score,
    examId: examId,
    userId: userId
  });

  // res.send(`
  //   <div class="container mx-auto mt-10 px-6 py-8 bg-white rounded-lg shadow-lg text-center">
  //     <h2 class="text-2xl font-semibold text-gray-800 mb-6">Exam Result</h2>
  //     <p class="text-lg text-gray-700 mb-4">
  //       Correctly answered: <span class="font-semibold text-green-600">${score}</span> questions.
  //     </p>
  //     <div class="mt-6">
  //       <a href="/correct-answer/${examId}" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-500 mb-4">
  //         Go to the results page
  //       </a>
  //       <br />
  //       <a href="/all-marks/${examId}/${userId}" class="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-indigo-500">
  //         Go to the marks page
  //       </a>
  //     </div>
  //   </div>
  // `);
  
  
  // console.log(`${result.deletedCount} documents were deleted from user_answers.`);
};
// resultController
// exports.resultController = async (req, res) => {
//   const userId  = req.session.userId;
//   const examId = req.query.examId;
//   const formattedExamId = new ObjectId(examId);
//   const db = await connectToDB();
//   const results = await db.collection('questions').aggregate([
//       {
//           $match: { examId: formattedExamId }  // Match the specific examId in questions collection
//       },
//       {
//           $lookup: {
//               from: 'user_answers',             // Join with the 'user_answers' collection
//               localField: 'examId',              // Match on the examId in questions collection
//               foreignField: 'formattedExamId',   // Match on the examId in user_answers collection
//               as: 'userAnswers'                 // Store the result in 'userAnswers' array
//           }
//       }
//   ]).toArray();

//   let score = 0;
//   results.forEach(result => {
//       result.questions.forEach(question => {
//           result.userAnswers.forEach(userAnswer => {
//               userAnswer.userAnswers.forEach(answer => {
//                   if (question.number - 1 === answer.questionId && question.correctAnswer === answer.selectedAnswer) {
//                       score += 1;
//                   }
//               });
//           });
//       });
//   });

//   // Save the result in the 'results' collection
//   const resultData = {
//       userId: userId,
//       examId: formattedExamId,
//       score: score
//   };

//   await db.collection('results').insertOne(resultData);

//   // Clear user answers for the next test (optional step, as per your current logic)
//   // const deletionResult = await db.collection('user_answers').deleteMany({});

//   res.send(`
//       Correctly answered: ${score} questions.<br>
//       <a href="/correct-answer/${examId}">Go to the results page</a>
//   `);

//   // console.log(`${deletionResult.deletedCount} documents were deleted from user_answers.`);
// };


// correctAnswerController

exports.correctAnswerController = async (req, res) => {
      try {
        const examId = req.params.examId;
        // const formattedExamId = new ObjectId(examId);
        const userid = req.session.userId;
        console.log(userid)
        const db = await connectToDB();
        const data = await db.collection('exams').aggregate([
          {
            $match: { _id: new ObjectId(examId) } // Match the specific exam ID
          },
          {
            $lookup: {
              from: 'questions',      // The collection to join (questions)
              localField: '_id',    // The field from 'exams' collection
              foreignField: 'examId',  // The field in 'questions' collection (examId)
              as: 'questions'          // Store the joined data in 'questions'
            }
          }
        ]).toArray();
        // console.log(data);


        res.render('home/correctAnswer', {
          layout: false,
          data,
          examId 
        });
        
      } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('An error occurred while fetching data.');
      }
};

// addOnequestionController

exports.addOnequestionController = async (req, res) => {
  const examId = req.params.examId;
  res.render('home/addOneQuestion', {
      layout: './layouts/admin',
      examId,
  }); 
}



// Route to handle form submission
exports.submitOnequestionController = async (req, res) => {

  try {
      const { examId, question1, option_a_1, option_b_1, option_c_1, option_d_1, correct_answer_1 } = req.body;

    // Connect to the database
    const db = await connectToDB();
    const examCollection = db.collection('questions');
    const examCollec= db.collection('exams');


    // Fetch the exam document to get the current list of questions
    const exam = await examCollection.findOne({ examId: new ObjectId(examId) });

    if (!exam) {
      return res.status(404).send('Exam not found');
    }

    // Determine the next question number (based on the current number of questions)
    const nextQuestionNumber = exam.questions.length + 1;

    // Update the `numberOfQuestions` field in the exam document
    await examCollec.updateOne(
      { _id: new ObjectId(examId) },
      {
        $set: { numberOfQuestions: nextQuestionNumber }
      }
    );

    // console.log(`Number of questions updated to: ${nextQuestionNumber}`);

    // Prepare the new question to be added
    const newQuestion = {
      number: nextQuestionNumber,  // Dynamically set the question number
      text: question1,
      options: {
        a: option_a_1,
        b: option_b_1,
        c: option_c_1,
        d: option_d_1,
      },
      correctAnswer: correct_answer_1,  // The correct option selected by the user
    };

    // Add the new question to the questions array
    const updateResult = await examCollection.updateOne(
      { examId: new ObjectId(examId) },  // Find the exam by its ID
      {
        $push: { questions: newQuestion }  // Push the new question to the questions array
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(500).send('Failed to update exam with new question');
    }

    // Respond with success
    res.send('Question added successfully!');
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).send('Failed to add question.');
  }
};


// allMarksController/

// exports.allMarksController = async (req, res) => {
//   const { examId, userId } = req.params;
//   try {
//     const db = await connectToDB();
//     console.log("hi")
  
//     const data = await db.collection('results').aggregate([
//       {
//         $lookup: {
//           from: 'user_auth',               // Join with the 'users' collection
//           localField: 'userId',        // Field in 'results' collection
//           foreignField: '_id',         // Field in 'users' collection
//           as: 'userDetails'            // Store joined data in 'userDetails'
//         }
//       },
//       {
//         $lookup: {
//           from: 'exams',               // Join with the 'exams' collection
//           localField: 'examId',        // Field in 'results' collection
//           foreignField: '_id',         // Field in 'exams' collection
//           as: 'examDetails'            // Store joined data in 'examDetails'
//         }
//       }
//     ]).toArray();
  
//     console.log(data); // Inspect the joined data
//     res.send(data); // Or render it in your view as needed
//   } catch (err) {
//     console.error('Error fetching data:', err);
//     res.status(500).send('An error occurred while fetching data.');
//   }
  

// }

exports.allMarksController = async (req, res) => {
  const { examId, userId } = req.params;
  try {
    const db = await connectToDB();

    const data = await db.collection('results').aggregate([
      {
        $match: {
          examId: new ObjectId(examId),   // Match the provided examId
          userId: new ObjectId(userId)    // Match the provided userId
        }
      },
      {
        $lookup: {
          from: 'user_auth',               // Join with the 'user_auth' collection
          localField: 'userId',            // Field in 'results' collection
          foreignField: '_id',             // Field in 'user_auth' collection
          as: 'userDetails'                // Store joined data in 'userDetails'
        }
      },
      {
        $lookup: {
          from: 'exams',                   // Join with the 'exams' collection
          localField: 'examId',            // Field in 'results' collection
          foreignField: '_id',             // Field in 'exams' collection
          as: 'examDetails'                // Store joined data in 'examDetails'
        }
      },
      {
        $sort: { _id: -1 }                 // Sort by _id in descending order to get the last inserted document
      },
      {
        $limit: 1                          // Limit to the last document only
      }
    ]).toArray();

    // res.render('allMarks', { result: data[0] });
    // console.log(data.length)

    if(data.length==0){
      res.render('home/examNotGiven', {
        layout: './layouts/admin',
        result: "You are not given the exam"
    });
    }else{
      res.render('home/allMarks', {
        layout: './layouts/admin',
        result: data[0]
    });
  }

    

    // console.log(data); // Inspect the joined data
    // res.send(data); // Or render it in your view as needed
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).send('An error occurred while fetching data.');
  }
}



// subjectWiseMarksController

exports.subjectWiseMarksController = async (req, res) => {
  try {
    const db = await connectToDB();
    const userId =  req.session.userId;

    const exams = await db.collection('exams').find({}).toArray();

    res.render('home/subjectWiseMarks', { 
      exams, 
      layout: false,
      userId 
    }); // Pass exams data to the EJS view
  } catch (err) {
    console.error('Error fetching exams:', err);
    res.status(500).send('An error occurred while fetching exams.');
  }
}

//make getExcelFormController
exports.getExcelFormController = async (req, res) => {
  // /excel/:examId/
  // console.log("hi");
  const examId = req.params.examId;

  res.render('home/excelForm', {
    layout: './layouts/admin',
    examId 
  });
};





exports.postExcelFormController = async (req, res) => {
    try {
        // Check if a file was uploaded
        if (!req.files || !req.files.excel) {
            return res.status(400).send('No file uploaded.');
        }

        const examId = req.params.examId;  // Get examId from URL parameter
        const file = req.files.excel;  // Get the uploaded file
        const uploadDir = path.join(__dirname, '../uploads'); // Ensure uploads directory
        const filePath = path.join(uploadDir, file.name); // Define full file path

        // Ensure the uploads directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Move the file to the uploads directory
        await new Promise((resolve, reject) => {
            file.mv(filePath, (err) => {
                if (err) {
                    console.error('Error saving file:', err);
                    return reject('Error saving file.');
                }
                resolve();
            });
        });

        // Read the Excel file
        const workbook = xlsx.readFile(filePath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(worksheet);

        const formattedExamId = new ObjectId(examId);

        const formattedQuestions = data.map((item, index) => {
            return {
                number: index + 1, // Add question number, starting from 1
                text: item.Question, // Get the question text
                options: {
                    a: item.Option_A,
                    b: item.Option_B,
                    c: item.Option_C,
                    d: item.Option_D
                },
                correctAnswer: item.Answer // The selected answer(s)
            };
        });

        const db = await connectToDB(); 

        // Save the examId and formatted questions to MongoDB
        const result = await db.collection('questions')
            .insertOne({ examId: formattedExamId, questions: formattedQuestions });

          res.redirect('/dashboard'); // Redirect to the exam list page
        // res.status(200).json({
        //     message: 'Questions have been saved successfully!',
        //     result: result
        // });

    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal server error.');
    }
};
