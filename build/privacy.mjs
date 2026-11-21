// Checks the public page for contact details that must stay private (resume/contact.private.json).

export function privacyProblems(publicHtml, contact) {
  const problems = [];
  const digits = contact.phone.replace(/\D/g, '');
  if (digits && publicHtml.replace(/\D/g, '').includes(digits)) problems.push('the phone number appears on the public site');
  if (/\btel:/i.test(publicHtml)) problems.push('a tel: link appears on the public site');
  return problems;
}
