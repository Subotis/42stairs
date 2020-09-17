const conn: any = {
    uri: process.env.MONGODB_URI,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
};

if (process.env.MONGODB_USERNAME && process.env.MONGODB_PASSWORD && process.env.MONGODB_PASSWORD !== 'false') {
    conn.auth = {
        user: process.env.MONGODB_USERNAME,
        password: process.env.MONGODB_PASSWORD,
    };
}

module.exports = conn;
