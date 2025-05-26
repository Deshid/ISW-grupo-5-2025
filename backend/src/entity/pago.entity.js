"use strict";

import { EntitySchema, JoinColumn } from "typeorm";
import UserSchema from "./user.entity.js";

//id_pago, rut_residente, nombre_residente MER

const PagoSchema = new EntitySchema ({
    name: "Pago",
    tableName: "pagos",

    columns:{
        idPago: {
            type: "int",
            primary: true,
            generated: true,
        },

        monto:{
            type: "int",
            nullable: false,
        },

        mes: {
            type: "varchar",
            length: "10",
            nullable: false,
        },

        fechaPago:{
            type: "timestamp with time zone",
            nullable: false,
            default: ()=>"CURRENT_TIMESTAMP",

        },

        metodo:{
            type: "varchar",
            length: "20",
            nullable: false,

        },
        userId: { 
            type: "int",
            nullable: false,
        },
    },

    relations:{
            user: {
                type: "many-to-one",
                target: "User",
                joinColumn: {
                    name: "userId",
                    referencedColumnName: "id"
                },
                eager: true,
                cascade: false,
            },
        },


});

export default PagoSchema;

