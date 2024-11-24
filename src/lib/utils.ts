export const isFormDataFieldsValid = (formData: FormData, allowed: string[]) => {
  const disallowed = [];
  for (const field of formData.keys()) {
    if (!allowed.includes(field)) disallowed.push(field);
  }
  return disallowed.length !== 0;
};
