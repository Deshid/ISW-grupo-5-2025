"use strict";
import { EntitySchema } from "typeorm";

const ReclamoSchema = new EntitySchema({
    name: "Reclamo",
    tableName: "reclamos",
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: true,
        },
        fecha: {
            type: Date,
            default: () => "CURRENT_TIMESTAMP",
            },
        descripcion: {
            type: String,
            length: 500,
            },
        estado: {
            type: String,
            length: 50,
            default: "Pendiente",
            },
        usuarioId: {
            type: Number,
            nullable: false,
            },
        },
        relations: {
            usuario: {
                type: "many-to-one",
                target: "Usuario",
                joinColumn: { name: "usuarioId" },
            },
        },
        relations: {
            usuario: {
                type: "many-to-one",
                target: "User",
                joinColumn: true,
                nullable: true,
            },
        },
});

export default ReclamoSchema;