import admin from "firebase-admin";
import serviceAccount from "../../serviceAccountKey.json"

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
console.log(serviceAccount)
export default admin;