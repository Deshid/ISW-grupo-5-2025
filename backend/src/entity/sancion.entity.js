"use strict";
import { EntitySchema } from "typeorm";

export const SancionSchema = new EntitySchema({
    name: "Sancion",
    tableName: "sancion",
    columns: {
        id_sancion: {
            type: "int",
            primary: true,
            generated: true,
        },
        fecha_inicio: {
            type: "date",
            nullable: false,
        },
        fecha_fin: {
            type: "date",
            nullable: false,
        },
        motivo: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
    },
    relations: {
        usuario: {
            type: "many-to-one",
            target: "User",
            inverseSide: "sanciones",
            joinColumn: { name: "usuarioId" },
        },
        admin: {
            type: "many-to-one",
            target: "User",
            inverseSide: "sancionesAplicadas",
            joinColumn: { name: "adminId" },
            nullable: true,
        },
    },
});