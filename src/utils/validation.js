export default class Validation {
   static username(username) {
      return /^[a-zA-Z0-9_]{3,15}$/.test(username);
   }

   static email(email) {
      return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
   }

   static fullName(fullName) {
      return /^[a-zA-Z ]{2,30}$/.test(fullName);
   }

   static password(password) {
      return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
   }
}