export const calculateGST = (amount, rate = 18) => {
  const gstAmount = (amount * rate) / 100;
  const totalWithGst = amount + gstAmount;
  return {
    gstAmount: Number(gstAmount.toFixed(2)),
    totalWithGst: Number(totalWithGst.toFixed(2)),
  };
};

export default calculateGST;
