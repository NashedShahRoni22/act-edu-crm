export function emailToForm(email) {
  return {
    email_id: email.email_id || "",
    display_name: email.config?.display_name || "",
    signature: email.signature_content || "",
    status: email.status === "Active" ? "1" : "0",
    incoming_type: email.config?.incoming_type || "all",
    shared_users: email.shared_user_ids || [],
  };
}

export function buildFormData(formData, isEdit = false) {
  const fd = new FormData();
  if (isEdit) fd.append("_method", "PUT");
  fd.append("email_id", formData.email_id.trim());
  fd.append("status", formData.status);
  fd.append("incoming_type", formData.incoming_type);
  if (formData.display_name) fd.append("display_name", formData.display_name.trim());
  if (formData.signature) fd.append("signature", formData.signature.trim());
  formData.shared_users.forEach((id, i) => fd.append(`shared_users[${i}]`, id));
  return fd;
}

export function getSharedUserNames(email, users = []) {
  const fromDisplay =
    typeof email.user_sharing_display === "string"
      ? email.user_sharing_display
          .split(",")
          .map((name) => name.trim())
          .filter(Boolean)
      : [];

  const sharedIds = Array.isArray(email.shared_user_ids)
    ? email.shared_user_ids
    : [];

  const fromIds = sharedIds
    .map((id) => users.find((u) => String(u.id) === String(id))?.name)
    .filter(Boolean);

  const fromObjects = Array.isArray(email.shared_users)
    ? email.shared_users.map((u) => u?.name).filter(Boolean)
    : [];

  return Array.from(new Set([...fromDisplay, ...fromIds, ...fromObjects]));
}
