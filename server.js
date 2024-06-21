import detailedTypeRoute from './routes/detailedType.routes.js'
import notificationsRoute from "./routes/notificationsRoute.js"
import errorHandler from './middleware/error-handler.js';
import locationsRoute from "./routes/locationsRoute.js";
import districtRoute from "./routes/district.routes.js";
import provinceRoute from './routes/provinceRoute.js';
import detailsRoute from "./routes/details.routes.js";
import estatesRoute from "./routes/estatesRoute.js"
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import typeRoute from './routes/typeRoute.js';
import connect from './config/dbConfig.js';
import Estate from './models/estate.js';
import express from 'express';
import cron from 'node-cron';
import dotenv from 'dotenv';
import cors from 'cors';


dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors('*'));
const port = process.env.PORT || 5000,
    host = process.env.HOST || 'localhost';

//routes ways
app.use('/auth', authRoute);
app.use('/users', userRoute);
app.use('/api/types', typeRoute);
app.use("/api/estates", estatesRoute);
app.use('/api/details', detailsRoute);
app.use('/api/district', districtRoute);
app.use('/api/provinces', provinceRoute);
app.use('/api/locations', locationsRoute);
app.use('/api/detailedType', detailedTypeRoute);
app.use('/api/notifications', notificationsRoute);

//errror handler
app.use(errorHandler);

const deleteEstate = async (id) => {
    await Estate.findByIdAndDelete(id);
}

const corsFunc =  async () => {
    const estates = await Estate.find().populate("seller");
    estates.forEach(estate => {
        // console.log(estate);
        if (!estate.seller) {
            console.log("Ad owner not found");
            deleteEstate(estate._id);
        }
    });
    console.log("Estates checked");
}

cron.schedule("* * * * *", () => {
    corsFunc();
});

//server connection
app.listen(port, () => {
    connect();
    console.log(`Server running on http://${host}:${port}`);
});
