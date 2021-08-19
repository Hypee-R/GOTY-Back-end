import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://login-app-udemy-a10ad-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.json({
      mensaje: 'Hola Mundo desde Firebase Functions!'
  });
});

export const getGOTY = functions.https.onRequest(async (request, response) => {
    //const nombre = request.query.nombre || 'sin nombre';
    const gotyRef = db.collection('goty');
    const docSnap = await gotyRef.get();
    const juegos = docSnap.docs.map(doc => doc.data() );

    response.json(juegos);
});

//Express
const app = express();
app.use( cors( {origin: true} ) );

app.get('/goty', async (req, res)=> {

    const gotyRef = db.collection('goty');
    const docSnap = await gotyRef.get();
    const juegos = docSnap.docs.map(doc => doc.data() );

    res.json(juegos);

});

app.post('/goty/:id', async (req, res)=> {

  const id = req.params.id;
  const gameRef = db.collection('goty').doc( id );
  const gameSnap = await gameRef.get();

  if(!gameSnap.exists){
    res.status(404).json({
      ok: false,
      mensaje: 'No existe un juego con el ID: '+id
    })
  }else{

    const antes = gameSnap.data() || {votos: 0};
    await gameRef.update({
      votos: antes.votos + 1
    })

    res.json({
      ok: true,
      mensaje: `Gracias por tu voto a ${antes.name}`
    });

  }

});

//Otra manera de hacer es
//exports.api --- asi nada más
export const api = functions.https.onRequest( app );