const db = require('../config/db');

class CrudController {
    async obtenerTodos(tabla) {
        try {
            const [resultados] = await db.query(`SELECT * FROM ${tabla}`);
            return resultados;
        } catch (error) {
            throw error;
        }
    }

    async obtenerUno(tabla, idCampo, id) {
        try {
            const [resultado] = await db.query(`SELECT * FROM ?? WHERE ?? = ?`, [tabla, idCampo, id]);
            return resultado[0];
        } catch (error) {
            throw error;
        }
    }

    async crear(tabla, data) {
        try {
            const [resultado] = await db.query(`INSERT INTO ?? SET ?`, [tabla, data]);
            return { ...data, id: resultado.insertId };
        } catch (error) {
            throw error;
        }
    }

    async actualizar(tabla, idCampo, id, data) {
        try {
            const [resultado] = await db.query(`UPDATE ?? SET ? WHERE ?? = ?`, [tabla, data, idCampo, id]);
            if (resultado.affectedRows === 0) {
                throw new Error('Registro no encontrado');
            }
            return await this.obtenerUno(tabla, idCampo, id);
        } catch (error) {
            throw error;
        }
    }

    async eliminar(tabla, idCampo, id) {
        try {
            const [resultado] = await db.query(`DELETE FROM ?? WHERE ?? = ?`, [tabla, idCampo, id]);
            if (resultado.affectedRows === 0) {
                throw new Error('Registro no encontrado');
            }
            return { mensaje: 'Registro eliminado correctamente' };
        } catch (error) {
            throw error;
        }
    }

    async obtenerTodosPorCampo(tabla, campo, valor) {
        try {
            const [resultados] = await db.query(`SELECT * FROM ?? WHERE ?? = ?`, [tabla, campo, valor]);
            return resultados;
        } catch (error) {
            throw error;
        }
    }
}

// exportar la clase:
module.exports = CrudController;

// O una instancia directamente (más común si es un solo CRUD):
// module.exports = new CrudController();
