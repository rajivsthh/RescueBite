import { Router } from 'express';

const router = Router();

router.get('/example', (_req, res) => {
  res.json({ message: 'Example response from RescueBite backend' });
});

export default router;
