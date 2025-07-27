"use strict";
import User from "../entity/user.entity.js";
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";

async function createUsers() {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const count = await userRepository.count();
    if (count > 0) return;

    await Promise.all([
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Diego Alexis Salazar Jara",
          rut: "21.308.770-3",
          email: "administrador2024@gmail.cl",
          telefono: "987654321",
          whatsapp: "987654321",
          departamento: "No asignado",
          password: await encryptPassword("admin1234"),
          rol: "administrador",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Diego Sebastián Ampuero Belmar",
          rut: "21.151.897-9",
          email: "usuario1.2024@gmail.cl",
          telefono: "987654321",
          whatsapp: "987654321",
          departamento: "Departamento 101",
          password: await encryptPassword("user1234"),
          rol: "presidente",
        })
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Alexander Benjamín Marcelo Carrasco Fuentes",
          rut: "20.630.735-8",
          email: "usuario2.2024@gmail.cl",
          telefono: "987654321",
          whatsapp: "987654321",
          departamento: "Departamento 102",
          password: await encryptPassword("user1234"),
          rol: "secretario",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Pablo Andrés Castillo Fernández",
          rut: "20.738.450-K",
          email: "usuario3.2024@gmail.cl",
          telefono: "987654321",
          whatsapp: "987654321",
          departamento: "Departamento 103",
          password: await encryptPassword("user1234"),
          rol: "tesorero",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Felipe Andrés Henríquez Zapata",
          rut: "20.976.635-3",
          email: "usuario4.2024@gmail.cl",
          telefono: "987654321",
          whatsapp: "987654321",
          departamento: "Departamento 104",
          password: await encryptPassword("user1234"),
          rol: "usuario",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Diego Alexis Meza Ortega",
          rut: "21.172.447-1",
          email: "usuario5.2024@gmail.cl",
          telefono: "987654321",
          whatsapp: "987654321",
          departamento: "Departamento 104",
          password: await encryptPassword("user1234"),
          rol: "usuario",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Juan Pablo Rosas Martin",
          rut: "20.738.415-1",
          email: "usuario6.2024@gmail.cl",
          telefono: "987654321",
          whatsapp: "987654321",
          departamento: "Departamento 105",
          password: await encryptPassword("user1234"),
          rol: "usuario",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Paula Angélica Labra Soto",
          rut: "11.111.111-1",
          email: "paulalabra18@gmail.com",
          telefono: "987654321",
          whatsapp: "987654321",
          departamento: "Departamento 106",
          password: await encryptPassword("user1234"),
          rol: "usuario",
        }),
      ),
    ]);
    console.log("* => Usuarios creados exitosamente");
  } catch (error) {
    console.error("Error al crear usuarios:", error);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////7
import { EspacioComunSchema } from "../entity/reserva.entity.js";
async function createEspaciosComunes() {
  try {
    const espacioRepository = AppDataSource.getRepository(EspacioComunSchema);
    const count = await espacioRepository.count();
    if (count > 0) return;

    await Promise.all([
      espacioRepository.save(
        espacioRepository.create({
          id_espacio: 1,
          nombre: "Quincho",
          descripcion: "Quincho techado",
          disponibilidad: true,
        })
      ),
      espacioRepository.save(
        espacioRepository.create({
          id_espacio: 2,
          nombre: "Sala Multiuso",
          descripcion: "Sala para eventos y reuniones",
          disponibilidad: true,
        })
      ),
      espacioRepository.save(
        espacioRepository.create({
          id_espacio: 3,
          nombre: "Patio",
          descripcion: "Patio de juegos para niños",
          disponibilidad: true,
        })
      ),
    ]);
    console.log("* => Espacios comunes creados exitosamente");
  } catch (error) {
    console.error("Error al crear espacios comunes:", error);
  }
}

export { createEspaciosComunes };

export { createUsers };