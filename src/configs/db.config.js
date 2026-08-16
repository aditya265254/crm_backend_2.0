
const dbName = process.env.DB_NAME || "crm_db";

module.exports = {
    DB_NAME: dbName,
    DB_URL: process.env.MONGO_URI || `mongodb://localhost:27017/${this.DB_NAME}`
};
