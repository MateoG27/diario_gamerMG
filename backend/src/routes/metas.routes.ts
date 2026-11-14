import { Router } from 'express';
import * as controller from '../controllers/metas.controller';

const router = Router();

// Se monta sobre /api: no hay rutas para reactivar, reemplazar ni borrar metas.
router.post('/videojuegos/:id/metas', controller.crear);
router.get('/videojuegos/:id/metas', controller.listarPorVideojuego);
router.get('/metas/:metaId', controller.obtener);
router.patch('/metas/:metaId', controller.actualizar);
router.post('/metas/:metaId/desactivar', controller.desactivar);

export default router;
