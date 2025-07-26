const generateInviteCode = (length: number) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (const _ of new Array(length)) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
};

export default generateInviteCode;
