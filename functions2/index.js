/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {setGlobalOptions} = require("firebase-functions");
// const {onRequest} = require("firebase-functions/https");
// const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
// setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// const functions = require('firebase-functions');
// const admin = require('firebase-admin');
// admin.initializeApp();

// // This function triggers automatically when a NEW referral is created
// exports.secureReferralPayout = functions.firestore
//     .document('referrals/{referralId}')
//     .onCreate(async (snap, context) => {
//         const referralData = snap.data();
//         const referrerId = referralData.referrerId;

//         // The Admin SDK bypasses your Security Rules to update money safely
//         const referrerRef = admin.firestore().collection('users').doc(referrerId);

//         try {
//             return await referrerRef.update({
//                 totalEarnings: admin.firestore.FieldValue.increment(50),
//                 totalReferrals: admin.firestore.FieldValue.increment(1)
//             });
//         } catch (error) {
//             console.error("Payout failed:", error);
//         }
//     });

//exports.api = require("firebase-functions/v2/https")
//.onRequest(
//{
//region: "asia-south1",
//secrets: [RP_KEY_ID, RP_KEY_SECRET]
//},
//app
//);

//exports.secureReferralPayout = onDocumentCreated(
// {
// document: "referrals/{referralId}",
//region: "asia-south1",
//},
//async (event) => {

//const referralData = event.data.data();
//const referrerId = referralData.referrerId;

//if (!referrerId) return;

//if (referralData.processed === true) {
//console.log("Already processed. Skipping.");
//return;
//}

//const db = getFirestore();
//const referrerRef = db.collection("users").doc(referrerId);
//const referralDocRef = event.data.ref;

//try {
//await db.runTransaction(async (transaction) => {
//transaction.set(
//referrerRef,
//{
//totalEarnings: FieldValue.increment(50),
//totalReferrals: FieldValue.increment(1),
//},
//{ merge: true }
//);

//transaction.update(referralDocRef, { processed: true });
//});

//console.log(`₹50 credited to user: ${referrerId}`);
//} catch (error) {
//console.error("Payout failed:", error);
//}
//}
//);

const { initializeApp } = require("firebase-admin/app");
initializeApp();

const { onRequest } = require("firebase-functions/v2/https");
const Razorpay = require("razorpay");
const express = require("express");
const cors = require("cors");

const app = express();
// ======= FIX added cors to accept requests from any origin ======
// TODO: change the origin to real domain when deployed
app.use(cors({ origin: true }));
app.use(express.json());

let razorpay;

/* Razorpay Instance */
function getRazorpay() {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
}

/* PAYMENT API */
app.post("/create-order", async (req, res) => {
  try {
    const { amount, userId } = req.body;

    if (!amount || !userId) {
      return res.status(400).json({ error: "Amount & userId required" });
    }

    const options = {
      amount: amount * 100, // paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await getRazorpay().orders.create(options);
    // Save order with userId
    const db = getFirestore();
    await db.collection("transactions").add({
      userId,
      orderId: order.id,
      amount,
      status: "created",
      createdAt: FieldValue.serverTimestamp(),
    });
    return res.status(200).json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

/* EXPORT CLOUD FUNCTION */
exports.api = onRequest(
  {
    region: "asia-south1",
    secrets: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"],
  },
  app,
);
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const crypto = require("crypto");

/* VERIFY PAYMENT */
app.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      plan,
      userId,
    } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment fields" });
    }
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Signature" });
    }

    /* SAVE PAYMENT */
    const db = getFirestore();

    await db.collection("payments").add({
      userId,
      plan,
      amount,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      status: "success",
      createdAt: FieldValue.serverTimestamp(),
    });
    let expiryDate = new Date();

    if (plan === "Monthly") {
      expiryDate.setDate(expiryDate.getDate() + 30);
    }

    if (plan === "Yearly") {
      expiryDate.setDate(expiryDate.getDate() + 365);
    }

    /* ACTIVATE USER PLAN */
    await db.collection("users").doc(userId).set(
      {
        activePlan: plan,
        planActivatedAt: FieldValue.serverTimestamp(),
        planExpiry: expiryDate,
      },
      { merge: true },
    );

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
const { onSchedule } = require("firebase-functions/v2/scheduler");

exports.expirePlans = onSchedule(
  {
    schedule: "every day 00:00",
    region: "asia-south1",
  },
  async () => {
    const db = getFirestore();
    const now = new Date();

    const snapshot = await db
      .collection("users")
      .where("planExpiry", "<=", now)
      .get();

    if (snapshot.empty) {
      console.log("No expired plans");
      return;
    }

    const batch = db.batch();

    snapshot.forEach((doc) => {
      batch.update(doc.ref, {
        activePlan: "none",
        planExpired: true,
      });
    });

    await batch.commit();
    console.log("Expired plans updated");
  },
);
require("./referral");
