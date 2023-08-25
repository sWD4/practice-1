const UserModel = require("../models/User");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const CourseModel = require("../models/Course");
const nodemailer = require('nodemailer');

cloudinary.config({
  cloud_name: "dkopmzxkx",
  api_key: "479638242997363",
  api_secret: "qZ0-JJDHAtSSzeFZ6GANdN2YNdQ",
});

class FrontController {
  
  static login =(req, res) => {
    res.render("login", {
      message: req.flash("success"),
      error: req.flash("error"),
    });
  };

  static registration = async (req, res) => {
    try {
      res.render("registration", { message: req.flash("error") });
    } catch (error) {
      console.log(error);
    }
  };

  static insert = async (req, res) => {
    // console.log(req.files.image)
    const file = req.files.image;
    const imageUpload = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "studentimage",
    });
    // console.log(imageUpload)

    try {
      const { name, email, password, cpassword } = req.body;
      const user = await UserModel.findOne({ email: email });
      // console.log(user)
      if (user) {
        req.flash("error", "Email already exist");
        // res.redirect("/registration");
      } else {
        if (name && email && password && cpassword) {
          if (password == cpassword) {
            try {
              const hashpassword = await bcrypt.hash(password, 10);
              const result = new UserModel({
                name: name,
                email: email,
                password: hashpassword,
                image: {
                  public_id: imageUpload.public_id,
                  url: imageUpload.secure_url,
                },
              });
              await result.save();
              this.sendEmail(name,email)
              req.flash("success", "Registration Succesfully please login !");
              res.redirect("/"); //path is given
            } catch (error) {
              console.log(error);
            }
          } else {
            req.flash("error", "Password and Confirm password does not match");
            res.redirect("/registration");
          }
        } else {
          req.flash("error", "All field are requiered");
          res.redirect("/registration");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  static verify_login = async (req, res) => {
    try {
      // console.log(req.body)
      const { email, password } = req.body;
      if (email && password) {
        const user = await UserModel.findOne({ email: email });
        if (user != null) {
          const ismatch = await bcrypt.compare(password, user.password);
          if (ismatch) {
            // multiple login
            if (user.role == "student") {
              //generate token
              const token = jwt.sign(
                { ID: user._id },
                "secretkey123#btech@mits$6"
              );
              // console.log(token)
              res.cookie("token", token);
              res.redirect("/dashboard");
            }
            if (user.role == "admin") {
              //generate token
              const token = jwt.sign(
                { ID: user._id },
                "secretkey123#btech@mits$6"
              );
              // console.log(token)
              res.cookie("token", token);
              res.redirect("/admin/dashboard");
            }
          } else {
            req.flash("error", "email or password is incorrect!");
            res.redirect("/");
          }
        } else {
          req.flash("error", "You are not a registered user!");
          res.redirect("/");
        }
      } else {
        req.flash("error", "All Fields are requiered");
        res.redirect("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  static logout = async (req, res) => {
    try {
      res.clearCookie("token");
      res.redirect("/");
    } catch (error) {
      console.log("error");
    }
  };

  static dashboard = async (req, res) => {
    try {
      // console.log(req.user)
      const { name, email, id, image } = req.user;
      const btech = await CourseModel.findOne({ user_id: id, course: "btech" });
      const bca = await CourseModel.findOne({ user_id: id, course: "bca" });
      const mca = await CourseModel.findOne({ user_id: id, course: "mca" });
      res.render("dashboard", {
        n: name,
        image: image,
        b: btech,
        bca: bca,
        mca: mca,
      });
    } catch (error) {
      console.log(error);
    }
  };

  static profile = async (req, res) => {
    try {
      const { name, email, _id, image ,mobile } = req.user;
      const data = await UserModel.find()
      res.render('profile',{n:name,image:image,id:_id,e:email,m:mobile,d:data});
    } catch (error) {
      console.log(error);
    }
  };

  static aboutus = async (req, res) => {
    try {
      const { name, email, _id, image ,mobile } = req.user;
      const data = await UserModel.find()
      res.render('aboutus',{n:name,image:image,id:_id,e:email,m:mobile,d:data});
    } catch (error) {
      console.log(error);
    }
  };
  
  static contact = async (req, res) => {
    try {
      const { name, email, _id, image ,mobile } = req.user;
      const data = await UserModel.find()
      res.render('contact',{n:name,image:image,id:_id,e:email,m:mobile,d:data});
    } catch (error) {
      console.log(error);
    }
  };

  static change_password = async (req, res) => { 
    try {
      const { name, email, id, image } = req.user;
      // console.log(req.body)
      const { oldpassword, newpassword, cpassword } = req.body;
      if (oldpassword && newpassword && cpassword) {
        const user = await UserModel.findById(id);
        const ismatch = await bcrypt.compare(oldpassword, user.password);
        if (!ismatch) {
          req.flash("error", "Old Password is incorrect");
          res.redirect("/profile");
        } else {
          if (newpassword !== cpassword) {
            req.flash("error", "password does not match");
            res.redirect("/profile");
          } else {
            const newHashpassword = await bcrypt.hash(newpassword, 10);
            await UserModel.findByIdAndUpdate(id, {
              $set: { password: newHashpassword },
            });
            req.flash("success", "password changed succesfully");
            res.redirect("/profile");
          }
        }
      } else {
        req.flash("error", "Incorrect password");
        res.redirect("/profile");
      }
    } catch (error) {
      console.log(error);
    }
  };

  static profile_update = async (req, res) => {
    try {
        //console.log(req.files.image)
        if (req.files) {
            const user = await UserModel.findById(req.user.id);
            const image_id = user.image.public_id;
            await cloudinary.uploader.destroy(image_id);

            const file = req.files.image;
            const myimage = await cloudinary.uploader.upload(file.tempFilePath, {
                folder: "Admissionabhay",

            });
            var data = {
                name: req.body.name,
                email: req.body.email,
                image: {
                    public_id: myimage.public_id,
                    url: myimage.secure_url,
                },
            };
        } else {
            var data = {
                name: req.body.name,
                email: req.body.email,

            }
        }
        const update_profile = await UserModel.findByIdAndUpdate(req.user.id, data)
        res.redirect('/profile')
    } catch (error) {
        console.log(error)
    }
  };

  static sendEmail = async (name, email) => {
  // console.log("email sending")
  //consollog("propertyName")
  // console.log(email)

  //connenct with the smtp server

  let transporter = await nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,

    auth: {
      user: "sshubham2405@gmail.com",
      pass: "ouzruhsesecjvnch",
    },
  });
  let info = await transporter.sendMail({
    from: "test@gmail.com", // sender address
    to: email, // list of receivers
    subject: "Create  Registration Succesfully", // Subject line
    text: "hello", // plain text body
    html: `<b>${name}</b> Registration is successful! please login.. `, // html body
  });
  //console.log("Messge sent: %s", info.messageId);
};

}

module.exports = FrontController;
