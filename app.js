const express=require("express")
const app=express();
const errorMiddleware=require("./middleware/error");
const cookieParser=require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const dotenv=require("dotenv");

//To solve this problem, URL-encoded data is used. It replaces special characters with a percent sign followed by two hexadecimal digits. For example, a space is represented as "%20" and a question mark as "%3F". This encoding ensures that the URL remains valid and can be properly understood by web servers and browsers.

// const path=require("path")
dotenv.config({ path: "backend/config/config.env" });
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// If you are using body-parser, use the following instead
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// app.use(express.json());
app.use(cookieParser());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());


const product=require("./routes/productRoute");
const user=require("./routes/userRoute");
const order=require("./routes/orderRoute");
const  payment=require("./routes/paymentRoute");

app.use("/api/v1",product);
app.use("/api/v1",user);
app.use("/api/v1",order);
app.use("/api/v1",payment);
app.use(errorMiddleware);

// app.use(express.static(path.join(__dirname, "../frontend/build")));

// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
// });

module.exports=app//app bana k expor kiya