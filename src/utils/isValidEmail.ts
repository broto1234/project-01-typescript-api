// We'll use email validation in 'both' create and update, this logic is a good candidate for a utility.

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default isValidEmail;