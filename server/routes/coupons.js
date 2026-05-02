import { Router } from 'express';
import { query } from '../db/postgres.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM coupons WHERE user_id = $1 ORDER BY purchase_date DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, category, totalAmount, remainAmount, description, expireDate } = req.body;
    const result = await query(
      `INSERT INTO coupons (user_id, title, category, total_amount, remain_amount, description, expire_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.userId, title ?? '', category ?? '', totalAmount || 0, remainAmount || 0, description ?? '', expireDate || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, category, totalAmount, remainAmount, description, expireDate } = req.body;
    const result = await query(
      `UPDATE coupons
       SET title=$1, category=$2, total_amount=$3, remain_amount=$4, description=$5, expire_date=$6
       WHERE id=$7 AND user_id=$8
       RETURNING *`,
      [title ?? '', category ?? '', totalAmount || 0, remainAmount || 0, description ?? '', expireDate || null, req.params.id, req.userId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'קופון לא נמצא' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

router.patch('/:id/used', async (req, res) => {
  try {
    const result = await query(
      `UPDATE coupons SET is_used = NOT is_used WHERE id=$1 AND user_id=$2 RETURNING *`,
      [req.params.id, req.userId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'קופון לא נמצא' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM coupons WHERE id=$1 AND user_id=$2',
      [req.params.id, req.userId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'קופון לא נמצא' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

export default router;
