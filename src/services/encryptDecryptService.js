import CryptoJS from 'crypto-js';
const secretKey = "your-secret-key"

const CryptoService = {
  
  encryptData(data) {
    const stringData = typeof data === 'string' ? data : JSON.stringify(data);
    const encryptedData = CryptoJS.AES.encrypt(stringData, secretKey).toString();
    return encryptedData;
  },

  decryptData(encryptedData) {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);

    try {
      return JSON.parse(decryptedData); 
    } catch (error) {
      console.log(error)
      return decryptedData;
    }
  }
};

export default CryptoService;
