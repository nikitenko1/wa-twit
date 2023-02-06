require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const adminRoute = require('./routers/admin');
const authRoute = require('./routers/auth');
const commentRoute = require('./routers/comment');
const likeRoute = require('./routers/like');
const notificationRoute = require('./routers/notification');
const postRoute = require('./routers/post');
const retweetRoute = require('./routers/retweet');
const tagRoute = require('./routers/tag');
const userRoute = require('./routers/user');

const connectDb = require('./libs/connectDb');
connectDb();

const app = express();
app.use(express.json({ limit: '4mb', type: 'application/json' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
  })
);

app.use('/api', authRoute);
app.use('/api', postRoute);
app.use('/api', tagRoute);
app.use('/api', userRoute);
app.use('/api', notificationRoute);
app.use('/api', commentRoute);
app.use('/api', likeRoute);
app.use('/api', retweetRoute);
app.use('/api', adminRoute);

app.listen(process.env.PORT, () =>
  console.log(`Server is running on port ${process.env.PORT}`)
);
