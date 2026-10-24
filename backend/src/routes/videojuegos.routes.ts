import { Router } from 'express';
import * as controller from '../controllers/videojuegos.controller';

const router = Router();

router.get('/', controller.listar);
router.post('/', controller.crear);
router.get('/:id/resumen', controller.obtenerResumen);
router.get('/:id', controller.obtener);
router.put('/:id', controller.actualizar);
router.patch('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

router.get('/:id/partidas', controller.listarPartidas);
router.patch('/:id/logros', controller.marcarLogro);

export default router;
