const { MongoClient } = require("mongodb");

const DATABASE_URL = "mongodb+srv://raselsumon51:enPAmPa3oRxTsOCW@cluster0.nngte0p.mongodb.net/attendance?retryWrites=true&w=majority"; // Replace with your actual MongoDB URL
const DATABASE_NAME = "exam_system"; // Your database name
let dbInstance = null;

async function connectToDB() {
  if (dbInstance) {
    return dbInstance; // Return existing instance if already connected
  }

  try {
    client = new MongoClient(DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    await client.connect();
    console.log("MongoDB Connected");

    dbInstance = client.db(DATABASE_NAME); // Store the connected db instance
    return dbInstance;
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    throw error;
  }
}



// Export connectToDB and client
module.exports = { connectToDB };
