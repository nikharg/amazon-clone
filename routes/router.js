const express = require("express");
const router = new express.Router();
const products = require("../models/productsSchema");
const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");

// get the products data

router.get("/products", async (req, res) => {
  try {
    const productsdata = await products.find();
    res.status(201).json(productsdata);
  } catch (error) {
    console.log("error" + error.message);
  }
});

// register user
router.post("/signup", async (req, res) => {
  const { fname, email, mobile, password, cpassword } = req.body;

  if (!fname || !email || !mobile || !password || !cpassword) {
    res.status(422).json({ error: "Fill the all the details" });
  }

  try {
    const preUser = await User.findOne({ email: email });

    if (preUser) {
      res.status(422).json({ error: "This email already exists" });
    } else if (password !== cpassword) {
      res.status(422).json({ error: "Passwords do not match" });
    } else {
      const finaluser = new User({
        fname,
        email,
        mobile,
        password,
        cpassword,
      });
      const storeData = await finaluser.save();
      res.status(201).json(storeData);
    }
  } catch (error) {
    res.status(422).send(error);
  }
});

// login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Fill all the details" });
  }
  try {
    const userlogin = await User.findOne({ email: email });
    if (userlogin) {
      const isMatch = await bcrypt.compare(password, userlogin.password);
      if (!isMatch) {
        res
          .status(400)
          .json({ error: "Invalid Eamil and Password Combination" });
      } else {
        const token = await userlogin.generateAuthtoken();
        res.cookie("AmazonClone", token, {
          expires: new Date(Date.now() + 900000),
          httpOnly: true,
        });
        res.status(201).json(userlogin);
      }
    } else {
      res.status(400).json({ error: "user not exist" });
    }
  } catch (error) {
    res.status(400).json({ error: "Invalid Credentials" });
  }
});

// getindividual

router.get("/product/:id", async (req, res) => {
  try {
    const product = await products.findOne({ id: req.params.id });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json(error);
  }
});

// adding product into cart
router.post("/addcart/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const cart = await products.findOne({ id: id });

    const UserContact = await User.findOne({ _id: req.userID });

    if (UserContact) {
      const cartData = await UserContact.addCartProd(cart);
      await UserContact.save();
      res.status(201).json(UserContact);
    }
  } catch (error) {
    console.log(error);
  }
});

// get data into the cart
router.get("/cartdetails", authenticate, async (req, res) => {
  try {
    const buyuser = await User.findOne({ _id: req.userID });
    res.status(201).json(buyuser);
  } catch (error) {
    console.log(error);
  }
});

// get user is login or not
router.get("/validuser", authenticate, async (req, res) => {
  try {
    const validuserone = await User.findOne({ _id: req.userID });
    res.status(201).json(validuserone);
  } catch (error) {
    console.log(error);
  }
});

// for userlogout

router.get("/logout", authenticate, async (req, res) => {
  try {
    req.rootUser.tokens = req.rootUser.tokens.filter((tkn) => {
      return tkn.token !== req.token;
    });

    res.clearCookie("AmazonClone", { path: "/" });
    req.rootUser.save();
    res.status(201).json(req.rootUser.tokens);
  } catch (error) {
    console.log(error);
  }
});

// // remove item from the cart

router.delete("/remove/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    req.rootUser.carts = req.rootUser.carts.filter((item) => {
      return item.id != id;
    });

    req.rootUser.save();
    res.status(201).json(req.rootUser);
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
