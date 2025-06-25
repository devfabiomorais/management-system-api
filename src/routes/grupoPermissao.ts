import express from 'express';
const router = express.Router();
import { getAllPermissions, deletePermission, updatePermission, registerPermission, getAllGroupPermissions, getPermissionsByGroupAndModule, cancelPermission } from '../controllers/gruposPermissaoController.js';
import auth from '../middleware/auth.js';

router.post('/register', auth, registerPermission);
router.delete('/:id', auth, deletePermission);
router.put('/cancel/:id', auth, cancelPermission);
router.put('/edit/:id', auth, updatePermission);
router.get('/', auth, getAllPermissions);
router.get('/groups', auth, getAllGroupPermissions);
router.get('/groups/permissions/:userGroupId/:moduleName', auth, getPermissionsByGroupAndModule)

export default router;
