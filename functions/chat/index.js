const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.post = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'only auithenticated users can create new games'
    );
  }
  if (data.message.length > 30) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'messages must be no more that 30 characters long'
    );
  }
  const currentUser = admin.auth().getUser(context.auth.uid);
  return admin
    .firestore()
    .collection('messages')
    .add({
      userId: context.auth.uid,
      userName: (await currentUser).displayName,
      gameId: data.gameId,
      message: data.message,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
    });
});

exports.cleanMessages = functions.firestore
  .document('games/{gameId}')
  .onDelete(async (snap, context) => {
    const msgSnap = await admin
      .firestore()
      .collection('messages')
      .where('gameId', '==', context.params.gameId)
      .get();
    var batch = admin.firestore().batch();
    msgSnap.forEach(doc => batch.delete(doc.ref));
    return batch.commit();
  });
