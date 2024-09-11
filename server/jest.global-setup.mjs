// jest.global-setup.mjs
import dotenv from 'dotenv';

export default async () => {
  dotenv.config({ path: '.env.test' }); // Ajuste o caminho conforme necessário
};
