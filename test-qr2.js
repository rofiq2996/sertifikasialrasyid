import QRCodeStyling from "qr-code-styling";
const qrCode = new QRCodeStyling({ data: "test" });
console.log(typeof qrCode.getRawData);
