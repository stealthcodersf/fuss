/**
 * Module dependencies.
 */
import * as express from "express";
import * as compression from "compression";  // compresses requests
import * as session from "express-session";
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import * as errorHandler from "errorhandler";
import * as lusca from "lusca";
import * as dotenv from "dotenv";
import * as mongo from "connect-mongo";
import * as flash from "express-flash";
import * as path from "path";
import * as mongoose from "mongoose";
import * as passport from "passport";
import expressValidator = require("express-validator");


const MongoStore = mongo(session);

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env.example" });


/**
 * Controllers (route handlers).
 */
import * as homeController from "./controllers/home";
import * as userController from "./controllers/user";
import * as apiController from "./controllers/api";
import * as contactController from "./controllers/contact";
import * as avTierController from "./controllers/antiVirusTier";
import * as usageTierController from "./controllers/usageTier";
import * as planController from "./controllers/plan";
import * as paymentMethodController from "./controllers/paymentMethod";
import * as subscriptionController from "./controllers/subscription";
import * as applicationController from "./controllers/application";
import * as scanResultController from "./controllers/scanResult";
import * as uploadController from "./controllers/upload";

/**
 * API keys and Passport configuration.
 */
import * as passportConfig from "./config/passport";

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);

mongoose.connection.on("error", () => {
  console.log("MongoDB connection error. Please make sure MongoDB is running.");
  process.exit();
});



/**
 * Express configuration.
 */
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
      req.path !== "/login" &&
      req.path !== "/signup" &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
      req.path == "/account") {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get("/", homeController.index);
app.get("/login", userController.getLogin);
app.post("/login", userController.postLogin);
app.get("/logout", userController.logout);
app.get("/forgot", userController.getForgot);
app.post("/forgot", userController.postForgot);
app.get("/reset/:token", userController.getReset);
app.post("/reset/:token", userController.postReset);
app.get("/signup", userController.getSignup);
app.post("/signup", userController.postSignup);
app.get("/contact", contactController.getContact);
app.post("/contact", contactController.postContact);
app.get("/account", passportConfig.isAuthenticated, userController.getAccount);
app.post("/account/profile", passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post("/account/password", passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post("/account/delete", passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get("/account/unlink/:provider", passportConfig.isAuthenticated, userController.getOauthUnlink);

app.get("/antivirustier", avTierController.getAntiVirusTiers);
app.post("/antivirustier", avTierController.createAntiVirusTier);
app.put("/antivirustier/:id", avTierController.updateAntiVirusTier);
app.delete("/antivirustier/:id", avTierController.deleteAntiVirusTier);

app.get("/usagetier", usageTierController.getUsageTiers);
app.post("/usagetier", usageTierController.createUsageTier);
app.put("/usagetier/:id", usageTierController.updateUsageTier);
app.delete("/usagetier/:id", usageTierController.deleteUsageTier);

app.get("/plan", planController.getPlans);
app.post("/plan", planController.createPlan);
app.put("/plan/:id", planController.updatePlan);
app.delete("/plan/:id", planController.deletePlan);

app.get("/user/:uid/paymentmethod", paymentMethodController.getPaymentMethods);
app.post("/user/:uid/paymentmethod", paymentMethodController.createPaymentMethod);
app.put("/user/:uid/paymentmethod/:pmid", paymentMethodController.updatePaymentMethod);
app.delete("/user/:uid/paymentmethod/:pmid", paymentMethodController.deletePaymentMethod);

app.get("/user/:uid/subscription", subscriptionController.getSubscriptions);
app.post("/user/:uid/subscription", subscriptionController.createSubscription);
app.put("/user/:uid/subscription/:sid", subscriptionController.updateSubscription);
app.delete("/user/:uid/subscription/:sid", subscriptionController.deleteSubscription);

app.get("/user/:uid/application", applicationController.getApplications);
app.post("/user/:uid/application", applicationController.createApplication);
app.put("/user/:uid/application/:aid", applicationController.updateApplication);
app.delete("/user/:uid/application/:aid", applicationController.deleteApplication);

app.get("/user/:uid/application/:aid/scanresult", scanResultController.getScanResults);
app.delete("/user/:uid/application/:aid/scanresult/:srid", scanResultController.deleteScanResult);

app.post("/user/:uid/application/:aid/upload", uploadController.processUpload);
app.get("/user/:uid/application/:aid/upload", uploadController.getUpload);
/**
 * API examples routes.
 */
app.get("/api", apiController.getApi);
app.get("/api/facebook", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email", "public_profile"] }));
app.get("/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), (req, res) => {
  res.redirect(req.session.returnTo || "/");
});


/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get("port"), () => {
  console.log(("  App is running at http://localhost:%d in %s mode"), app.get("port"), app.get("env"));
  console.log("  Press CTRL-C to stop\n");
});

module.exports = app;