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
            type: "timestamp with time zone",
            default: () => "CURRENT_TIMESTAMP",
        },
        descripcion: {
            type: String,
            length: 500,
        },
        categoria: {
            type: String,
            length: 50,
        },
        anonimo: {
            type: Boolean,
            default: false,
        },
        estado: {
            type: String,
            length: 50,
            default: "Pendiente",
        },
        comentarioInterno: {
            type: String,
            length: 500,
            nullable: true,
        },
        resolucion: {
            type: String,
            length: 500,
            nullable: true,
        },
        usuarioId: {
            type: Number,
            nullable: true,
        },
    },
    relations: {
        user: {
            type: "many-to-one",
            target: "User",
            joinColumn: true,
            nullable: true,
        },
    },
});

export default ReclamoSchema;