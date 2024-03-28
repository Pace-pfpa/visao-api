import axios from "axios";
import dotenv from 'dotenv';

dotenv.config();

export const Sapiens = axios.create({
    baseURL: 'https://sapiens.agu.gov.br/',
});

export {axios};