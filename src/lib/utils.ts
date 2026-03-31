export function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Format as Norwegian phone number (e.g., 123 45 678 or +47 123 45 678)
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5)}`
  }
  
  return phone
}
