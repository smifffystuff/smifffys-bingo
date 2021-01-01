const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.signup = functions.auth.user().onCreate(user => {
  return admin.firestore().collection('users').doc(user.uid).set({
    email: user.email,
    isAdmin: false,
  });
});

exports.delete = functions.auth.user().onDelete(user => {
  const doc = admin.firestore().collection('users').doc(user.uid);
  return doc.delete();
});

exports.getNickname = functions.https.onCall(async (data, context) => {
  const userId = data.userId;
  const user = await admin.auth().getUser(userId);
  return user.displayName;
});
