// Escape characters to ensure valid and safe SQL input
export const sanitize = (text: string) => {
  const re = new RegExp(/[-[\]{}@()!=*+?.,\\^$|#\s]/, "g");
  return text.replace(re, "\\$&");
};