import { Router } from 'express';
import { executeApiTest } from '../services/apiExecuter.ts';

const router = Router();

router.post('/execute', async (req, res) => {
  const result = await executeApiTest(req.body);
  res.json(result);
});

export default router;
