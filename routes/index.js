const express = require("express");
const router = express.Router();
const User = require("../models/user");
const mongoose = require("mongoose");
const crypto = require("crypto");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const axios = require("axios");

// 로그인에 성공할 시 serializeUser 메서드를 통하여 사용자 정보를 세션에 저장
passport.serializeUser((user, done) => {
  done(null, user);
});

// 사용자 인증 요청이 있을 떄마다 호출
passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true, //request callback 여부
    },
    function (req, email, password, done) {
      User.findOne(
        {
          email: email,
          password: crypto
            .createHash("sha512")
            .update(password)
            .digest("base64"),
        },
        function (err, user) {
          if (err) {
            throw err;
          } else if (!user) {
            return done(
              null,
              false,
              req.flash("login_message", "이메일 또는 비밀번호를 확인하세요.")
            ); // 로그인 실패
          } else {
            return done(null, user); // 로그인 성공
          }
        }
      );
    }
  )
);

router.get("/", function (req, res) {
  res.render("index", { user: req.user });
});
router.get("/login", (req, res) =>
  res.render("login", { message: req.flash("login_message") })
);
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }), // 인증 실패 시 '/login'으로 이동
  function (req, res) {
    // 로그인 성공 시 창을 끄고 post 응답을 보냄
    res.redirect("/success");
  }
);
router.get("/success", (req, res) => res.send(req.user));
router.get("/signup", (req, res) => res.render("signup", { page: "signup" }));
router.post("/signup", (req, res, next) => {
  console.log(req.body);
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        res.send(
          '<script type="text/javascript">alert("이미 존재하는 이메일입니다."); window.location="/signup"; </script>'
        );
      } else {
        const user = new User({
          _id: new mongoose.Types.ObjectId(),
          name: req.body.name,
          email: req.body.email,
          password: crypto
            .createHash("sha512")
            .update(req.body.password)
            .digest("base64"),
        });
        user
          .save()
          .then((result) => {
            console.log(result);
            res.redirect("/");
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
});
router.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/"); //로그아웃 후 '/'로 이동
});

module.exports = router;
