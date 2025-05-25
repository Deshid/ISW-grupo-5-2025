"use strict";
import { EntitySchema } from "typeorm";
import  UserSchema  from "./user.entity.js";
    ///////////////////////////////////////////////////////////////////////////////////
    // ENTIDAD ESPACIO COMUN
    export const EspacioComunSchema = new EntitySchema({
    name: "EspacioComun",
    tableName: "espacios_comunes",
    columns: {
        id_espacio: {
        type: "int",
        primary: true,
        generated: true,
        },
        nombre: {
        type: "varchar",
        length: 100,
        nullable: false,
        unique: true,
        },
        descripcion: {
        type: "varchar",
        length: 255,
        nullable: true,
        },
        disponibilidad: {
        type: "boolean",
        default: true,
        },
    },
    });

    // ENTIDAD RESERVA
    export const ReservaSchema = new EntitySchema({
    name: "Reserva",
    tableName: "reservas",
    columns: {
        id: {
        type: "int",
        primary: true,
        generated: true,
        },
        fecha: {
        type: "date",
        nullable: false,
        },
        horaInicio: {
        type: "time",
        nullable: false,
        },
        horaFin: {
        type: "time",
        nullable: false,
        },
        estado: {
        type: "varchar",
        length: 30,
        default: "pendiente"
    },
    },
    relations: {
        usuario: {
        type: "many-to-one",
        target: "User",
        joinColumn: true,
        nullable: false,
        },
        espacioComun: {
        type: "many-to-one",
        target: "EspacioComun",
        joinColumn: true,
        nullable: false,
        },
    }
    });
