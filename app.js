const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// routes
const indexRoute = require("./routes/index");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Session = require("express-session");
const flash = require("connect-flash");
var MongoDBStore = require("connect-mongodb-session")(Session);
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
// 뷰엔진 설정
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// cors 설정
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/";

// 세션
const store = new MongoDBStore({
  uri: url, // db url
  collection: "sessions", //콜렉션 이름
});

store.on("error", function (error) {
  console.log(error);
});

app.use(flash());

app.use(
  Session({
    secret: "dotslab", // 세션 암호화 key
    resave: false, // 세션 재저장 여부
    saveUninitialized: true,
    rolling: true, // 로그인 상태에서 페이지 이동 시마다 세션값 변경 여부
    cookie: { maxAge: 1000 * 60 * 60 }, // 유효시간
    store: store,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// use routes
app.use("/", indexRoute);
mongoose.connect(url, { useNewUrlParser: true });

//listen
app.listen(PORT, function () {
  console.log("Example app listening on port", PORT);
});
