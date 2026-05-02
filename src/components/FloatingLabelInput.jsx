export default function FloatingLabelInput({
  label,
  type = 'text',
  value,
  onChange,
  multiline = false,
  required = false,
  ...props
}) {
  const hasValue = value && value.length > 0;

  if (multiline) {
    return (
      <div className="float-input">
        <textarea
          value={value}
          onChange={onChange}
          placeholder=" "
          rows={4}
          required={required}
          {...props}
        />
        <label className="float-input__label">{label}</label>
      </div>
    );
  }

  return (
    <div className="float-input">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        required={required}
        {...props}
      />
      <label className="float-input__label">{label}</label>
    </div>
  );
}
