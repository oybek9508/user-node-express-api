import mongoose from 'mongoose';

mongoose
    .connect('mongodb://localhost:27017', { dbName: 'node_auth' })
    .then(() => {
        console.log('mongo db connected');
    })
    .catch((err) => {
        console.log(err.message);
    });

mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to database');
});

mongoose.connection.on('error', (err) => {
    console.log(err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose is disconnected');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});
