import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'collegeprojectsecret_12345!';
  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
};

export default generateToken;
