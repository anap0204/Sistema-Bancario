import admin from "firebase-admin";
import { readFileSync } from "fs";
import { createRequire } from "module";
import serviceAccount from "./Backend/firebase/firebase.json" with { type: "json" };
import { hashPassword } from "./Backend/extraHelpers/hashHelper.js";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

function generarNumeroCuenta() {

  const primero = Math.floor(Math.random() * 9) + 1;
  const resto = Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join("");
  return `${primero}${resto}`;
}

function saldo(cantidad) {
  return Math.round(cantidad * 100) / 100;
}


// Datos que se guardan en el firestore
const usuariosSeed = [
  {
    nombreCompleto: "Admin Principal",
    email: "admin@bancoup.mx",
    password: "Admin#1234",
    rol: "admin",
    cuentaBloqueada: false,
    intentosFallidos: 0,
    saldoInicial: saldo(10000.00),
  },
  {
    nombreCompleto: "Ana Martínez López",
    email: "ana.martinez@bancoup.mx",
    password: "Cliente#5678",
    rol: "cliente",
    cuentaBloqueada: false,
    intentosFallidos: 0,
    saldoInicial: saldo(25500.50),
  },
  {
    nombreCompleto: "Carlos Ramírez Torres",
    email: "carlos.ramirez@bancoup.mx",
    password: "Cliente#9012",
    rol: "cliente",
    cuentaBloqueada: false,
    intentosFallidos: 0,
    saldoInicial: saldo(48750.75),
  },
];



async function seed() {
  for (const u of usuariosSeed) {
    if (u.saldoInicial > 50000) {
      throw new Error(`Saldo inicial de ${u.email} supera $50,000: ${u.saldoInicial}`);
    }
  }

  const batch = db.batch();
  const numerosGenerados = new Set();
  const resumen = [];

  for (const usuario of usuariosSeed) {
    const passwordHash = await hashPassword(usuario.password);

    const usuarioRef = db.collection("usuarios").doc();
    const idUsuario = usuarioRef.id;

    batch.set(usuarioRef, {
      idUsuario,
      nombreCompleto: usuario.nombreCompleto,
      email: usuario.email,
      passwordHash,
      rol: usuario.rol,
      cuentaBloqueada: usuario.cuentaBloqueada,
      intentosFallidos: usuario.intentosFallidos,
    });

    let numeroCuenta;
    do {
      numeroCuenta = generarNumeroCuenta();
    } while (numerosGenerados.has(numeroCuenta));
    numerosGenerados.add(numeroCuenta);

    const cuentaRef = db.collection("cuentas").doc(numeroCuenta);

    batch.set(cuentaRef, {
      numeroCuenta,
      idUsuario,
      saldo: usuario.saldoInicial,
      limiteMáximo: saldo(50000.00),
    });

    resumen.push({
      rol: usuario.rol,
      nombre: usuario.nombreCompleto,
      email: usuario.email,
      passwordOriginal: usuario.password,
      numeroCuenta,
      saldo: usuario.saldoInicial,
    });
  }

  await batch.commit();
  process.exit(0);
}

seed().catch((err) => {
  process.exit(1);
});