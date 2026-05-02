import { useState, useEffect } from 'react';
import FloatingLabelInput from './FloatingLabelInput';
import { decryptText } from './AuthProvider';

const emptyForm = {
  title: '',
  category: '',
  totalAmount: '',
  remainAmount: '',
  description: '',
  expireDate: '',
};

export default function AddCoupon({ onClose, onSubmit, couponToUpdate }) {
  const isEdit = !!couponToUpdate;
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (couponToUpdate) {
      setForm({
        title: couponToUpdate.title ?? '',
        category: couponToUpdate.category ?? '',
        totalAmount: couponToUpdate.totalAmount ?? '',
        remainAmount: couponToUpdate.remainAmount ?? '',
        description: decryptText(couponToUpdate.description ?? ''),
        expireDate: couponToUpdate.expireDate
          ? new Date(couponToUpdate.expireDate).toISOString().split('T')[0]
          : '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [couponToUpdate]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title: form.title,
      category: form.category,
      totalAmount: form.totalAmount,
      remainAmount: form.remainAmount,
      description: form.description,
      expireDate: form.expireDate ? new Date(form.expireDate) : null,
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal__title">{isEdit ? 'עריכת קופון' : 'הוספת קופון חדש'}</h2>
        <form onSubmit={handleSubmit}>
          <FloatingLabelInput label="כותרת" value={form.title} onChange={set('title')} required />
          <FloatingLabelInput label="קטגוריה" value={form.category} onChange={set('category')} />
          <FloatingLabelInput label="מחיר" type="number" value={form.totalAmount} onChange={set('totalAmount')} />
          <FloatingLabelInput label="כמה נשאר" type="number" value={form.remainAmount} onChange={set('remainAmount')} />
          <div className="float-input">
            <input type="date" value={form.expireDate} onChange={set('expireDate')} placeholder=" " />
            <label className="float-input__label">תאריך תפוגה</label>
          </div>
          <FloatingLabelInput label="מידע / תיאור" value={form.description} onChange={set('description')} multiline />
          <div className="modal__actions">
            <button type="button" className="btn btn--outline" onClick={onClose}>סגירה</button>
            <button type="submit" className="btn btn--primary">{isEdit ? 'עריכה' : 'הוספה'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
