import { Router } from 'express';
import * as controller from '../controllers/partidas.controller';

const router = Router();

router.get('/', controller.listar);
router.post('/', controller.crear);
router.patch('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

export default router;
