const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();

exports.secureReferralPayout = onDocumentCreated({
  document: "referrals/{referralId}",
  region: "asia-south1"
}, async (event) => {

  const referralData = event.data.data();
  const referrerId = referralData.referrerId;

  if (!referrerId) return;

  if (referralData.processed === true) {
    console.log("Already processed payout. Skipping.");
    return;
  }

  const db = getFirestore();
  const referrerRef = db.collection("users").doc(referrerId);
  const referralDocRef = event.data.ref;

  try {
    await db.runTransaction(async (transaction) => {

      transaction.set(referrerRef, {
        totalEarnings: FieldValue.increment(50),
        totalReferrals: FieldValue.increment(1)
      }, { merge: true });

      transaction.update(referralDocRef, { processed: true });
    });

    console.log(`₹50 credited to user: ${referrerId}`);

  } catch (error) {
    console.error("Payout failed:", error);
  }
});
