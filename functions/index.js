const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();
const filesRef = admin.firestore().collection("files");
const patientsRef = admin.firestore().collection("patients");
const tokenRef = admin.firestore().collection('token');

const onNewReportArrival = functions.firestore.document("files/{file_id}").onWrite(async (change, context) => {
    const test_type = change.after.get('test_type');
    const payload = {
        notification: {
            title: "Your new Report is Ready: " + test_type,
            body: 'new report'//change.after.get('')
        },
        data: {
            type: 'message'
        }
    };

    const phn = change.after.get('associated_patient_phone');

    let token = '';
    const querySnap = await tokenRef.where('associated_patient_phone', '==', phn).get();
    querySnap.forEach(docSnap => {
        token = docSnap.data().token;
    });

    console.log('queried token:', token);
    const messageResponse = admin.messaging().sendToDevice(token, payload);
    console.log('Message Response: ', messageResponse);

});

module.exports = { onNewReportArrival };